import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsTripValidationMessage } from '../../assets/messages/cms-trip.message';
import {
  CompanyTripResponseDto,
  CmsDriverResponseDto,
  CmsVerhicalEntityDto,
} from './CMS_verhical.dto';
import { OptionalCompanyIdQueryDto } from '../transport/common.dto';

export class CmsTripListQueryDto extends OptionalCompanyIdQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Lọc theo tuyến đường (tb_road)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roadId?: number;
}

export class CreateTripPayloadDto {
  @ApiProperty({
    example: 'Chuyến đêm Hà Nội - Đà Nẵng',
    description: 'Tên chuyến mẫu',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_NAME_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_NAME_INVALID })
  @MaxLength(255, { message: CmsTripValidationMessage.TRIP_NAME_TOO_LONG })
  tripName: string;

  @ApiPropertyOptional({
    example: 'TRP-001',
    description: 'Mã chuyến (tự sinh nếu bỏ trống)',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.TRIP_CODE_INVALID })
  @MaxLength(24, { message: CmsTripValidationMessage.TRIP_CODE_TOO_LONG })
  tripCode?: string;

  @ApiProperty({
    example: 1,
    description: 'ID tuyến đường (tb_road)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.ROAD_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.ROAD_ID_INVALID })
  roadId: number;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái chuyến',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_STATUS_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsTripValidationMessage.TRIP_STATUS_NOT_IN,
  })
  tripStatus: string;

  @ApiPropertyOptional({
    example: 'Chuyến chạy ban đêm, có wifi',
    description: 'Mô tả',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.DESCRIPTION_INVALID })
  description?: string;
}

export class UpdateTripPayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID chuyến mẫu',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.TRIP_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.TRIP_ID_INVALID })
  id: number;

  @ApiProperty({
    example: 'Chuyến đêm Hà Nội - Đà Nẵng',
    description: 'Tên chuyến mẫu',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_NAME_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_NAME_INVALID })
  @MaxLength(255, { message: CmsTripValidationMessage.TRIP_NAME_TOO_LONG })
  tripName: string;

  @ApiProperty({
    example: 1,
    description: 'ID tuyến đường (tb_road)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.ROAD_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.ROAD_ID_INVALID })
  roadId: number;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái chuyến',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_STATUS_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsTripValidationMessage.TRIP_STATUS_NOT_IN,
  })
  tripStatus: string;

  @ApiPropertyOptional({
    example: 'Chuyến chạy ban đêm, có wifi',
    description: 'Mô tả',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.DESCRIPTION_INVALID })
  description?: string;
}

export class CmsTripEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TRP-001' })
  code: string;

  @ApiProperty({ example: 'Chuyến đêm HN-ĐN' })
  name: string;

  @ApiProperty({ example: 1 })
  roadId: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CmsRoadResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'ROD-001' })
  code: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  name: string;

  @ApiProperty({ example: 764 })
  length: number;

  @ApiProperty({ example: 'HIGHWAY' })
  type: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiProperty({ example: 'Hà Nội' })
  startPoint: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  endPoint: string;

  @ApiProperty({ example: '08:00' })
  startTime: string;

  @ApiProperty({ example: '14:30' })
  endTime: string;

  @ApiProperty({ example: 5 })
  totalTurn: number;
}

export class TripResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Chuyến đêm HN-ĐN' })
  name: string;

  @ApiProperty({ example: 'TRP-001' })
  code: string;

  @ApiProperty({ example: '1' })
  roadId: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  tripStatus: string;

  @ApiPropertyOptional()
  description?: string;
}

/** Chi tiết CMS: chuyến mẫu + tuyến + xe + tài xế + chuyến khai thác */
export class CmsTripDetailResponseDto {
  @ApiProperty({ type: CmsTripEntityDto })
  trip: CmsTripEntityDto;

  @ApiPropertyOptional({ type: CmsRoadResponseDto })
  road: CmsRoadResponseDto | null;

  @ApiPropertyOptional({ type: CmsVerhicalEntityDto })
  verhical: CmsVerhicalEntityDto | null;

  @ApiPropertyOptional({ type: CmsDriverResponseDto })
  driver: CmsDriverResponseDto | null;

  @ApiPropertyOptional({ type: CompanyTripResponseDto })
  companyTrip: CompanyTripResponseDto | null;

  @ApiPropertyOptional({ type: [CompanyTripResponseDto] })
  companyTrips?: CompanyTripResponseDto[];

  @ApiProperty({ example: '1' })
  roadId: string;

  @ApiProperty({ example: '1' })
  verhicalId: string;

  @ApiProperty({ example: '1' })
  driverId: string;

  @ApiPropertyOptional({ example: 1 })
  companyTripId?: number;
}

export class CmsTripListResponseDto {
  @ApiProperty({ type: [CmsTripDetailResponseDto] })
  items: CmsTripDetailResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
