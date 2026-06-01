import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  DashboardBookingUiStatus,
  resolveDashboardBookingUiStatus,
} from '../../common/cms/booking-ui-status';
import {
  formatDisplayDate,
  formatRelativeTimeVi,
  formatTrendPercent,
  formatVndCompact,
  formatVndShortMillion,
  getInitials,
} from '../../common/formator/dashboard.formator';
import {
  DashboardScope,
  getCurrentWeekRange,
  getDashboardDateRange,
  resolveDashboardPeriod,
} from '../../common/helpers/dashboard-scope.helper';
import {
  CmsDashboardOverviewDto,
  CmsDashboardQueryDto,
  CmsDashboardRecentBookingDto,
  CmsDashboardStatCardDto,
  CmsDashboardStatusSliceDto,
  CmsDashboardTopProviderDto,
} from '../../dtos/CMS/CMS_dashboard.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbCompany } from '../../entities/company/company.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { DashboardRepository } from '../../repositories/dashboard.repository';
import { CompanyAccessService } from '../company-access.service';

const CHART_COLORS = {
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
  accent: '#f97316',
} as const;

const STATUS_LABELS: Record<DashboardBookingUiStatus, string> = {
  completed: 'Hoàn thành',
  moving: 'Đang di chuyển',
  pending: 'Chờ xác nhận',
  cancelled: 'Đã hủy',
};

const STATUS_COLORS: Record<DashboardBookingUiStatus, string> = {
  completed: CHART_COLORS.success,
  moving: CHART_COLORS.info,
  pending: CHART_COLORS.warning,
  cancelled: CHART_COLORS.error,
};

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'CN',
  2: 'T2',
  3: 'T3',
  4: 'T4',
  5: 'T5',
  6: 'T6',
  7: 'T7',
};

const VEHICLE_TYPE_COLORS = [
  CHART_COLORS.accent,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  '#a855f7',
  '#ec4899',
];

const MONTH_LABELS = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
];

@Injectable()
export class CMSDashboardService {
  constructor(
    private readonly companyAccess: CompanyAccessService,
    private readonly dashboardRepository: DashboardRepository,
    private readonly bookingRepository: BookingRepository,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbCompanyTrip)
    private readonly companyTripRepo: Repository<TbCompanyTrip>,
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
  ) {}

  async getOverview(
    user: UserDecoratorDtoResponse,
    query: CmsDashboardQueryDto,
  ): Promise<CmsDashboardOverviewDto> {
    const scope = await this.companyAccess.resolveDashboardScope(
      user,
      query.companyId,
    );
    const period = resolveDashboardPeriod(query.period);
    const range = getDashboardDateRange(period);
    const weekRange = getCurrentWeekRange();
    const isPlatform = this.companyAccess.isPlatformScope(scope);

    const [
      metrics,
      revenueSeries,
      revenueMomPercent,
      weeklyRows,
      vehicleTypes,
      topCompanies,
      topRoutes,
      recentPayments,
      statusPayments,
    ] = await Promise.all([
      this.dashboardRepository.getMetricCounts(scope, range),
      this.dashboardRepository.getRevenueSeries(scope, range.from, range.to),
      this.dashboardRepository.sumRevenueMom(scope, range),
      this.dashboardRepository.getWeeklyBookings(
        scope,
        weekRange.from,
        weekRange.to,
      ),
      this.dashboardRepository.getVehicleTypeBreakdown(scope),
      this.dashboardRepository.getTopCompanies(
        scope,
        range.from,
        range.to,
      ),
      scope.companyId != null
        ? this.dashboardRepository.getTopRoutesForCompany(
            scope.companyId,
            range.from,
            range.to,
          )
        : Promise.resolve([]),
      this.dashboardRepository.findRecentPayments(scope, 12),
      this.dashboardRepository.findRecentPayments(scope, 500),
    ]);

    const [usersTotal, providersTotal, vehiclesTotal, revenueTotal] =
      await Promise.all([
        this.dashboardRepository.countUsers(scope),
        this.dashboardRepository.countProviders(scope),
        this.dashboardRepository.countVehicles(scope),
        this.dashboardRepository.sumRevenue(scope),
      ]);

    const statCards = this.buildStatCards(scope, {
      users: { total: usersTotal, ...metrics.users },
      providers: { total: providersTotal, ...metrics.providers },
      vehicles: { total: vehiclesTotal, ...metrics.vehicles },
      revenue: { total: revenueTotal, ...metrics.revenue },
    });

    const bookingStatusDistribution = await this.buildStatusDistribution(
      statusPayments,
    );
    const recentBookings = await this.buildRecentBookings(recentPayments);
    const recentActivities = this.buildRecentActivities(
      recentPayments,
      recentBookings,
    );
    const topProviders = this.buildTopProviders(
      isPlatform,
      topCompanies,
      topRoutes,
    );

    return {
      scope: scope.type,
      companyId: scope.companyId,
      period,
      statCards,
      revenueSeries: this.formatRevenueSeries(revenueSeries),
      revenueMomPercent,
      bookingStatusDistribution,
      weeklyBookings: this.formatWeeklyBookings(weeklyRows),
      vehicleTypes: vehicleTypes.map((item, index) => ({
        type: item.type,
        count: item.count,
        color: VEHICLE_TYPE_COLORS[index % VEHICLE_TYPE_COLORS.length],
      })),
      topProviders,
      recentActivities,
      recentBookings: recentBookings.slice(0, 10),
    };
  }

  private buildStatCards(
    scope: DashboardScope,
    data: {
      users: { total: number; current: number; previous: number };
      providers: { total: number; current: number; previous: number };
      vehicles: { total: number; current: number; previous: number };
      revenue: { total: number; current: number; previous: number };
    },
  ): CmsDashboardStatCardDto[] {
    const isCompany = scope.companyId != null;
    const userTrend = formatTrendPercent(data.users.current, data.users.previous);
    const providerTrend = formatTrendPercent(
      data.providers.current,
      data.providers.previous,
    );
    const vehicleTrend = formatTrendPercent(
      data.vehicles.current,
      data.vehicles.previous,
    );
    const revenueTrend = formatTrendPercent(
      data.revenue.current,
      data.revenue.previous,
    );

    return [
      {
        key: 'users',
        label: isCompany ? 'Khách hàng' : 'Người dùng',
        value: data.users.total.toLocaleString('vi-VN'),
        icon: '👤',
        iconClass: 'stat-card__icon--blue',
        trend: userTrend.trend,
        trendDir: userTrend.trendDir,
        trendNote: 'so với kỳ trước',
      },
      {
        key: 'providers',
        label: isCompany ? 'Nhà xe' : 'Nhà xe',
        value: data.providers.total.toLocaleString('vi-VN'),
        icon: '🚌',
        iconClass: 'stat-card__icon--orange',
        trend: providerTrend.trend,
        trendDir: providerTrend.trendDir,
        trendNote: 'so với kỳ trước',
      },
      {
        key: 'vehicles',
        label: 'Số lượng xe',
        value: data.vehicles.total.toLocaleString('vi-VN'),
        icon: '🚗',
        iconClass: 'stat-card__icon--yellow',
        trend: vehicleTrend.trend,
        trendDir: vehicleTrend.trendDir,
        trendNote: 'so với kỳ trước',
      },
      {
        key: 'revenue',
        label: 'Doanh thu',
        value: formatVndCompact(data.revenue.total),
        icon: '💰',
        iconClass: 'stat-card__icon--green',
        trend: revenueTrend.trend,
        trendDir: revenueTrend.trendDir,
        trendNote: 'so với kỳ trước',
      },
    ];
  }

  private formatRevenueSeries(
    rows: { period: string; revenue: number; bookings: number }[],
  ) {
    return rows.map((row) => {
      const monthIndex = Number(row.period.split('-')[1]) - 1;
      return {
        month: MONTH_LABELS[monthIndex] ?? row.period,
        revenue: row.revenue,
        bookings: row.bookings,
      };
    });
  }

  private formatWeeklyBookings(
    rows: { dayIndex: number; completed: number; cancelled: number }[],
  ) {
    const byDay = new Map(rows.map((row) => [row.dayIndex, row]));
    const order = [2, 3, 4, 5, 6, 7, 1];
    return order.map((dayIndex) => {
      const row = byDay.get(dayIndex);
      return {
        day: WEEKDAY_LABELS[dayIndex],
        completed: row?.completed ?? 0,
        cancelled: row?.cancelled ?? 0,
      };
    });
  }

  private async buildStatusDistribution(
    payments: TbPayment[],
  ): Promise<CmsDashboardStatusSliceDto[]> {
    const counts: Record<DashboardBookingUiStatus, number> = {
      completed: 0,
      moving: 0,
      pending: 0,
      cancelled: 0,
    };

    if (payments.length === 0) {
      return (Object.keys(counts) as DashboardBookingUiStatus[]).map(
        (status) => ({
          name: STATUS_LABELS[status],
          value: 0,
          color: STATUS_COLORS[status],
          status,
        }),
      );
    }

    const context = await this.loadPaymentContext(payments);
    for (const payment of payments) {
      const ticket = context.ticketMap.get(payment.ticketId) ?? null;
      const booking = ticket?.bookingId
        ? (context.bookingMap.get(ticket.bookingId) ?? null)
        : null;
      const status = resolveDashboardBookingUiStatus(payment, ticket, booking);
      counts[status] += 1;
    }

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return (Object.keys(counts) as DashboardBookingUiStatus[]).map((status) => ({
      name: STATUS_LABELS[status],
      value: total > 0 ? Math.round((counts[status] / total) * 100) : 0,
      color: STATUS_COLORS[status],
      status,
    }));
  }

  private buildTopProviders(
    isPlatform: boolean,
    companies: {
      companyId: number;
      name: string;
      trips: number;
      revenue: number;
    }[],
    routes: { route: string; trips: number; revenue: number }[],
  ): CmsDashboardTopProviderDto[] {
    if (isPlatform) {
      const maxRevenue = companies[0]?.revenue ?? 0;
      return companies.map((item, index) => ({
        rank: index + 1,
        name: item.name,
        trips: item.trips,
        revenue: formatVndShortMillion(item.revenue),
        pct:
          maxRevenue > 0
            ? Math.round((item.revenue / maxRevenue) * 100)
            : 0,
      }));
    }

    const maxRevenue = routes[0]?.revenue ?? 0;
    return routes.map((item, index) => ({
      rank: index + 1,
      name: item.route,
      trips: item.trips,
      revenue: formatVndShortMillion(item.revenue),
      pct:
        maxRevenue > 0 ? Math.round((item.revenue / maxRevenue) * 100) : 0,
    }));
  }

  private buildRecentActivities(
    payments: TbPayment[],
    bookings: CmsDashboardRecentBookingDto[],
  ) {
    const bookingByKey = new Map(bookings.map((item) => [item.key, item]));
    return payments.slice(0, 5).map((payment, index) => {
      const item = bookingByKey.get(String(payment.id));
      return {
        id: index + 1,
        name: item?.customer ?? payment.customerId,
        initials: getInitials(item?.customer ?? payment.customerId),
        desc: item ? `Đặt vé ${item.route}` : 'Giao dịch mới',
        time: formatRelativeTimeVi(payment.createdAt),
        dot: STATUS_COLORS[item?.status ?? 'pending'],
      };
    });
  }

  private async buildRecentBookings(
    payments: TbPayment[],
  ): Promise<CmsDashboardRecentBookingDto[]> {
    if (payments.length === 0) return [];

    const context = await this.loadPaymentContext(payments);
    const companyIds = [
      ...new Set(payments.map((payment) => payment.companyId)),
    ];
    const companies =
      companyIds.length > 0
        ? await this.companyRepo.find({ where: { id: In(companyIds) } })
        : [];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    return payments.map((payment) => {
      const ticket = context.ticketMap.get(payment.ticketId) ?? null;
      const booking = ticket?.bookingId
        ? (context.bookingMap.get(ticket.bookingId) ?? null)
        : null;
      const companyTrip = context.companyTripMap.get(payment.companyTripId);
      const trip = companyTrip
        ? (context.tripMap.get(companyTrip.tripId) ?? null)
        : null;
      const road = trip ? (context.roadMap.get(trip.roadId) ?? null) : null;
      const company = companyMap.get(payment.companyId);

      const route =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip?.name ?? '—');

      const passengerName = booking?.passenger?.fullName ?? payment.customerId;

      return {
        key: String(payment.id),
        id: ticket?.code
          ? `#${ticket.code}`
          : booking?.code
            ? `#${booking.code}`
            : `#PAY-${payment.id}`,
        customer: passengerName,
        route,
        provider: company?.companyName ?? '—',
        date: formatDisplayDate(ticket?.createdAt ?? payment.createdAt),
        seats: ticket?.totalSeat ?? booking?.totalSeat ?? 0,
        amount: `${Number(payment.amount).toLocaleString('vi-VN')}₫`,
        status: resolveDashboardBookingUiStatus(payment, ticket, booking),
      };
    });
  }

  private async loadPaymentContext(payments: TbPayment[]) {
    const ticketIds = [...new Set(payments.map((p) => p.ticketId))];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const bookingIds = [
      ...new Set(
        tickets
          .map((t) => t.bookingId)
          .filter((id): id is number => id != null),
      ),
    ];
    const bookings =
      bookingIds.length > 0
        ? (
            await Promise.all(
              bookingIds.map((id) => this.bookingRepository.findById(id)),
            )
          ).filter((b): b is TbBooking => b != null)
        : [];
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));

    const companyTripIds = [...new Set(payments.map((p) => p.companyTripId))];
    const companyTrips =
      companyTripIds.length > 0
        ? await this.companyTripRepo.find({ where: { id: In(companyTripIds) } })
        : [];
    const companyTripMap = new Map(companyTrips.map((ct) => [ct.id, ct]));

    const tripIds = [...new Set(companyTrips.map((ct) => ct.tripId))];
    const trips =
      tripIds.length > 0
        ? await this.tripRepo.find({ where: { id: In(tripIds) } })
        : [];
    const tripMap = new Map(trips.map((t) => [t.id, t]));

    const roadIds = [...new Set(trips.map((t) => t.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((r) => [r.id, r]));

    return { ticketMap, bookingMap, companyTripMap, tripMap, roadMap };
  }
}
