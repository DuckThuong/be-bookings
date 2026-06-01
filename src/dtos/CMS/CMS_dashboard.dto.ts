import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DashboardBookingUiStatus } from '../../common/cms/booking-ui-status';

export class CmsDashboardQueryDto {
  @ApiPropertyOptional({
    enum: ['7N', '1T', '3T', '1N'],
    default: '1N',
    description: 'Khoảng thời gian thống kê',
  })
  @IsOptional()
  @IsEnum(['7N', '1T', '3T', '1N'])
  period?: '7N' | '1T' | '3T' | '1N';

  @ApiPropertyOptional({
    description: 'Admin có thể lọc theo nhà xe; owner bị bỏ qua (luôn nhà xe của mình)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}

export class CmsDashboardStatCardDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  iconClass: string;

  @ApiProperty()
  trend: string;

  @ApiProperty({ enum: ['up', 'down'] })
  trendDir: 'up' | 'down';

  @ApiProperty()
  trendNote: string;
}

export class CmsDashboardRevenuePointDto {
  @ApiProperty()
  month: string;

  @ApiProperty({ description: 'Doanh thu (triệu VND) cho biểu đồ' })
  revenue: number;

  @ApiProperty()
  bookings: number;
}

export class CmsDashboardStatusSliceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  color: string;

  @ApiProperty()
  status: DashboardBookingUiStatus;
}

export class CmsDashboardWeeklyPointDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  cancelled: number;
}

export class CmsDashboardVehicleTypeDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  color: string;
}

export class CmsDashboardTopProviderDto {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  trips: number;

  @ApiProperty()
  revenue: string;

  @ApiProperty()
  pct: number;
}

export class CmsDashboardActivityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  initials: string;

  @ApiProperty()
  desc: string;

  @ApiProperty()
  time: string;

  @ApiProperty()
  dot: string;
}

export class CmsDashboardRecentBookingDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  customer: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  seats: number;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  status: DashboardBookingUiStatus;
}

export class CmsDashboardOverviewDto {
  @ApiProperty({ enum: ['platform', 'company'] })
  scope: 'platform' | 'company';

  @ApiPropertyOptional()
  companyId?: number;

  @ApiProperty()
  period: string;

  @ApiProperty({ type: [CmsDashboardStatCardDto] })
  statCards: CmsDashboardStatCardDto[];

  @ApiProperty({ type: [CmsDashboardRevenuePointDto] })
  revenueSeries: CmsDashboardRevenuePointDto[];

  @ApiProperty()
  revenueMomPercent: number;

  @ApiProperty({ type: [CmsDashboardStatusSliceDto] })
  bookingStatusDistribution: CmsDashboardStatusSliceDto[];

  @ApiProperty({ type: [CmsDashboardWeeklyPointDto] })
  weeklyBookings: CmsDashboardWeeklyPointDto[];

  @ApiProperty({ type: [CmsDashboardVehicleTypeDto] })
  vehicleTypes: CmsDashboardVehicleTypeDto[];

  @ApiProperty({ type: [CmsDashboardTopProviderDto] })
  topProviders: CmsDashboardTopProviderDto[];

  @ApiProperty({ type: [CmsDashboardActivityDto] })
  recentActivities: CmsDashboardActivityDto[];

  @ApiProperty({ type: [CmsDashboardRecentBookingDto] })
  recentBookings: CmsDashboardRecentBookingDto[];
}
