import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DashboardScope } from '../common/helpers/dashboard-scope.helper';
import { EntityStatus } from '../assets/constants/company.constants';
import { PaymentStatus } from '../assets/constants/sales.constants';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbVehicle } from '../entities/vehicle.entity';
import { TbCompany } from '../entities/company/company.entity';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { UserRole } from '../dtos/user/common.dto';

export interface DashboardCountRow {
  current: number;
  previous: number;
}

export interface DashboardRevenueSeriesRow {
  period: string;
  revenue: number;
  bookings: number;
}

export interface DashboardWeeklyRow {
  dayIndex: number;
  completed: number;
  cancelled: number;
}

export interface DashboardVehicleTypeRow {
  type: string;
  count: number;
}

export interface DashboardTopProviderRow {
  companyId: number;
  name: string;
  trips: number;
  revenue: number;
}

export interface DashboardTopRouteRow {
  route: string;
  trips: number;
  revenue: number;
}

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbBasicUser)
    private readonly userRepo: Repository<TbBasicUser>,
  ) {}

  findRecentPayments(scope: DashboardScope, limit = 20) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC')
      .take(limit);
    this.applyCompanyScope(qb, 'p', scope);
    return qb.getMany();
  }

  async countUsers(scope: DashboardScope): Promise<number> {
    if (scope.companyId != null) {
      const row = await this.paymentRepo
        .createQueryBuilder('p')
        .select('COUNT(DISTINCT p.customerId)', 'total')
        .where('p.companyId = :companyId', { companyId: scope.companyId })
        .getRawOne<{ total: string }>();
      return Number(row?.total ?? 0);
    }
    return this.userRepo.count({ where: { role: UserRole.USER } });
  }

  async countUsersInRange(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<number> {
    if (scope.companyId != null) {
      const row = await this.paymentRepo
        .createQueryBuilder('p')
        .select('COUNT(DISTINCT p.customerId)', 'total')
        .where('p.companyId = :companyId', { companyId: scope.companyId })
        .andWhere('p.createdAt BETWEEN :from AND :to', { from, to })
        .getRawOne<{ total: string }>();
      return Number(row?.total ?? 0);
    }
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.USER })
      .andWhere('u.id IS NOT NULL')
      .getCount();
  }

  async countProviders(scope: DashboardScope): Promise<number> {
    if (scope.companyId != null) {
      return 1;
    }
    return this.companyRepo.count({
      where: { status: EntityStatus.ACTIVE },
    });
  }

  async countProvidersInRange(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<number> {
    if (scope.companyId != null) {
      return 1;
    }
    return this.companyRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: EntityStatus.ACTIVE })
      .andWhere('c.createdAt BETWEEN :from AND :to', { from, to })
      .getCount();
  }

  async countVehicles(scope: DashboardScope): Promise<number> {
    const qb = this.vehicleRepo.createQueryBuilder('v');
    if (scope.companyId != null) {
      qb.where('v.companyId = :companyId', { companyId: scope.companyId });
    }
    return qb.getCount();
  }

  async sumRevenue(scope: DashboardScope): Promise<number> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS });
    this.applyCompanyScope(qb, 'p', scope);
    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  async sumRevenueInRange(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<number> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('p.createdAt BETWEEN :from AND :to', { from, to });
    this.applyCompanyScope(qb, 'p', scope);
    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  async getMetricCounts(
    scope: DashboardScope,
    range: { from: Date; to: Date; previousFrom: Date; previousTo: Date },
  ): Promise<{
    users: DashboardCountRow;
    providers: DashboardCountRow;
    vehicles: DashboardCountRow;
    revenue: DashboardCountRow;
  }> {
    const [
      usersCurrent,
      usersPrevious,
      providersCurrent,
      vehiclesCurrent,
      vehiclesPrevious,
      revenueCurrent,
      revenuePrevious,
    ] = await Promise.all([
      this.countUsersInRange(scope, range.from, range.to),
      this.countUsersInRange(scope, range.previousFrom, range.previousTo),
      this.countProvidersInRange(scope, range.from, range.to),
      this.countProvidersInRange(scope, range.previousFrom, range.previousTo),
      this.countVehicles(scope),
      this.countVehicles(scope),
      this.sumRevenueInRange(scope, range.from, range.to),
      this.sumRevenueInRange(scope, range.previousFrom, range.previousTo),
    ]);

    return {
      users: { current: usersCurrent, previous: usersPrevious },
      providers: { current: providersCurrent, previous: providersCurrent },
      vehicles: { current: vehiclesCurrent, previous: vehiclesPrevious },
      revenue: { current: revenueCurrent, previous: revenuePrevious },
    };
  }

  async getRevenueSeries(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<DashboardRevenueSeriesRow[]> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE_FORMAT(p.createdAt, '%Y-%m')", 'periodKey')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .addSelect('COUNT(p.id)', 'bookings')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('p.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('periodKey')
      .orderBy('periodKey', 'ASC');
    this.applyCompanyScope(qb, 'p', scope);

    const rows = await qb.getRawMany<{
      periodKey: string;
      revenue: string;
      bookings: string;
    }>();

    return rows.map((row) => ({
      period: row.periodKey,
      revenue: Math.round(Number(row.revenue) / 1_000_000),
      bookings: Number(row.bookings),
    }));
  }

  async sumRevenueMom(
    scope: DashboardScope,
    range: { from: Date; to: Date; previousFrom: Date; previousTo: Date },
  ): Promise<number> {
    const [current, previous] = await Promise.all([
      this.sumRevenueInRange(scope, range.from, range.to),
      this.sumRevenueInRange(scope, range.previousFrom, range.previousTo),
    ]);
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  async getWeeklyBookings(
    scope: DashboardScope,
    from: Date,
    to: Date,
  ): Promise<DashboardWeeklyRow[]> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .select('DAYOFWEEK(p.createdAt)', 'dayIndex')
      .addSelect(
        `SUM(CASE WHEN p.status = :success THEN 1 ELSE 0 END)`,
        'completed',
      )
      .addSelect(
        `SUM(CASE WHEN p.status = :failed THEN 1 ELSE 0 END)`,
        'cancelled',
      )
      .where('p.createdAt BETWEEN :from AND :to', { from, to })
      .setParameter('success', PaymentStatus.SUCCESS)
      .setParameter('failed', PaymentStatus.FAILED)
      .groupBy('dayIndex')
      .orderBy('dayIndex', 'ASC');
    this.applyCompanyScope(qb, 'p', scope);

    const rows = await qb.getRawMany<{
      dayIndex: string;
      completed: string;
      cancelled: string;
    }>();

    return rows.map((row) => ({
      dayIndex: Number(row.dayIndex),
      completed: Number(row.completed),
      cancelled: Number(row.cancelled),
    }));
  }

  async getVehicleTypeBreakdown(
    scope: DashboardScope,
  ): Promise<DashboardVehicleTypeRow[]> {
    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .select('v.type', 'type')
      .addSelect('COUNT(v.id)', 'count')
      .groupBy('v.type')
      .orderBy('count', 'DESC');
    if (scope.companyId != null) {
      qb.where('v.companyId = :companyId', { companyId: scope.companyId });
    }
    const rows = await qb.getRawMany<{ type: string; count: string }>();
    return rows.map((row) => ({
      type: row.type,
      count: Number(row.count),
    }));
  }

  async getTopCompanies(
    scope: DashboardScope,
    from: Date,
    to: Date,
    limit = 5,
  ): Promise<DashboardTopProviderRow[]> {
    if (scope.companyId != null) {
      return [];
    }

    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin(TbCompany, 'c', 'c.id = p.companyId')
      .select('p.companyId', 'companyId')
      .addSelect('c.companyName', 'name')
      .addSelect('COUNT(p.id)', 'trips')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('p.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('p.companyId')
      .addGroupBy('c.companyName')
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany<{
        companyId: string;
        name: string;
        trips: string;
        revenue: string;
      }>();

    return rows.map((row) => ({
      companyId: Number(row.companyId),
      name: row.name,
      trips: Number(row.trips),
      revenue: Number(row.revenue),
    }));
  }

  async getTopRoutesForCompany(
    companyId: number,
    from: Date,
    to: Date,
    limit = 5,
  ): Promise<DashboardTopRouteRow[]> {
    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('tb_trip', 't', 't.id = p.tripId')
      .innerJoin('tb_road', 'r', 'r.id = t.roadId')
      .select("CONCAT(r.startPoint, ' → ', r.endPoint)", 'route')
      .addSelect('COUNT(p.id)', 'trips')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where('p.companyId = :companyId', { companyId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('p.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('r.id')
      .addGroupBy('r.startPoint')
      .addGroupBy('r.endPoint')
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany<{ route: string; trips: string; revenue: string }>();

    return rows.map((row) => ({
      route: row.route,
      trips: Number(row.trips),
      revenue: Number(row.revenue),
    }));
  }

  findTicketsByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.ticketRepo.find({ where: ids.map((id) => ({ id })) });
  }

  findCompaniesByIds(ids: number[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.companyRepo.find({ where: { id: In(ids) } });
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
}
