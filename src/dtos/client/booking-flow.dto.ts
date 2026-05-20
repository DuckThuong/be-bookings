import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Flow 1 — Giữ chỗ (HOLD) */
export class ClientHoldBookingDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  companyTripId: number;

  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({ example: [1, 2], description: 'Danh sách ID ghế (tb_seat.id)' })
  seatIds: number[];

  @ApiPropertyOptional({ example: 0 })
  discountAmount?: number;

  @ApiPropertyOptional()
  promoCode?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Thời gian giữ chỗ (phút), mặc định 15',
  })
  holdMinutes?: number;

  @ApiPropertyOptional({
    description: 'ADMIN/OWNER: mã khách (userCode). USER bỏ qua',
  })
  customerId?: string;
}
