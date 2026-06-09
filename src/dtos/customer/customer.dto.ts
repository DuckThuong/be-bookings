import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserInformationResponseDto } from '../user/user.dto';

export class CustomerListItemDto extends UserInformationResponseDto {
  @ApiProperty({ example: 5, description: 'Số vé' })
  ticketCount: number;

  @ApiProperty({ example: 3, description: 'Số lần đặt chỗ' })
  bookingCount: number;

  @ApiProperty({ example: 1500000, description: 'Tổng tiền đã thanh toán' })
  totalPaid: number;

  @ApiProperty({ example: 'Bronze', description: 'Hạng thành viên hiện tại' })
  rank: string;

  @ApiProperty({
    example: 1500000,
    description: 'Số tiền đã chi tiêu tích lũy cho rank',
  })
  spentAmount: number;

  @ApiPropertyOptional({
    example: 'Silver',
    description: 'Hạng tiếp theo nếu đạt ngưỡng',
  })
  nextRank?: string;

  @ApiPropertyOptional({
    example: 5000000,
    description: 'Ngưỡng chi tiêu cần đạt để lên hạng tiếp theo',
  })
  nextRankThreshold?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Tiến độ % lên hạng tiếp theo',
  })
  rankProgressPercent?: number;

  @ApiPropertyOptional({ example: '2026-05-20' })
  lastBookingAt?: string;
}

export class CustomerDetailDto extends CustomerListItemDto {
  @ApiProperty({ example: 2, description: 'Vé đang chờ thanh toán' })
  pendingTicketCount: number;

  @ApiProperty({ example: 0, description: 'Số lần hoàn tiền' })
  refundCount: number;
}

export class CustomerFilterQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Lọc khách của nhà xe' })
  companyId?: number;

  @ApiPropertyOptional({ description: 'Tìm theo tên/SĐT/email' })
  search?: string;
}
