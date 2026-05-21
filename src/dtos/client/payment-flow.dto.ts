import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../assets/constants/sales.constants';

/** Flow 2 — Tạo thanh toán cho vé PENDING */
export class ClientCreatePaymentDto {
  @ApiProperty({ example: 1 })
  ticketId: number;

  @ApiProperty({ example: 'MOMO', description: 'CASH | BANK | MOMO | VNPAY | ...' })
  method: string;

  @ApiPropertyOptional()
  transactionRef?: string;
}

/** Flow 3 — Xác nhận thanh toán thành công */
export class ClientConfirmPaymentDto {
  @ApiPropertyOptional()
  transactionRef?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Chỉ ADMIN/OWNER: tỷ lệ hoa hồng % khi xác nhận',
  })
  commissionRate?: number;
}

/** Flow 4 — Đánh dấu thanh toán thất bại */
export class ClientFailPaymentDto {
  @ApiPropertyOptional()
  note?: string;
}

export class ClientPaymentQueryDto {
  @ApiPropertyOptional({ example: PaymentStatus.PENDING })
  status?: string;
}
