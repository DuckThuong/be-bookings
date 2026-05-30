import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ClientPaginationQueryDto {
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
}

export class ClientCompanyQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name/code/description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ClientRoadQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ description: 'Search by name/code/start/end point' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Ha Noi' })
  @IsOptional()
  @IsString()
  startPoint?: string;

  @ApiPropertyOptional({ example: 'Da Nang' })
  @IsOptional()
  @IsString()
  endPoint?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ClientTripQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roadId?: number;

  @ApiProperty({
    description: 'Điểm xuất phát',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  startPoint: string;

  @ApiProperty({
    description: 'Điểm đến',
    example: 'Đà Nẵng',
  })
  @IsOptional()
  @IsString()
  endPoint: string;

  @ApiPropertyOptional({ description: 'Search by trip name/code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ClientCompanyTripQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tripId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roadId?: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Only include trips with at least N available seats',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minAvailableSeats?: number;
}

export class ClientMyTicketQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER is scoped to self. ADMIN/OWNER can filter by customer; empty means all accessible customers.',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 'PAID' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by ticket code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  toDate?: string;
}

export class ClientMyInvoiceQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER is scoped to self. ADMIN/OWNER can filter by customer; empty means all accessible customers.',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 'SUCCESS' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'MOMO' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    description: 'Search by invoice code or reference code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  toDate?: string;
}

export class ClientMyBookingQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER is scoped to self. ADMIN/OWNER can filter by customer; empty means all accessible customers.',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 'HOLD' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  toDate?: string;
}
