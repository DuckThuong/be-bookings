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
  Max,
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

/** Các field form FE (create / update, không gồm id) */
export class CmsRoadFormPayloadDto {
  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng',
    description: 'Tên tuyến (route)',
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROUTE_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROUTE_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.ROUTE_TOO_LONG })
  route: string;

  @ApiPropertyOptional({
    example: 'ROD-001',
    description: 'Mã tuyến (tự sinh nếu bỏ trống khi tạo)',
  })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.ROAD_CODE_INVALID })
  @MaxLength(24, { message: CmsRoadValidationMessage.ROAD_CODE_TOO_LONG })
  roadCode?: string;

  @ApiProperty({ example: 764.5, description: 'Khoảng cách (km)' })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.DISTANCE_KM_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.DISTANCE_KM_INVALID })
  distanceKm: number;

  @ApiProperty({
    example: '6h30m',
    description: 'Thời gian di chuyển chuẩn',
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.STANDARD_DURATION_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.STANDARD_DURATION_INVALID })
  @MaxLength(50, {
    message: CmsRoadValidationMessage.STANDARD_DURATION_TOO_LONG,
  })
  standardDuration: string;

  @ApiProperty({ example: 4, description: 'Số chuyến mỗi ngày' })
  @Type(() => Number)
  @IsInt({ message: CmsRoadValidationMessage.TRIPS_PER_DAY_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.TRIPS_PER_DAY_INVALID })
  tripsPerDay: number;

  @ApiProperty({ example: 75.5, description: 'Tỉ lệ lấp đầy trung bình (%)' })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  @Max(100, { message: CmsRoadValidationMessage.AVERAGE_OCCUPANCY_INVALID })
  averageOccupancy: number;

  @ApiProperty({ example: 15000000, description: 'Doanh thu ước tính' })
  @Type(() => Number)
  @IsNumber({}, { message: CmsRoadValidationMessage.ESTIMATED_REVENUE_INVALID })
  @Min(0, { message: CmsRoadValidationMessage.ESTIMATED_REVENUE_INVALID })
  estimatedRevenue: number;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    enum: EntityStatus,
    description: 'Trạng thái tuyến',
  })
  @IsNotEmpty({ message: CmsRoadValidationMessage.ROAD_STATUS_EMPTY })
  @IsString({ message: CmsRoadValidationMessage.ROAD_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsRoadValidationMessage.ROAD_STATUS_NOT_IN,
  })
  roadStatus: string;

  @ApiPropertyOptional({
    example: 'Xe giường 34 chỗ',
    description: 'Xe chủ lực',
  })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.LEAD_VEHICLE_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.LEAD_VEHICLE_TOO_LONG })
  leadVehicle?: string;

  @ApiPropertyOptional({ example: 'HIGH', description: 'Mức nhu cầu' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.DEMAND_LEVEL_INVALID })
  @MaxLength(50, { message: CmsRoadValidationMessage.DEMAND_LEVEL_TOO_LONG })
  demandLevel?: string;

  @ApiPropertyOptional({ example: 'Tuyến cao điểm', description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.NOTE_INVALID })
  @MaxLength(500, { message: CmsRoadValidationMessage.NOTE_TOO_LONG })
  note?: string;

  @ApiPropertyOptional({ example: 'EXPRESS', description: 'Loại tuyến' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.ROAD_TYPE_INVALID })
  @MaxLength(50, { message: CmsRoadValidationMessage.ROAD_TYPE_TOO_LONG })
  roadType?: string;

  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Điểm xuất phát' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.START_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.START_POINT_TOO_LONG })
  startPoint?: string;

  @ApiPropertyOptional({ example: 'Đà Nẵng', description: 'Điểm kết thúc' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.END_POINT_INVALID })
  @MaxLength(255, { message: CmsRoadValidationMessage.END_POINT_TOO_LONG })
  endPoint?: string;

  @ApiPropertyOptional({ example: '08:00', description: 'Giờ khởi hành HH:mm' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.START_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.START_TIME_FORMAT,
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '14:30', description: 'Giờ kết thúc HH:mm' })
  @IsOptional()
  @IsString({ message: CmsRoadValidationMessage.END_TIME_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsRoadValidationMessage.END_TIME_FORMAT,
  })
  endTime?: string;
}

export class CreateRoadPayloadDto extends CmsRoadFormPayloadDto {}

export class UpdateRoadPayloadDto extends CmsRoadFormPayloadDto {
  @ApiProperty({ example: 1, description: 'ID tuyến đường' })
  @Type(() => Number)
  @IsInt({ message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  @Min(1, { message: CmsRoadValidationMessage.ROAD_ID_INVALID })
  id: number;
}

export class RoadResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'ROD-001' })
  roadCode: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  route: string;

  @ApiProperty({ example: 764.5 })
  distanceKm: number;

  @ApiProperty({ example: '6h30m' })
  standardDuration: string;

  @ApiProperty({ example: 4 })
  tripsPerDay: number;

  @ApiProperty({ example: 75.5 })
  averageOccupancy: number;

  @ApiProperty({ example: 15000000 })
  estimatedRevenue: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  roadStatus: string;

  @ApiPropertyOptional({ example: 'Xe giường 34 chỗ' })
  leadVehicle?: string | null;

  @ApiPropertyOptional({ example: 'HIGH' })
  demandLevel?: string | null;

  @ApiPropertyOptional({ example: 'Ghi chú' })
  note?: string | null;

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
