import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ClientInvoiceQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number, starts at 1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page, max 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'SUCCESS', description: 'Payment status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'PAYYOS', description: 'Payment method filter' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Filter from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Filter to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  toDate?: string;
}

export class ClientRefundQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number, starts at 1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page, max 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'SUCCESS', description: 'Refund status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Filter from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Filter to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  toDate?: string;
}
