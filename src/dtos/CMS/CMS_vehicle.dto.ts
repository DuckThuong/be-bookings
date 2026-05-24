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
import { CmsVehicleValidationMessage } from '../../assets/messages/cms-vehical.message';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateVehiclePayloadDto {
  @ApiProperty({
    example: 'Xe giường nằm 34 chỗ',
    description: 'Tên phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_NAME_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_NAME_INVALID })
  @MaxLength(255, {
    message: CmsVehicleValidationMessage.VEHICAL_NAME_TOO_LONG,
  })
  vehicalName: string;

  @ApiProperty({
    example: 'VEH-29B-12345',
    description: 'Mã / biển số phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_CODE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_CODE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_CODE_TOO_LONG })
  vehicalCode: string;

  @ApiProperty({
    example: 'GIUONG',
    description: 'Loại ghế',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.SEAT_TYPE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.SEAT_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.SEAT_TYPE_TOO_LONG })
  seatType: string;

  @ApiProperty({
    example: 34,
    description: 'Số lượng ghế',
    required: true,
    type: Number,
  })
  @IsInt({ message: CmsVehicleValidationMessage.SEAT_COUNT_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.SEAT_COUNT_MIN })
  @Max(100, { message: CmsVehicleValidationMessage.SEAT_COUNT_MAX })
  seatCount: number;

  @ApiProperty({
    example: 'SLEEPER',
    description: 'Loại phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_TYPE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_TYPE_TOO_LONG })
  vehicalType: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái phương tiện',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_STATUS_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsVehicleValidationMessage.VEHICAL_STATUS_NOT_IN,
  })
  vehicalStatus: string;

  @ApiPropertyOptional({
    example: '1',
    description:
      'ID chuyến mẫu (tb_trip) — tùy chọn khi tạo; bắt buộc kèm driverId nếu truyền',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.TRIP_ID_INVALID })
  tripId?: string;

  @ApiPropertyOptional({
    example: '1',
    description:
      'ID tài xế (tb_driver) — tùy chọn khi tạo; bắt buộc kèm tripId nếu truyền',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.DRIVER_ID_INVALID })
  driverId?: string;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng hàng ngày',
    description: 'Lịch trình',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.SCHEDULE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.SCHEDULE_INVALID })
  @MaxLength(255, { message: CmsVehicleValidationMessage.SCHEDULE_TOO_LONG })
  schedule: string;

  @ApiProperty({
    example: 'Xe mới, có wifi',
    description: 'Mô tả',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.DESCRIPTION_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.DESCRIPTION_INVALID })
  description: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.TIME_START_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.TIME_START_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicleValidationMessage.TIME_START_FORMAT,
  })
  timeStart: string;

  @ApiProperty({
    example: '14:30',
    description: 'Giờ đến (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.TIME_END_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.TIME_END_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicleValidationMessage.TIME_END_FORMAT,
  })
  timeEnd: string;

  @ApiPropertyOptional({
    example: 350000,
    description: 'Giá mỗi ghế (tb_company_trip.pricePerSeat)',
  })
  @IsOptional()
  @IsNumber({}, { message: CmsVehicleValidationMessage.PRICE_PER_SEAT_INVALID })
  @Min(0, { message: CmsVehicleValidationMessage.PRICE_PER_SEAT_INVALID })
  pricePerSeat?: number;
}

export class UpdateVehiclePayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID phương tiện',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.VEHICAL_ID_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.VEHICAL_ID_INVALID })
  id: number;

  @ApiProperty({
    example: 'Xe giường nằm 34 chỗ',
    description: 'Tên phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_NAME_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_NAME_INVALID })
  @MaxLength(255, {
    message: CmsVehicleValidationMessage.VEHICAL_NAME_TOO_LONG,
  })
  vehicalName: string;

  @ApiProperty({
    example: 'VEH-29B-12345',
    description: 'Mã / biển số phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_CODE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_CODE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_CODE_TOO_LONG })
  vehicalCode: string;

  @ApiProperty({
    example: 'GIUONG',
    description: 'Loại ghế',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.SEAT_TYPE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.SEAT_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.SEAT_TYPE_TOO_LONG })
  seatType: string;

  @ApiProperty({
    example: 34,
    description: 'Số lượng ghế',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.SEAT_COUNT_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.SEAT_COUNT_MIN })
  @Max(100, { message: CmsVehicleValidationMessage.SEAT_COUNT_MAX })
  seatCount: number;

  @ApiProperty({
    example: 'SLEEPER',
    description: 'Loại phương tiện',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_TYPE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_TYPE_TOO_LONG })
  vehicalType: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái phương tiện',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.VEHICAL_STATUS_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsVehicleValidationMessage.VEHICAL_STATUS_NOT_IN,
  })
  vehicalStatus: string;

  @ApiProperty({
    example: '1',
    description: 'ID chuyến mẫu (tb_trip) — bắt buộc khi cập nhật',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.TRIP_ID_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.TRIP_ID_INVALID })
  tripId: string;

  @ApiProperty({
    example: '1',
    description: 'ID tài xế (tb_driver) — bắt buộc khi cập nhật',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.DRIVER_ID_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.DRIVER_ID_INVALID })
  driverId: string;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng hàng ngày',
    description: 'Lịch trình',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.SCHEDULE_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.SCHEDULE_INVALID })
  @MaxLength(255, { message: CmsVehicleValidationMessage.SCHEDULE_TOO_LONG })
  schedule: string;

  @ApiProperty({
    example: 'Xe mới, có wifi',
    description: 'Mô tả',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.DESCRIPTION_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.DESCRIPTION_INVALID })
  description: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.TIME_START_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.TIME_START_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicleValidationMessage.TIME_START_FORMAT,
  })
  timeStart: string;

  @ApiProperty({
    example: '14:30',
    description: 'Giờ đến (HH:mm)',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsVehicleValidationMessage.TIME_END_EMPTY })
  @IsString({ message: CmsVehicleValidationMessage.TIME_END_INVALID })
  @Matches(TIME_PATTERN, {
    message: CmsVehicleValidationMessage.TIME_END_FORMAT,
  })
  timeEnd: string;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: CmsVehicleValidationMessage.PRICE_PER_SEAT_INVALID })
  @Min(0, { message: CmsVehicleValidationMessage.PRICE_PER_SEAT_INVALID })
  pricePerSeat?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'ID chuyến khai thác (tb_company_trip) — bỏ trống thì cập nhật bản ghi mới nhất của xe',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.COMPANY_TRIP_ID_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.COMPANY_TRIP_ID_INVALID })
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
  vehicleId: number;

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

export class VehicleResponseDto {
  id: string;
  name: string;
  code: string;
  seatType: string;
  seatCount: number;
  vehicalType: string;
  vehicalStatus: string;
  tripId?: string;
  driverId?: string;
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

export class CmsVehicleEntityDto {
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
  vehicleId: number;

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
  vehicleId: number;

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
export class CmsVehicleDetailResponseDto {
  @ApiProperty({ type: CmsVehicleEntityDto })
  vehicle: CmsVehicleEntityDto;

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

export class CmsVehicleListResponseDto {
  @ApiProperty({ type: [CmsVehicleDetailResponseDto] })
  items: CmsVehicleDetailResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
