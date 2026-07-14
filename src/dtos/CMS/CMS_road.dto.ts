import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsRoadValidationMessage } from '../../assets/messages/cms-road.message';

export class CmsRoadFormPayloadDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiPropertyOptional({ example: 'ROD-001' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.ROAD_CODE_INVALID })
  @MaxLength(24, { message: CmsRoadValidationMessage.ROAD_CODE_TOO_LONG })
  code?: string;

  @ApiProperty({ example: 'Ha Noi - Da Nang' })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_NAME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_NAME_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.ROAD_NAME_TOO_LONG })
  name: string;

  @ApiProperty({ example: 764.5 })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  length: number;

  @ApiProperty({ example: EntityStatus.ACTIVE, enum: EntityStatus })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_STATUS_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_STATUS_INVALID })
  status: string;

  @ApiProperty({ example: 'BigC Thăng Long' })
  @IsNotEmpty({ message: CmsRoadValidationMessage.START_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.START_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.START_POINT_TOO_LONG })
  pickUpPoint: string;

  @ApiProperty({ example: 'BigC Đà Nẵng' })
  @IsNotEmpty({ message: CmsRoadValidationMessage.END_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.END_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.END_POINT_TOO_LONG })
  dropOffPoint: string;

  @ApiPropertyOptional({ example: '6h30m' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.STANDARD_DURATION_INVALID })
  @MaxLength(50, {
    message: CmsRoadValidationMessage.STANDARD_DURATION_TOO_LONG,
  })
  standardDuration?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsRoadValidationMessage.TRIPS_PER_DAY_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.TRIPS_PER_DAY_INVALID })
  tripsPerDay?: number;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  @Max(100, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  averageOccupancy?: number;

  @ApiPropertyOptional({ example: 15000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.ESTIMATED_REVENUE_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.ESTIMATED_REVENUE_INVALID })
  estimatedRevenue?: number;

  @ApiPropertyOptional({ example: 'Sleeper 34' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.LEAD_VEHICLE_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.LEAD_VEHICLE_TOO_LONG })
  leadVehicle?: string | null;

  @ApiPropertyOptional({ example: 'HIGH' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.DEMAND_LEVEL_INVALID })
  @MaxLength(50, { message: CmsRoadValidationMessage.DEMAND_LEVEL_TOO_LONG })
  demandLevel?: string | null;

  @ApiPropertyOptional({ example: 'Peak route' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.NOTE_INVALID })
  @MaxLength(500, { message: CmsRoadValidationMessage.NOTE_TOO_LONG })
  note?: string | null;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalTurn?: number;
}

export class CreateRoadPayloadDto extends CmsRoadFormPayloadDto {}

export class UpdateRoadPayloadDto extends PartialType(CmsRoadFormPayloadDto) {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  @Min(1, { message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  id?: number;
}

export class CmsRoadEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'ROD-001' })
  code: string;

  @ApiProperty({ example: 'Ha Noi - Da Nang' })
  name: string;

  @ApiProperty({ example: 764.5 })
  length: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiProperty({ example: 'Hà Nội' })
  startPoint: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  endPoint: string;

  @ApiProperty({ example: 'BigC Thăng Long' })
  pickUpPoint: string;

  @ApiProperty({ example: 'BigC Đà Nẵng' })
  dropOffPoint: string;

  @ApiProperty({ example: '6h30m' })
  standardDuration: string;

  @ApiProperty({ example: 4 })
  tripsPerDay: number;

  @ApiProperty({ example: 75.5 })
  averageOccupancy: number;

  @ApiProperty({ example: 15000000 })
  estimatedRevenue: number;

  @ApiPropertyOptional({ example: 'Sleeper 34' })
  leadVehicle?: string | null;

  @ApiPropertyOptional({ example: 'HIGH' })
  demandLevel?: string | null;

  @ApiPropertyOptional({ example: 'Peak route' })
  note?: string | null;

  @ApiProperty({ example: 0 })
  totalTurn: number;
}

export class RoadResponseDto extends CmsRoadEntityDto {}

export class CmsRoadDetailResponseDto extends CmsRoadEntityDto {}

export class CmsRoadListResponseDto {
  @ApiProperty({ type: [CmsRoadEntityDto] })
  items: CmsRoadEntityDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
