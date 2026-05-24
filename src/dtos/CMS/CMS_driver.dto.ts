import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsDriverValidationMessage } from '../../assets/messages/cms-driver.message';
import {
  CompanyTripResponseDto,
  CmsTripResponseDto,
  CmsVehicleEntityDto,
} from './CMS_vehicle.dto';

export class CreateDriverPayloadDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên tài xế',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_NAME_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_NAME_INVALID })
  @MaxLength(255, {
    message: CmsDriverValidationMessage.DRIVER_NAME_TOO_LONG,
  })
  driverName: string;

  @ApiPropertyOptional({
    example: 'DRV-001',
    description: 'Mã tài xế (tự sinh nếu bỏ trống)',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsDriverValidationMessage.DRIVER_CODE_INVALID })
  @MaxLength(24, { message: CmsDriverValidationMessage.DRIVER_CODE_TOO_LONG })
  driverCode?: string;

  @ApiProperty({
    example: 1,
    description: 'ID phương tiện mặc định (tb_vehicle)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsDriverValidationMessage.VEHICLE_ID_INVALID })
  @Min(1, { message: CmsDriverValidationMessage.VEHICLE_ID_INVALID })
  vehicleId: number;

  @ApiProperty({
    example: 'B2-123456',
    description: 'Số bằng lái',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.LICENSE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.LICENSE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.LICENSE_TOO_LONG })
  license: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.PHONE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.PHONE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.PHONE_TOO_LONG })
  phone: string;

  @ApiProperty({
    example: 'driver@example.com',
    description: 'Email',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: CmsDriverValidationMessage.EMAIL_INVALID })
  @MaxLength(100, { message: CmsDriverValidationMessage.EMAIL_TOO_LONG })
  email: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái tài xế',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_STATUS_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsDriverValidationMessage.DRIVER_STATUS_NOT_IN,
  })
  driverStatus: string;

  @ApiPropertyOptional({
    example: 'Tài xế kinh nghiệm 5 năm',
    description: 'Mô tả',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsDriverValidationMessage.DESCRIPTION_INVALID })
  description?: string;
}

export class UpdateDriverPayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID tài xế',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsDriverValidationMessage.DRIVER_ID_INVALID })
  @Min(1, { message: CmsDriverValidationMessage.DRIVER_ID_INVALID })
  id: number;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên tài xế',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_NAME_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_NAME_INVALID })
  @MaxLength(255, {
    message: CmsDriverValidationMessage.DRIVER_NAME_TOO_LONG,
  })
  driverName: string;

  @ApiProperty({
    example: 1,
    description: 'ID phương tiện mặc định (tb_vehicle)',
    required: true,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: CmsDriverValidationMessage.VEHICLE_ID_INVALID })
  @Min(1, { message: CmsDriverValidationMessage.VEHICLE_ID_INVALID })
  vehicleId: number;

  @ApiProperty({
    example: 'B2-123456',
    description: 'Số bằng lái',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.LICENSE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.LICENSE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.LICENSE_TOO_LONG })
  license: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.PHONE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.PHONE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.PHONE_TOO_LONG })
  phone: string;

  @ApiProperty({
    example: 'driver@example.com',
    description: 'Email',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: CmsDriverValidationMessage.EMAIL_INVALID })
  @MaxLength(100, { message: CmsDriverValidationMessage.EMAIL_TOO_LONG })
  email: string;

  @ApiProperty({
    example: EntityStatus.ACTIVE,
    description: 'Trạng thái tài xế',
    required: true,
    enum: EntityStatus,
    type: String,
  })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_STATUS_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsDriverValidationMessage.DRIVER_STATUS_NOT_IN,
  })
  driverStatus: string;

  @ApiPropertyOptional({
    example: 'Tài xế kinh nghiệm 5 năm',
    description: 'Mô tả',
    type: String,
  })
  @IsOptional()
  @IsString({ message: CmsDriverValidationMessage.DESCRIPTION_INVALID })
  description?: string;
}

export class CmsDriverEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'DRV-001' })
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

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiPropertyOptional()
  updatedAt?: string;
}

export class DriverResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 'DRV-001' })
  code: string;

  @ApiProperty({ example: '1' })
  vehicleId: string;

  @ApiProperty({ example: 'B2-123456' })
  license: string;

  @ApiProperty({ example: '0901234567' })
  phone: string;

  @ApiProperty({ example: 'driver@example.com' })
  email: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  driverStatus: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 4.5 })
  rate: number;

  @ApiProperty({ example: 10 })
  totalTurn: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class CmsDriverDetailResponseDto {
  @ApiProperty({ type: CmsDriverEntityDto })
  driver: CmsDriverEntityDto;

  @ApiPropertyOptional({ type: CmsVehicleEntityDto })
  vehicle: CmsVehicleEntityDto | null;

  @ApiPropertyOptional({ type: CmsTripResponseDto })
  trip: CmsTripResponseDto | null;

  @ApiPropertyOptional({ type: CompanyTripResponseDto })
  companyTrip: CompanyTripResponseDto | null;

  @ApiPropertyOptional({ type: [CompanyTripResponseDto] })
  companyTrips?: CompanyTripResponseDto[];

  @ApiProperty({ example: '1' })
  vehicleId: string;

  @ApiProperty({ example: '1' })
  tripId: string;

  @ApiPropertyOptional({ example: 1 })
  companyTripId?: number;
}

export class CmsDriverListResponseDto {
  @ApiProperty({ type: [CmsDriverDetailResponseDto] })
  items: CmsDriverDetailResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
