import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestRefundDto {
  @ApiPropertyOptional({ description: 'Lý do yêu cầu hoàn tiền' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RefundResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Yêu cầu hoàn tiền đã được gửi thành công' })
  message: string;

  @ApiPropertyOptional({ example: 'REF-123456' })
  refundCode?: string;

  @ApiPropertyOptional({ example: 80 })
  refundPercentage?: number;

  @ApiPropertyOptional({ example: 184000 })
  estimatedRefundAmount?: number;
}
