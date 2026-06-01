import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';

export type DashboardScopeType = 'platform' | 'company';

export interface DashboardScope {
  type: DashboardScopeType;
  companyId?: number;
}

export type DashboardPeriod = '7N' | '1T' | '3T' | '1N';

export interface DashboardDateRange {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
}

export function resolveDashboardPeriod(period?: string): DashboardPeriod {
  if (period === '7N' || period === '1T' || period === '3T' || period === '1N') {
    return period;
  }
  return '1N';
}

export function getDashboardDateRange(period: DashboardPeriod): DashboardDateRange {
  const to = new Date();
  const from = new Date(to);

  const daysByPeriod: Record<DashboardPeriod, number> = {
    '7N': 7,
    '1T': 30,
    '3T': 90,
    '1N': 365,
  };

  const days = daysByPeriod[period];
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const spanMs = to.getTime() - from.getTime();
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - spanMs);
  previousFrom.setHours(0, 0, 0, 0);

  return { from, to, previousFrom, previousTo };
}

export function getCurrentWeekRange(): { from: Date; to: Date } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const from = new Date(now);
  from.setDate(now.getDate() + diffToMonday);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function isAdminDashboardUser(user: UserDecoratorDtoResponse): boolean {
  return user.role === UserRole.ADMIN;
}
