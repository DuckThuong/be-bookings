import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export type CmsProviderStatus = 'active' | 'suspended';

export class CmsCompanyListQueryDto {
    @ApiPropertyOptional({ description: 'Tìm theo tên, mã, hotline, email' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'active | suspended | all',
        example: 'all',
    })
    @IsOptional()
    @IsString()
    status?: string;
}

export class CmsCompanyListItemDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    hotline: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    routeCount: number;

    @ApiProperty()
    vehicleCount: number;

    @ApiProperty({ enum: ['active', 'suspended'] })
    status: CmsProviderStatus;

    @ApiProperty()
    joinedAt: string;

    @ApiProperty()
    note: string;
}

export class CmsCompanySummaryDto {
    @ApiProperty()
    totalProviders: number;

    @ApiProperty()
    activeCount: number;

    @ApiProperty()
    totalRoutes: number;

    @ApiProperty()
    totalVehicles: number;
}

export class CmsCompanyListResponseDto {
    @ApiProperty({ type: [CmsCompanyListItemDto] })
    items: CmsCompanyListItemDto[];

    @ApiProperty()
    total: number;

    @ApiProperty({ type: CmsCompanySummaryDto })
    summary: CmsCompanySummaryDto;
}
