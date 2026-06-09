import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  RefundStatus,
} from '../../assets/constants/sales.constants';
import {
  CmsRevenuePageResponseDto,
  CmsRevenueQueryDto,
  CmsRevenueRouteRowDto,
  CmsRevenueTransactionDto,
  CmsRevenueTxnStatus,
} from '../../dtos/CMS/CMS_revenue.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbRefund } from '../../entities/sales/refund.entity';
import {
  RevenueListFilter,
  RevenueRepository,
} from '../../repositories/revenue.repository';
import { CompanyAccessService } from '../company-access.service';
import { CmsPaymentContextService } from './cms-payment-context.service';

@Injectable()
export class CMSRevenueService {
  constructor(
    private readonly companyAccess: CompanyAccessService,
    private readonly revenueRepository: RevenueRepository,
    private readonly paymentContext: CmsPaymentContextService,
  ) {}

  async getPage(
    user: UserDecoratorDtoResponse,
    query: CmsRevenueQueryDto,
  ): Promise<CmsRevenuePageResponseDto> {
    const scope = await this.companyAccess.resolveDashboardScope(
      user,
      query.companyId,
    );
    const filter = this.buildFilter(query);
    const comparisonFilter = this.buildPreviousFilter(filter);

    const payments = await this.revenueRepository.findPayments(scope, filter);
    const [refunds, trend, routeOptions, vehicleOptions] = await Promise.all([
      this.revenueRepository.findRefundsByPaymentIds(payments.map((p) => p.id)),
      this.revenueRepository.getTrend(scope, 6, filter),
      this.revenueRepository.getRouteOptions(scope),
      this.revenueRepository.getVehicleOptions(scope),
    ]);

    const context = await this.paymentContext.load(payments);
    const refundByPayment = this.indexRefunds(refunds);

    let transactions = payments.map((payment) =>
      this.mapTransaction(payment, context, refundByPayment),
    );
    transactions = this.applyClientFilters(transactions, query);

    const byRoute = this.aggregateByRoute(transactions);
    const byRouteWithGrowth = await this.attachRouteGrowth(
      scope,
      byRoute,
      comparisonFilter,
      refundByPayment,
    );

    const overview = await this.buildOverview(
      transactions,
      byRouteWithGrowth,
      scope,
      filter,
      comparisonFilter,
    );

    return {
      scope: scope.type,
      companyId: scope.companyId,
      summary: this.buildSummary(transactions),
      overview,
      trend,
      byRoute: byRouteWithGrowth,
      transactions,
      routeOptions: [
        { value: 'all', label: 'Tất cả tuyến' },
        ...routeOptions.map((route) => ({ value: route, label: route })),
      ],
      vehicleOptions: [
        { value: 'all', label: 'Tất cả phương tiện' },
        ...vehicleOptions.map((code) => ({ value: code, label: code })),
      ],
    };
  }

  private buildFilter(query: CmsRevenueQueryDto): RevenueListFilter {
    const filter: RevenueListFilter = {};
    if (query.dateFrom) {
      const from = new Date(query.dateFrom);
      from.setHours(0, 0, 0, 0);
      filter.dateFrom = from;
    }
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      filter.dateTo = to;
    }
    return filter;
  }

  private buildPreviousFilter(
    filter: RevenueListFilter,
  ): RevenueListFilter | undefined {
    if (!filter.dateFrom || !filter.dateTo) {
      return undefined;
    }
    const spanMs = filter.dateTo.getTime() - filter.dateFrom.getTime();
    const previousTo = new Date(filter.dateFrom.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - spanMs);
    previousFrom.setHours(0, 0, 0, 0);
    return { dateFrom: previousFrom, dateTo: previousTo };
  }

  private indexRefunds(refunds: TbRefund[]) {
    const map = new Map<number, TbRefund[]>();
    for (const refund of refunds) {
      const list = map.get(refund.paymentId) ?? [];
      list.push(refund);
      map.set(refund.paymentId, list);
    }
    return map;
  }

  private mapTransaction(
    payment: TbPayment,
    context: Awaited<ReturnType<CmsPaymentContextService['load']>>,
    refundByPayment: Map<number, TbRefund[]>,
  ): CmsRevenueTransactionDto {
    const route = this.paymentContext.resolveRouteLabel(payment, context);
    const vehicle = this.paymentContext.resolveVehicleCode(payment, context);
    const refunds = refundByPayment.get(payment.id) ?? [];
    const hasRefund = refunds.some((r) => r.status === RefundStatus.SUCCESS);

    return {
      key: String(payment.id),
      id: payment.code ? payment.code : `PAY-${payment.id}`,
      route,
      vehicle,
      createdAt: this.formatDateTime(payment.createdAt),
      bookings: 1,
      revenue: Number(payment.amount),
      status: this.resolveTxnStatus(payment, hasRefund),
    };
  }

  private resolveTxnStatus(
    payment: TbPayment,
    hasRefund: boolean,
  ): CmsRevenueTxnStatus {
    if (hasRefund) return 'refunded';
    if (payment.status === PaymentStatus.SUCCESS) return 'settled';
    return 'processing';
  }

  private applyClientFilters(
    items: CmsRevenueTransactionDto[],
    query: CmsRevenueQueryDto,
  ) {
    let result = items;
    if (query.route && query.route !== 'all') {
      result = result.filter((item) => item.route === query.route);
    }
    if (query.vehicle && query.vehicle !== 'all') {
      result = result.filter((item) => item.vehicle === query.vehicle);
    }
    return result;
  }

  private aggregateByRoute(
    transactions: CmsRevenueTransactionDto[],
  ): CmsRevenueRouteRowDto[] {
    const map = new Map<
      string,
      { route: string; vehicle: string; bookings: number; revenue: number }
    >();

    for (const txn of transactions) {
      if (txn.status === 'refunded') continue;
      const key = `${txn.route}::${txn.vehicle}`;
      const current = map.get(key) ?? {
        route: txn.route,
        vehicle: txn.vehicle,
        bookings: 0,
        revenue: 0,
      };
      current.bookings += txn.bookings;
      current.revenue += txn.revenue;
      map.set(key, current);
    }

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .map((row, index) => ({
        key: `rev-route-${index + 1}`,
        route: row.route,
        vehicle: row.vehicle,
        bookings: row.bookings,
        revenue: row.revenue,
        growth: 0,
      }));
  }

  private async attachRouteGrowth(
    scope: Awaited<ReturnType<CompanyAccessService['resolveDashboardScope']>>,
    rows: CmsRevenueRouteRowDto[],
    comparisonFilter: RevenueListFilter | undefined,
    refundByPayment: Map<number, TbRefund[]>,
  ) {
    if (!comparisonFilter) {
      return rows;
    }

    const previousPayments = await this.revenueRepository.findPayments(
      scope,
      comparisonFilter,
    );
    const previousContext = await this.paymentContext.load(previousPayments);
    const previousTxns = previousPayments.map((payment) =>
      this.mapTransaction(payment, previousContext, refundByPayment),
    );
    const previousByRoute = this.aggregateByRoute(previousTxns);
    const previousMap = new Map(
      previousByRoute.map((row) => [
        `${row.route}::${row.vehicle}`,
        row.revenue,
      ]),
    );

    return rows.map((row) => {
      const prev = previousMap.get(`${row.route}::${row.vehicle}`) ?? 0;
      const growth =
        prev > 0
          ? Math.round(((row.revenue - prev) / prev) * 1000) / 10
          : row.revenue > 0
            ? 100
            : 0;
      return { ...row, growth };
    });
  }

  private async buildOverview(
    transactions: CmsRevenueTransactionDto[],
    byRoute: CmsRevenueRouteRowDto[],
    scope: Awaited<ReturnType<CompanyAccessService['resolveDashboardScope']>>,
    filter: RevenueListFilter,
    comparisonFilter: RevenueListFilter | undefined,
  ) {
    const activeTxns = transactions.filter((t) => t.status !== 'refunded');
    const totalRevenue = activeTxns.reduce((sum, t) => sum + t.revenue, 0);
    const totalBookings = activeTxns.reduce((sum, t) => sum + t.bookings, 0);
    const refundedRevenue = transactions
      .filter((t) => t.status === 'refunded')
      .reduce((sum, t) => sum + t.revenue, 0);
    const strongest = byRoute[0];

    let revenueMomPercent = 0;
    if (comparisonFilter?.dateFrom && comparisonFilter?.dateTo) {
      const previousRevenue = await this.sumActiveRevenue(
        scope,
        comparisonFilter,
      );
      if (previousRevenue > 0) {
        revenueMomPercent =
          Math.round(
            ((totalRevenue - previousRevenue) / previousRevenue) * 1000,
          ) / 10;
      } else if (totalRevenue > 0) {
        revenueMomPercent = 100;
      }
    }

    return {
      totalRevenue,
      totalBookings,
      refundedRevenue,
      averageBookingValue: totalBookings
        ? Math.round(totalRevenue / totalBookings)
        : 0,
      revenueMomPercent,
      strongestRoute: strongest?.route,
      strongestRouteBookings: strongest?.bookings,
      strongestRouteGrowth: strongest?.growth,
    };
  }

  private async sumActiveRevenue(
    scope: Awaited<ReturnType<CompanyAccessService['resolveDashboardScope']>>,
    filter: RevenueListFilter,
  ) {
    const payments = await this.revenueRepository.findPayments(scope, filter);
    const refunds = await this.revenueRepository.findRefundsByPaymentIds(
      payments.map((p) => p.id),
    );
    const refundByPayment = this.indexRefunds(refunds);
    const context = await this.paymentContext.load(payments);
    return payments
      .map((p) => this.mapTransaction(p, context, refundByPayment))
      .filter((t) => t.status !== 'refunded')
      .reduce((sum, t) => sum + t.revenue, 0);
  }

  private buildSummary(transactions: CmsRevenueTransactionDto[]) {
    const active = transactions.filter((t) => t.status !== 'refunded');
    const totalRevenue = active.reduce((sum, t) => sum + t.revenue, 0);
    const totalBookings = active.reduce((sum, t) => sum + t.bookings, 0);

    return [
      {
        key: 'revenue',
        label: 'Doanh thu lọc',
        color: '#22c55e',
        value: totalRevenue,
      },
      {
        key: 'bookings',
        label: 'Booking',
        color: '#3b82f6',
        value: totalBookings,
      },
      {
        key: 'settled',
        label: 'Đã đối soát',
        color: '#f97316',
        value: transactions.filter((t) => t.status === 'settled').length,
      },
      {
        key: 'refunded',
        label: 'Hoàn tiền',
        color: '#ef4444',
        value: transactions.filter((t) => t.status === 'refunded').length,
      },
    ];
  }

  private formatDateTime(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
