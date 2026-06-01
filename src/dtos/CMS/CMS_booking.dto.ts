import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export type CmsBookingUiStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'moving'
  | 'completed'
  | 'no_show';

export class CmsBookingListQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({
    description: 'pending | confirmed | cancelled | all',
    example: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Lọc theo vehicleId (tb_vehicle.id)' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Tìm mã vé, tên, SĐT, tuyến' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CmsBookingListItemDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentId: number;

  @ApiPropertyOptional()
  bookingId?: number;

  @ApiPropertyOptional()
  ticketId?: number;

  @ApiProperty()
  vehicleId: string;

  @ApiProperty()
  customer: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  departure: string;

  @ApiProperty()
  arrival: string;

  @ApiProperty({ type: [String] })
  seats: string[];

  @ApiProperty()
  seatCount: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: CmsBookingUiStatus;

  @ApiProperty()
  bookedAt: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  pickup: string;

  @ApiProperty()
  dropoff: string;

  @ApiPropertyOptional()
  paymentMethod?: string;
}

export class CmsBookingVehicleSidebarDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  count: number;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  status?: string;
}

export class CmsBookingListResponseDto {
  @ApiProperty({ type: [CmsBookingListItemDto] })
  items: CmsBookingListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [CmsBookingVehicleSidebarDto] })
  vehicles: CmsBookingVehicleSidebarDto[];
}

export class CmsRejectBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CmsConfirmBookingDto {
  @ApiPropertyOptional({ description: 'Mã giao dịch / tham chiếu thanh toán' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Tỷ lệ hoa hồng % (tạo commission)',
  })
  @IsOptional()
  @IsNumber()
  commissionRate?: number;
}
