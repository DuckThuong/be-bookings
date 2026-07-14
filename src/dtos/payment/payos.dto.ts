import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayOSPaymentDto {
  @ApiProperty({ description: 'ID của vé cần thanh toán' })
  @IsNumber()
  ticketId: number;

  @ApiProperty({ description: 'Mô tả thanh toán', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PayOSPaymentLinkResponseDto {
  @ApiProperty({ description: 'URL checkout của PayOS' })
  checkoutUrl: string;

  @ApiProperty({ description: 'ID của payment link' })
  paymentLinkId: string;

  @ApiProperty({ description: 'Mã QR thanh toán' })
  qrCode: string;

  @ApiProperty({ description: 'Mã đơn hàng' })
  orderCode: number;
}

export class PayOSWebhookDto {
  @ApiProperty({ description: 'Mã phản hồi' })
  code: string;

  @ApiProperty({ description: 'Mô tả phản hồi' })
  desc: string;

  @ApiProperty({ description: 'Mã đơn hàng' })
  orderCode: string;

  @ApiProperty({ description: 'ID của payment link' })
  paymentLinkId: string;

  @ApiProperty({ description: 'Trạng thái thanh toán' })
  status: string;

  @ApiProperty({ description: 'Số tiền thanh toán' })
  amount: number;

  @ApiProperty({ description: 'Thời gian thanh toán' })
  paidAt: string;

  @ApiProperty({ description: 'Chữ ký xác thực' })
  signature: string;
}
