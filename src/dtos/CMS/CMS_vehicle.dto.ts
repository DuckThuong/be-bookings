import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsVehicleValidationMessage } from '../../assets/messages/cms-vehical.message';

export class CmsVehicleFormPayloadDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.COMPANY_ID_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.COMPANY_ID_INVALID })
  companyId?: number;

  @ApiPropertyOptional({ example: '51B-12345' })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_CODE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_CODE_TOO_LONG })
  code?: string;

  @ApiPropertyOptional({ example: 'Sleeper' })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.VEHICAL_TYPE_TOO_LONG })
  type?: string;

  @ApiPropertyOptional({ example: 'Sleeper VIP' })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_NAME_INVALID })
  @MaxLength(255, {
    message: CmsVehicleValidationMessage.VEHICAL_NAME_TOO_LONG,
  })
  name?: string;

  @ApiPropertyOptional({ example: EntityStatus.ACTIVE, enum: EntityStatus })
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.VEHICAL_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsVehicleValidationMessage.VEHICAL_STATUS_NOT_IN,
  })
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.SCHEDULE_INVALID })
  @MaxLength(255, { message: CmsVehicleValidationMessage.SCHEDULE_TOO_LONG })
  schedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.DESCRIPTION_INVALID })
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: CmsVehicleValidationMessage.SEAT_TYPE_INVALID })
  @MaxLength(50, { message: CmsVehicleValidationMessage.SEAT_TYPE_TOO_LONG })
  seatType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.SEAT_COUNT_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.SEAT_COUNT_MIN })
  @Max(100, { message: CmsVehicleValidationMessage.SEAT_COUNT_MAX })
  seatCount?: number;
}

export class CreateVehiclePayloadDto extends CmsVehicleFormPayloadDto {}

export class UpdateVehiclePayloadDto extends CmsVehicleFormPayloadDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: CmsVehicleValidationMessage.VEHICAL_ID_INVALID })
  @Min(1, { message: CmsVehicleValidationMessage.VEHICAL_ID_INVALID })
  id: number;
}

export class CmsVehicleEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty({ example: '51B-12345' })
  code: string;

  @ApiProperty({ example: 'Sleeper' })
  type: string;

  @ApiPropertyOptional()
  schedule?: string;

  @ApiProperty({ example: EntityStatus.ACTIVE })
  status: string;

  @ApiProperty({ example: 'Sleeper VIP' })
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ example: 'GIUONG' })
  seatType: string;

  @ApiProperty({ example: 34 })
  seatCount: number;
}

export class VehicleResponseDto extends CmsVehicleEntityDto {}

export class CmsVehicleDetailResponseDto extends CmsVehicleEntityDto {}

export class CmsVehicleListResponseDto {
  @ApiProperty({ type: [CmsVehicleEntityDto] })
  items: CmsVehicleEntityDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
