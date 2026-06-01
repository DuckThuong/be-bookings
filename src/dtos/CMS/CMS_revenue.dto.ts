import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export type CmsRevenueTxnStatus = 'settled' | 'processing' | 'refunded';

export class CmsRevenueQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 'HCM → Đà Lạt' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ example: '51B-123.45' })
  @IsOptional()
  @IsString()
  vehicle?: string;
}

export class CmsRevenueFilterOptionDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;
}

export class CmsRevenueSummaryItemDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  value: number | string;
}

export class CmsRevenueTrendPointDto {
  @ApiProperty()
  period: string;

  @ApiProperty({ description: 'Doanh thu triệu VND' })
  revenue: number;

  @ApiProperty()
  bookings: number;
}

export class CmsRevenueRouteRowDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  vehicle: string;

  @ApiProperty()
  bookings: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  growth: number;
}

export class CmsRevenueTransactionDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  vehicle: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  bookings: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty({ enum: ['settled', 'processing', 'refunded'] })
  status: CmsRevenueTxnStatus;
}

export class CmsRevenueOverviewDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  refundedRevenue: number;

  @ApiProperty()
  averageBookingValue: number;

  @ApiProperty()
  revenueMomPercent: number;

  @ApiPropertyOptional()
  strongestRoute?: string;

  @ApiPropertyOptional()
  strongestRouteBookings?: number;

  @ApiPropertyOptional()
  strongestRouteGrowth?: number;
}

export class CmsRevenuePageResponseDto {
  @ApiProperty({ enum: ['platform', 'company'] })
  scope: 'platform' | 'company';

  @ApiPropertyOptional()
  companyId?: number;

  @ApiProperty({ type: [CmsRevenueSummaryItemDto] })
  summary: CmsRevenueSummaryItemDto[];

  @ApiProperty()
  overview: CmsRevenueOverviewDto;

  @ApiProperty({ type: [CmsRevenueTrendPointDto] })
  trend: CmsRevenueTrendPointDto[];

  @ApiProperty({ type: [CmsRevenueRouteRowDto] })
  byRoute: CmsRevenueRouteRowDto[];

  @ApiProperty({ type: [CmsRevenueTransactionDto] })
  transactions: CmsRevenueTransactionDto[];

  @ApiProperty({ type: [CmsRevenueFilterOptionDto] })
  routeOptions: CmsRevenueFilterOptionDto[];

  @ApiProperty({ type: [CmsRevenueFilterOptionDto] })
  vehicleOptions: CmsRevenueFilterOptionDto[];
}
