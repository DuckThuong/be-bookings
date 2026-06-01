import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export type CmsReportType =
  | 'operations'
  | 'finance'
  | 'customer'
  | 'compliance';

export type CmsReportStatus = 'ready' | 'processing' | 'scheduled';

export class CmsReportListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'operations | finance | customer | compliance | all',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'ready | processing | scheduled | all',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CmsReportSummaryItemDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  value: number | string;
}

export class CmsReportItemDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['operations', 'finance', 'customer', 'compliance'] })
  type: CmsReportType;

  @ApiProperty()
  period: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ enum: ['ready', 'processing', 'scheduled'] })
  status: CmsReportStatus;

  @ApiProperty()
  fileSize: string;

  @ApiProperty()
  description: string;
}

export class CmsReportListResponseDto {
  @ApiProperty({ enum: ['platform', 'company'] })
  scope: 'platform' | 'company';

  @ApiPropertyOptional()
  companyId?: number;

  @ApiProperty({ type: [CmsReportSummaryItemDto] })
  summary: CmsReportSummaryItemDto[];

  @ApiProperty({ type: [CmsReportItemDto] })
  items: CmsReportItemDto[];

  @ApiProperty()
  total: number;
}
