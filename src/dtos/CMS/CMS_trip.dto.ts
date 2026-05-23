import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
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

/** Payload FE (create / update, không gồm id) */
export class CmsTripFormPayloadDto {
  @ApiPropertyOptional({
    example: 'TRP-001',
    description: 'Mã chuyến (trip_code / key)',
  })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.TRIP_CODE_INVALID })
  @MaxLength(24, { message: CmsTripValidationMessage.TRIP_CODE_TOO_LONG })
  tripCode?: string;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng',
    description: 'Tuyến — mã hoặc tên road (road_code / road_name)',
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.ROUTE_EMPTY })
  @IsString({ message: CmsTripValidationMessage.ROUTE_INVALID })
  @MaxLength(255, { message: CmsTripValidationMessage.ROUTE_TOO_LONG })
  route: string;

  @ApiProperty({
    example: '51B-12345',
    description: 'Mã xe (verhical_code)',
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.VEHICLE_EMPTY })
  @IsString({ message: CmsTripValidationMessage.VEHICLE_INVALID })
  @MaxLength(50, { message: CmsTripValidationMessage.VEHICLE_TOO_LONG })
  vehicle: string;

  @ApiProperty({
    example: 'DRV-001',
    description: 'Mã tài xế (driver_code)',
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.DRIVER_EMPTY })
  @IsString({ message: CmsTripValidationMessage.DRIVER_INVALID })
  @MaxLength(24, { message: CmsTripValidationMessage.DRIVER_TOO_LONG })
  driver: string;

  @ApiProperty({ example: '08:00', description: 'Giờ khởi hành' })
  @IsNotEmpty({ message: CmsTripValidationMessage.DEPARTURE_EMPTY })
  @IsString({ message: CmsTripValidationMessage.DEPARTURE_INVALID })
  @MaxLength(50, { message: CmsTripValidationMessage.DEPARTURE_TOO_LONG })
  departure: string;

  @ApiProperty({ example: '14:30', description: 'Giờ đến' })
  @IsNotEmpty({ message: CmsTripValidationMessage.ARRIVAL_EMPTY })
  @IsString({ message: CmsTripValidationMessage.ARRIVAL_INVALID })
  @MaxLength(50, { message: CmsTripValidationMessage.ARRIVAL_TOO_LONG })
  arrival: string;

  @ApiProperty({ example: 12, description: 'Số ghế đã đặt' })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.BOOKED_SEATS_INVALID })
  @Min(0, { message: CmsTripValidationMessage.BOOKED_SEATS_INVALID })
  bookedSeats: number;

  @ApiProperty({ example: 40, description: 'Sức chứa' })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.CAPACITY_INVALID })
  @Min(1, { message: CmsTripValidationMessage.CAPACITY_INVALID })
  capacity: number;

  @ApiProperty({ example: 30, description: 'Tỉ lệ lấp đầy (%)' })
  @Type(() => Number)
  @IsNumber({}, { message: CmsTripValidationMessage.OCCUPANCY_RATE_INVALID })
  @Min(0, { message: CmsTripValidationMessage.OCCUPANCY_RATE_INVALID })
  @Max(100, { message: CmsTripValidationMessage.OCCUPANCY_RATE_INVALID })
  occupancyRate: number;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    enum: EntityStatus,
    description: 'Trạng thái chuyến',
  })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_STATUS_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsTripValidationMessage.TRIP_STATUS_NOT_IN,
  })
  status: string;

  @ApiPropertyOptional({ example: 'Chuyến cao điểm', description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.NOTE_INVALID })
  @MaxLength(500, { message: CmsTripValidationMessage.NOTE_TOO_LONG })
  note?: string;
}

export class CreateTripPayloadDto extends CmsTripFormPayloadDto {}

export class UpdateTripPayloadDto extends CmsTripFormPayloadDto {
  @ApiProperty({ example: 1, description: 'ID chuyến mẫu' })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.TRIP_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.TRIP_ID_INVALID })
  id: number;
}

/** Dòng bảng FE — GET join từ trip + road + company_trip + xe + tài xế */
export class CmsTripRecordDto {
  @ApiProperty({ example: 'TRP-001', description: 'trip_code / key' })
  key: string;

  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  route: string;

  @ApiProperty({ example: '51B-12345' })
  vehicle: string;

  @ApiProperty({ example: 'DRV-001' })
  driver: string;

  @ApiProperty({ example: '08:00' })
  departure: string;

  @ApiProperty({ example: '14:30' })
  arrival: string;

  @ApiProperty({ example: 12 })
  bookedSeats: number;

  @ApiProperty({ example: 40 })
  capacity: number;

  @ApiProperty({ example: 30 })
  occupancyRate: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiProperty({ example: 'Ghi chú' })
  note: string;
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

  @ApiProperty({ example: '08:00' })
  departure: string;

  @ApiProperty({ example: '14:30' })
  arrival: string;
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

  @ApiProperty({ example: '6h30m' })
  standardDuration: string;

  @ApiProperty({ example: 4 })
  tripsPerDay: number;

  @ApiProperty({ example: 75.5 })
  averageOccupancy: number;

  @ApiProperty({ example: 15000000 })
  estimatedRevenue: number;

  @ApiPropertyOptional({ example: 'Xe giường 34 chỗ' })
  leadVehicle?: string | null;

  @ApiPropertyOptional({ example: 'HIGH' })
  demandLevel?: string | null;

  @ApiPropertyOptional({ example: 'Ghi chú' })
  note?: string | null;

  @ApiProperty({ example: 764.5 })
  distanceKm: number;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  route: string;

  @ApiProperty({ example: 'ROD-001' })
  roadCode: string;
}

export class TripResponseDto extends CmsTripRecordDto {}

export class CmsTripDetailResponseDto {
  @ApiProperty({ type: CmsTripRecordDto })
  record: CmsTripRecordDto;

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
