import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export type CmsCustomerTier = 'vip' | 'than-thiet' | 'pho-thong';
export type CmsCustomerStatus = 'active' | 'at-risk' | 'inactive';

export class CmsCustomerListQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID nhà xe (bắt buộc với Admin; Owner tự lấy theo userLeadId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ description: 'Tìm theo tên, SĐT, mã khách' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'vip | than-thiet | pho-thong | all',
    example: 'all',
  })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({
    description: 'active | at-risk | inactive | all',
    example: 'all',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CmsCustomerTripDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;
}

export class CmsCustomerListItemDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['vip', 'than-thiet', 'pho-thong'] })
  tier: CmsCustomerTier;

  @ApiProperty()
  bookingCount: number;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  lastBooking: string;

  @ApiProperty()
  preferredRoute: string;

  @ApiProperty({ enum: ['active', 'at-risk', 'inactive'] })
  status: CmsCustomerStatus;

  @ApiProperty()
  note: string;

  @ApiProperty({ type: [CmsCustomerTripDto] })
  recentTrips: CmsCustomerTripDto[];
}

export class CmsCustomerSummaryDto {
  @ApiProperty()
  totalCustomers: number;

  @ApiProperty()
  vipCount: number;

  @ApiProperty()
  activeCount: number;

  @ApiProperty()
  totalSpent: number;
}

export class CmsCustomerListResponseDto {
  @ApiProperty({ type: [CmsCustomerListItemDto] })
  items: CmsCustomerListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: CmsCustomerSummaryDto })
  summary: CmsCustomerSummaryDto;
}
