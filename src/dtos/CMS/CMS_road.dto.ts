import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsRoadValidationMessage } from '../../assets/messages/cms-road.message';
import {
  CompanyTripResponseDto,
  CmsDriverResponseDto,
  CmsVerhicalEntityDto,
} from './CMS_verhical.dto';
import { CmsRoadResponseDto, CmsTripEntityDto } from './CMS_trip.dto';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateRoadPayloadDto {
  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng',
    description: 'Tên tuyến đường',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_NAME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_NAME_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.ROAD_NAME_TOO_LONG })
  roadName: string;

  @ApiPropertyOptional({
    example: 'ROD-001',
    description: 'Mã tuyến (tự sinh nếu bỏ trống)',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.ROAD_CODE_INVALID })
  @MaxLength(24, { message: CmsRoadValidationMessage.ROAD_CODE_TOO_LONG })
  roadCode?: string;

  @ApiProperty({
    example: 764.5,
    description: 'Chiều dài tuyến (km)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  length: number;

  @ApiProperty({
    example: 'EXPRESS',
    description: 'Loại tuyến',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_TYPE_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_TYPE_INVALID })
  @MaxLength(50, { message: CmsRoadValidationMessage.ROAD_TYPE_TOO_LONG })
  roadType: string;

  @ApiProperty({
    example: 'Hà Nội',
    description: 'Điểm xuất phát',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.START_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.START_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.START_POINT_TOO_LONG })
  startPoint: string;

  @ApiProperty({
    example: 'Đà Nẵng',
    description: 'Điểm kết thúc',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.END_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.END_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.END_POINT_TOO_LONG })
  endPoint: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.START_TIME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.START_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.START_TIME_FORMAT,
  })
  startTime: string;

  @ApiProperty({
    example: '14:30',
    description: 'Giờ kết thúc (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.END_TIME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.END_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.END_TIME_FORMAT,
  })
  endTime: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái tuyến',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_STATUS_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsRoadValidationMessage.ROAD_STATUS_NOT_IN,
  })
  roadStatus: string;
}

export class UpdateRoadPayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID tuyến đường',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  @Min(1, { message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  id: number;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng',
    description: 'Tên tuyến đường',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_NAME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_NAME_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.ROAD_NAME_TOO_LONG })
  roadName: string;

  @ApiProperty({
    example: 764.5,
    description: 'Chiều dài tuyến (km)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.LENGTH_INVALID })
  length: number;

  @ApiProperty({
    example: 'EXPRESS',
    description: 'Loại tuyến',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_TYPE_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_TYPE_INVALID })
  @MaxLength(50, { message: CmsRoadValidationMessage.ROAD_TYPE_TOO_LONG })
  roadType: string;

  @ApiProperty({
    example: 'Hà Nội',
    description: 'Điểm xuất phát',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.START_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.START_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.START_POINT_TOO_LONG })
  startPoint: string;

  @ApiProperty({
    example: 'Đà Nẵng',
    description: 'Điểm kết thúc',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.END_POINT_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.END_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.END_POINT_TOO_LONG })
  endPoint: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.START_TIME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.START_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.START_TIME_FORMAT,
  })
  startTime: string;

  @ApiProperty({
    example: '14:30',
    description: 'Giờ kết thúc (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.END_TIME_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.END_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.END_TIME_FORMAT,
  })
  endTime: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái tuyến',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_STATUS_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsRoadValidationMessage.ROAD_STATUS_NOT_IN,
  })
  roadStatus: string;
}

export class RoadResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  name: string;

  @ApiProperty({ example: 'ROD-001' })
  code: string;

  @ApiProperty({ example: 764.5 })
  length: number;

  @ApiProperty({ example: 'EXPRESS' })
  roadType: string;

  @ApiProperty({ example: 'Hà Nội' })
  startPoint: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  endPoint: string;

  @ApiProperty({ example: '08:00' })
  startTime: string;

  @ApiProperty({ example: '14:30' })
  endTime: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  roadStatus: string;

  @ApiProperty({ example: 0 })
  totalTurn: number;
}

/** Chi tiết CMS: tuyến + chuyến mẫu + xe + tài xế + chuyến khai thác */
export class CmsRoadDetailResponseDto {
  @ApiProperty({ type: CmsRoadResponseDto })
  road: CmsRoadResponseDto;

  @ApiProperty({ type: [CmsTripEntityDto] })
  trips: CmsTripEntityDto[];

  @ApiPropertyOptional({ type: CmsTripEntityDto })
  trip: CmsTripEntityDto | null;

  @ApiPropertyOptional({ type: CmsVerhicalEntityDto })
  verhical: CmsVerhicalEntityDto | null;

  @ApiPropertyOptional({ type: CmsDriverResponseDto })
  driver: CmsDriverResponseDto | null;

  @ApiPropertyOptional({ type: CompanyTripResponseDto })
  companyTrip: CompanyTripResponseDto | null;

  @ApiPropertyOptional({ type: [CompanyTripResponseDto] })
  companyTrips?: CompanyTripResponseDto[];

  @ApiProperty({ example: 3 })
  tripCount: number;

  @ApiProperty({ example: '1' })
  tripId: string;

  @ApiProperty({ example: '1' })
  verhicalId: string;

  @ApiProperty({ example: '1' })
  driverId: string;

  @ApiPropertyOptional({ example: 1 })
  companyTripId?: number;
}

export class CmsRoadListResponseDto {
  @ApiProperty({ type: [CmsRoadDetailResponseDto] })
  items: CmsRoadDetailResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
