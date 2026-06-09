import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  PaymentStatus,
  SettlementStatus,
} from '../../assets/constants/sales.constants';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({ example: 'USR001' })
  customerId: string;

  @ApiProperty({ example: [1, 2] })
  seatIds: number[];

  @ApiProperty({ example: 2 })
  totalSeat: number;

  @ApiProperty({ example: 350000 })
  pricePerSeat: number;

  @ApiPropertyOptional({ example: 0 })
  discountAmount?: number;

  @ApiPropertyOptional()
  promoCode?: string;

  @ApiProperty({
    example: '2026-05-21T12:00:00.000Z',
    description: 'Thời điểm hết hạn giữ chỗ',
  })
  holdExpiresAt: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiProperty({ example: 'MOMO' })
  method: string;

  @ApiPropertyOptional({ example: PaymentStatus.PENDING })
  status?: string;

  @ApiPropertyOptional()
  transactionRef?: string;
}

export class ConfirmPaymentDto {
  @ApiPropertyOptional()
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

export class CreateRefundDto {
  @ApiProperty({ example: 1 })
  paymentId: number;

  @ApiProperty({ example: 100000 })
  amount: number;

  @ApiPropertyOptional()
  reason?: string;
}

export class ConfirmRefundDto {
  @ApiPropertyOptional()
  note?: string;
}

export class CreateCommissionDto {
  @ApiProperty({ example: 1 })
  paymentId: number;

  @ApiProperty({ example: 5 })
  commissionRate: number;
}

export class CreateSettlementDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: '2026-05-01' })
  periodFrom: string;

  @ApiProperty({ example: '2026-05-31' })
  periodTo: string;

  @ApiProperty({ example: 10000000 })
  totalSales: number;

  @ApiProperty({ example: 500000 })
  totalCommission: number;

  @ApiProperty({ example: 9500000 })
  payoutAmount: number;

  @ApiPropertyOptional({ enum: SettlementStatus })
  status?: string;
}

export class UpdateSettlementDto {
  @ApiPropertyOptional()
  totalSales?: number;

  @ApiPropertyOptional()
  totalCommission?: number;

  @ApiPropertyOptional()
  payoutAmount?: number;

  @ApiPropertyOptional({ enum: SettlementStatus })
  status?: string;
}

export class UpsertCompanyStatDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: '2026-05-20' })
  statDate: string;

  @ApiPropertyOptional()
  ticketCount?: number;

  @ApiPropertyOptional()
  seatSold?: number;

  @ApiPropertyOptional()
  grossRevenue?: number;

  @ApiPropertyOptional()
  discountTotal?: number;

  @ApiPropertyOptional()
  netRevenue?: number;

  @ApiPropertyOptional()
  refundTotal?: number;

  @ApiPropertyOptional()
  cancelledCount?: number;

  @ApiPropertyOptional()
  occupancyRate?: number;

  @ApiPropertyOptional()
  avgTicketValue?: number;
}

export class UpsertTripStatDto {
  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: '2026-05-20' })
  statDate: string;

  @ApiPropertyOptional()
  ticketCount?: number;

  @ApiPropertyOptional()
  seatSold?: number;

  @ApiPropertyOptional()
  grossRevenue?: number;

  @ApiPropertyOptional()
  discountTotal?: number;

  @ApiPropertyOptional()
  netRevenue?: number;

  @ApiPropertyOptional()
  refundTotal?: number;

  @ApiPropertyOptional()
  cancelledCount?: number;

  @ApiPropertyOptional()
  occupancyRate?: number;
}

export class CreatePromotionUsageDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'SUMMER10' })
  promoCode: string;

  @ApiProperty({ example: 50000 })
  discountAmount: number;

  @ApiPropertyOptional()
  ticketId?: number;

  @ApiPropertyOptional()
  bookingId?: number;
}

export class SalesFilterQueryDto {
  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  tripId?: number;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  statDate?: string;
}
