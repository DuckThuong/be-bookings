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
import { EntityStatus, TripStatus, VALID_TRIP_STATUSES } from '../../assets/constants/company.constants';
import { CmsTripValidationMessage } from '../../assets/messages/cms-trip.message';
import { OptionalCompanyIdQueryDto } from '../transport/common.dto';

// DTO for resetting trip operation status
export class ResetTripOperationStatusPayloadDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.TRIP_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.TRIP_ID_INVALID })
  id: number;
}

export class CmsTripListQueryDto extends OptionalCompanyIdQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roadId?: number;
}

export class CmsTripFormPayloadDto {
  @ApiPropertyOptional({ example: 'TRP-001' })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.TRIP_CODE_INVALID })
  @MaxLength(24, { message: CmsTripValidationMessage.TRIP_CODE_TOO_LONG })
  code?: string;

  @ApiProperty({ example: 'Ha Noi - Da Nang 08:00' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roadId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driverId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicleId: number;

  @ApiProperty({ example: EntityStatus.ACTIVE, enum: EntityStatus })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_STATUS_EMPTY })
  @IsString({ message: CmsTripValidationMessage.TRIP_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsTripValidationMessage.TRIP_STATUS_NOT_IN,
  })
  status: string;

  @ApiPropertyOptional({ example: TripStatus.SCHEDULED, enum: TripStatus })
  @IsOptional()
  @IsString()
  @IsIn(VALID_TRIP_STATUSES, {
    message: CmsTripValidationMessage.TRIP_OPERATION_STATUS_INVALID,
  })
  operationStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.NOTE_INVALID })
  @MaxLength(500, { message: CmsTripValidationMessage.NOTE_TOO_LONG })
  description?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.DEPARTURE_INVALID })
  @MaxLength(50, { message: CmsTripValidationMessage.DEPARTURE_TOO_LONG })
  departure?: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsOptional()
  @IsString({ message: CmsTripValidationMessage.ARRIVAL_INVALID })
  @MaxLength(50, { message: CmsTripValidationMessage.ARRIVAL_TOO_LONG })
  arrival?: string;

  @ApiProperty({ example: '350000' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  seatPrice: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.BOOKED_SEATS_INVALID })
  @Min(0, { message: CmsTripValidationMessage.BOOKED_SEATS_INVALID })
  bookedSeats?: number;
}

export class CreateTripPayloadDto extends CmsTripFormPayloadDto {}

export class UpdateTripPayloadDto extends CmsTripFormPayloadDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.TRIP_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.TRIP_ID_INVALID })
  id: number;
}

export class CmsTripEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TRP-001' })
  code: string;

  @ApiProperty({ example: 'Ha Noi - Da Nang 08:00' })
  name: string;

  @ApiProperty({ example: 1 })
  roadId: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  driverId: number;

  @ApiProperty({ example: 1 })
  vehicleId: number;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiPropertyOptional({ example: 'SCHEDULED' })
  operationStatus?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: '08:00' })
  departure: string;

  @ApiProperty({ example: '14:30' })
  arrival: string;

  @ApiProperty({ example: '350000' })
  seatPrice: string;

  @ApiProperty({ example: 0 })
  bookedSeats: number;

  @ApiPropertyOptional({ example: 'TP.HCM — Đà Lạt' })
  roadName?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  driverName?: string;

  @ApiPropertyOptional({ example: '51B-123.45' })
  vehicleLabel?: string;

  @ApiPropertyOptional({ example: 45 })
  capacity?: number;

  @ApiPropertyOptional({ example: 82 })
  occupancyRate?: number;
}

export class TripResponseDto extends CmsTripEntityDto {}

export class CmsTripDetailResponseDto extends CmsTripEntityDto {}

export class CmsTripListResponseDto {
  @ApiProperty({ type: [CmsTripEntityDto] })
  items: CmsTripEntityDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class UpdateOperationStatusPayloadDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: CmsTripValidationMessage.TRIP_ID_INVALID })
  @Min(1, { message: CmsTripValidationMessage.TRIP_ID_INVALID })
  id: number;

  @ApiProperty({ example: TripStatus.PREPARING, enum: TripStatus })
  @IsNotEmpty({ message: CmsTripValidationMessage.TRIP_STATUS_EMPTY })
  @IsString()
  @IsIn(VALID_TRIP_STATUSES, {
    message: CmsTripValidationMessage.TRIP_OPERATION_STATUS_INVALID,
  })
  operationStatus: string;
}
