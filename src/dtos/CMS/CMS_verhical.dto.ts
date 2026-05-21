import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { CmsVehicalValidationMessage } from '../../assets/messages/cms-vehical.message';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateVehicalPayloadDto {
  @ApiProperty({
    example: 'Xe giường nằm 34 chỗ',
    description: 'Tên phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.VEHICAL_NAME_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.VEHICAL_NAME_INVALID })
  @MaxLength(255, {
    message: CmsVehicalValidationMessage.VEHICAL_NAME_TOO_LONG,
  })
  vehicalName: string;

  @ApiProperty({
    example: 'VEH-29B-12345',
    description: 'Mã / biển số phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.VEHICAL_CODE_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.VEHICAL_CODE_INVALID })
  @MaxLength(50, { message: CmsVehicalValidationMessage.VEHICAL_CODE_TOO_LONG })
  vehicalCode: string;

  @ApiProperty({
    example: 'GIUONG',
    description: 'Loại ghế',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.SEAT_TYPE_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.SEAT_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicalValidationMessage.SEAT_TYPE_TOO_LONG })
  seatType: string;

  @ApiProperty({
    example: 34,
    description: 'Số lượng ghế',
    required: true,
    type: Number,
  })
  @IsInt({ message: CmsVehicalValidationMessage.SEAT_COUNT_INVALID })
  @Min(1, { message: CmsVehicalValidationMessage.SEAT_COUNT_MIN })
  @Max(100, { message: CmsVehicalValidationMessage.SEAT_COUNT_MAX })
  seatCount: number;

  @ApiProperty({
    example: 'SLEEPER',
    description: 'Loại phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.VEHICAL_TYPE_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.VEHICAL_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicalValidationMessage.VEHICAL_TYPE_TOO_LONG })
  vehicalType: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái phương tiện',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.VEHICAL_STATUS_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.VEHICAL_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsVehicalValidationMessage.VEHICAL_STATUS_NOT_IN,
  })
  vehicalStatus: string;

  @ApiProperty({
    example: '1',
    description: 'ID chuyến (tb_trip)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.TRIP_ID_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.TRIP_ID_INVALID })
  tripId: string;

  @ApiProperty({
    example: '1',
    description: 'ID tài xế (tb_driver)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.DRIVER_ID_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.DRIVER_ID_INVALID })
  driverId: string;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng hàng ngày',
    description: 'Lịch trình',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.SCHEDULE_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.SCHEDULE_INVALID })
  @MaxLength(255, { message: CmsVehicalValidationMessage.SCHEDULE_TOO_LONG })
  schedule: string;

  @ApiProperty({
    example: 'Xe mới, có wifi',
    description: 'Mô tả',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.DESCRIPTION_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.DESCRIPTION_INVALID })
  description: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.TIME_START_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.TIME_START_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicalValidationMessage.TIME_START_FORMAT,
  })
  timeStart: string;

  @ApiProperty({
    example: '14:30',
    description: 'Giờ đến (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicalValidationMessage.TIME_END_EMPTY })
  @IsString({ message: CmsVehicalValidationMessage.TIME_END_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicalValidationMessage.TIME_END_FORMAT,
  })
  timeEnd: string;

  @ApiPropertyOptional({
    example: 350000,
    description: 'Giá mỗi ghế (tb_company_trip.pricePerSeat)',
  })
  @IsOptional()
  @IsNumber({}, { message: CmsVehicalValidationMessage.PRICE_PER_SEAT_INVALID })
  @Min(0, { message: CmsVehicalValidationMessage.PRICE_PER_SEAT_INVALID })
  pricePerSeat?: number;
}

export class UpdateVehicalPayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID phương tiện',
    required: true,
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'Xe 1',
    description: 'Tên phương tiện',
    required: true,
    type: String,
  })
  vehicalName: string;

  @ApiProperty({
    example: 'Xe 1',
    description: 'Mã phương tiện',
    required: true,
    type: String,
  })
  vehicalCode: string;

  @ApiProperty({
    example: 'Xe 1',
    description: 'Loại ghế',
    required: true,
    type: String,
  })
  seatType: string;

  @ApiProperty({
    example: 10,
    description: 'Số lượng ghế',
    required: true,
    type: Number,
  })
  seatCount: number;

  @ApiProperty({
    example: 'Xe 1',
    description: 'Loại phương tiện',
    required: true,
    type: String,
  })
  vehicalType: string;

  @ApiProperty({
    example: 'Xe 1',
    description: 'Trạng thái phương tiện',
    required: true,
    type: String,
  })
  vehicalStatus: string;

  @ApiProperty({
    example: 'Xe 1',
    description: 'ID chuyến',
    required: true,
  })
  tripId: string;

  @ApiProperty({
    example: 'Xe 1',
    description: 'ID tài xế',
    required: true,
    type: String,
  })
  driverId: string;
  @ApiProperty({
    example: 'Xe 1',
    description: 'Lịch trình',
    required: true,
    type: String,
  })
  schedule: string;
  @ApiProperty({
    example: 'Xe 1',
    description: 'Mô tả',
    required: true,
    type: String,
  })
  description: string;
  @ApiProperty({
    example: 'Xe 1',
    description: 'Giờ khởi hành',
    required: true,
    type: String,
  })
  timeStart: string;
  @ApiProperty({
    example: 'Xe 1',
    description: 'Giờ đến',
    required: true,
    type: String,
  })
  timeEnd: string;

  @ApiPropertyOptional({ example: 350000 })
  pricePerSeat?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'ID chuyến khai thác (tb_company_trip) — bỏ trống thì cập nhật bản ghi mới nhất của xe',
  })
  companyTripId?: number;
}

export class CompanyTripResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({ example: 1 })
  verhicalId: number;

  @ApiProperty({ example: 1 })
  driverId: number;

  @ApiProperty({ example: 34 })
  totalSeat: number;

  @ApiProperty({ example: 0 })
  totalSeatBooked: number;

  @ApiProperty({ example: 350000 })
  pricePerSeat: number;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class VehicalResponseDto {
  id: string;
  name: string;
  code: string;
  seatType: string;
  seatCount: number;
  vehicalType: string;
  vehicalStatus: string;
  tripId: string;
  driverId: string;
  companyTripId?: number;
  companyTrip?: CompanyTripResponseDto;
  pricePerSeat?: number;
  schedule: string;
  description: string;
  timeStart: string;
  timeEnd: string;
  createdAt: string;
  updatedAt: string;
}

export class CmsVerhicalEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'VEH-001' })
  code: string;

  @ApiProperty({ example: 'Xe giường nằm' })
  name: string;

  @ApiProperty({ example: 'SLEEPER' })
  type: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional({ example: 'Hà Nội - Đà Nẵng' })
  schedule?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  image?: string;
}

export class CmsSeatResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  verhicalId: number;

  @ApiProperty({ example: 'SEAT-xxx' })
  code: string;

  @ApiProperty({ example: 'V-1' })
  name: string;

  @ApiProperty({ example: '1' })
  index: string;

  @ApiProperty({ example: 'GIUONG' })
  type: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiPropertyOptional()
  updatedAt?: string;
}

export class CmsTripResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  name: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  code: string;

  @ApiProperty({ example: 1 })
  roadId: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CmsDriverResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'DRV-xxx' })
  code: string;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  verhicalId: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 'B2-123456' })
  license: string;

  @ApiProperty({ example: '0901234567' })
  phone: string;

  @ApiProperty({ example: 'driver@example.com' })
  email: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 4.5 })
  rate: number;

  @ApiProperty({ example: 10 })
  totalTurn: number;
}

/** Chi tiết CMS: xe + ghế + chuyến mẫu + tài xế + chuyến khai thác */
export class CmsVehicalDetailResponseDto {
  @ApiProperty({ type: CmsVerhicalEntityDto })
  verhical: CmsVerhicalEntityDto;

  @ApiProperty({ type: [CmsSeatResponseDto] })
  seats: CmsSeatResponseDto[];

  @ApiPropertyOptional({ type: CmsTripResponseDto })
  trip: CmsTripResponseDto | null;

  @ApiPropertyOptional({ type: CmsDriverResponseDto })
  driver: CmsDriverResponseDto | null;

  @ApiPropertyOptional({ type: CompanyTripResponseDto })
  companyTrip: CompanyTripResponseDto | null;

  @ApiPropertyOptional({ type: [CompanyTripResponseDto] })
  companyTrips?: CompanyTripResponseDto[];

  @ApiProperty({ example: 'GIUONG' })
  seatType: string;

  @ApiProperty({ example: 34 })
  seatCount: number;

  @ApiProperty({ example: '1' })
  tripId: string;

  @ApiProperty({ example: '1' })
  driverId: string;

  @ApiPropertyOptional({ example: 1 })
  companyTripId?: number;

  @ApiPropertyOptional({ example: 350000 })
  pricePerSeat?: number;

  @ApiPropertyOptional({ example: '08:00' })
  timeStart: string;

  @ApiPropertyOptional({ example: '14:30' })
  timeEnd: string;
}

export class CmsVehicalListResponseDto {
  @ApiProperty({ type: [CmsVehicalDetailResponseDto] })
  items: CmsVehicalDetailResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
