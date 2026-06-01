import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DashboardScope } from '../common/helpers/dashboard-scope.helper';
import { PaymentStatus } from '../assets/constants/sales.constants';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { RefundStatus } from '../assets/constants/sales.constants';
import { TbRoad } from '../entities/road.entity';
import { TbVehicle } from '../entities/vehicle.entity';

export interface RevenueListFilter {
  dateFrom?: Date;
  dateTo?: Date;
  route?: string;
  vehicle?: string;
}

export interface RevenueTrendRow {
  period: string;
  revenue: number;
  bookings: number;
}

export interface RevenueRouteAggRow {
  route: string;
  vehicle: string;
  bookings: number;
  revenue: number;
}

@Injectable()
export class RevenueRepository {
  constructor(
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbRefund)
    private readonly refundRepo: Repository<TbRefund>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
  ) {}

  findPayments(scope: DashboardScope, filter: RevenueListFilter = {}) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC');
    this.applyCompanyScope(qb, 'p', scope);
    this.applyDateFilter(qb, 'p', filter);
    return qb.getMany();
  }

  async findRefundsByPaymentIds(paymentIds: number[]) {
    if (paymentIds.length === 0) return [];
    return this.refundRepo.find({
      where: { paymentId: In(paymentIds) },
      order: { id: 'DESC' },
    });
  }

  async getTrend(
    scope: DashboardScope,
    months = 6,
    filter: RevenueListFilter = {},
  ): Promise<RevenueTrendRow[]> {
    const to = filter.dateTo ?? new Date();
    const from = filter.dateFrom ?? new Date(to);
    if (!filter.dateFrom) {
      from.setMonth(from.getMonth() - (months - 1));
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    }

    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE_FORMAT(p.createdAt, '%Y-%m')", 'periodKey')
      .addSelect(
        `SUM(CASE WHEN p.status = :success THEN p.amount ELSE 0 END)`,
        'revenue',
      )
      .addSelect('COUNT(p.id)', 'bookings')
      .where('p.createdAt BETWEEN :from AND :to', { from, to })
      .setParameter('success', PaymentStatus.SUCCESS)
      .groupBy('periodKey')
      .orderBy('periodKey', 'ASC');
    this.applyCompanyScope(qb, 'p', scope);

    const rows = await qb.getRawMany<{
      periodKey: string;
      revenue: string;
      bookings: string;
    }>();

    return rows.map((row) => ({
      period: this.formatPeriodLabel(row.periodKey),
      revenue: Math.round(Number(row.revenue) / 1_000_000),
      bookings: Number(row.bookings),
    }));
  }

  async getRouteOptions(scope: DashboardScope) {
    const qb = this.roadRepo
      .createQueryBuilder('r')
      .select(
        "CONCAT(r.startPoint, ' → ', r.endPoint)",
        'route',
      )
      .distinct(true)
      .orderBy('route', 'ASC');
    if (scope.companyId != null) {
      qb.where('r.companyId = :companyId', { companyId: scope.companyId });
    }
    const rows = await qb.getRawMany<{ route: string }>();
    return rows.map((r) => r.route).filter(Boolean);
  }

  async getVehicleOptions(scope: DashboardScope) {
    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .select('v.code', 'code')
      .orderBy('v.code', 'ASC');
    if (scope.companyId != null) {
      qb.where('v.companyId = :companyId', { companyId: scope.companyId });
    }
    const rows = await qb.getRawMany<{ code: string }>();
    return rows.map((r) => r.code).filter(Boolean);
  }

  async sumRefundedInRange(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<number> {
    const qb = this.refundRepo
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.amount), 0)', 'total')
      .where('r.status = :status', { status: RefundStatus.SUCCESS })
      .andWhere('r.createdAt BETWEEN :from AND :to', { from, to });
    if (scope.companyId != null) {
      qb.andWhere('r.companyId = :companyId', {
        companyId: scope.companyId,
      });
    }
    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  private formatPeriodLabel(periodKey: string) {
    const month = Number(periodKey.split('-')[1]);
    const labels = [
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
    return labels[month - 1] ?? periodKey;
  }

  private applyCompanyScope(
    qb: ReturnType<Repository<TbPayment>['createQueryBuilder']>,
    alias: string,
    scope: DashboardScope,
  ) {
    if (scope.companyId != null) {
      qb.andWhere(`${alias}.companyId = :companyId`, {
        companyId: scope.companyId,
      });
    }
  }

  private applyDateFilter(
    qb: ReturnType<Repository<TbPayment>['createQueryBuilder']>,
    alias: string,
    filter: RevenueListFilter,
  ) {
    if (filter.dateFrom) {
      qb.andWhere(`${alias}.createdAt >= :dateFrom`, {
        dateFrom: filter.dateFrom,
      });
    }
    if (filter.dateTo) {
      qb.andWhere(`${alias}.createdAt <= :dateTo`, {
        dateTo: filter.dateTo,
      });
    }
  }
}
