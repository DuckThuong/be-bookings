import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CompanyIdQueryDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId: number;
}

export class OptionalCompanyIdQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID nhà xe (bắt buộc với Admin; Owner tự lấy theo userLeadId)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;
}

export class VehicleIdQueryDto extends CompanyIdQueryDto {
  @ApiProperty({ example: 1, description: 'ID phương tiện' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  verhicalId: number;
}

export class TicketFilterQueryDto {
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
  companyTripId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  customerId?: string;
}
