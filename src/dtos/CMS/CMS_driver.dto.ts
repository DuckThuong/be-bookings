import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CmsDriverValidationMessage } from '../../assets/messages/cms-driver.message';

export class CmsDriverFormPayloadDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_NAME_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_NAME_INVALID })
  @MaxLength(255, {
    message: CmsDriverValidationMessage.DRIVER_NAME_TOO_LONG,
  })
  name: string;

  @ApiPropertyOptional({ example: 'DRV-001' })
  @IsOptional()
  @IsString({ message: CmsDriverValidationMessage.DRIVER_CODE_INVALID })
  @MaxLength(24, { message: CmsDriverValidationMessage.DRIVER_CODE_TOO_LONG })
  code?: string;

  @ApiProperty({ example: 'B2' })
  @IsNotEmpty({ message: CmsDriverValidationMessage.LICENSE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.LICENSE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.LICENSE_TOO_LONG })
  license: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: CmsDriverValidationMessage.LICENSE_NUM_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.LICENSE_NUM_INVALID })
  @MaxLength(12, { message: CmsDriverValidationMessage.LICENSE_NUM_TOO_LONG })
  licenseNum: string;

  @ApiProperty({ example: '0901234567' })
  @IsNotEmpty({ message: CmsDriverValidationMessage.PHONE_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.PHONE_INVALID })
  @MaxLength(50, { message: CmsDriverValidationMessage.PHONE_TOO_LONG })
  phone: string;

  @ApiProperty({ example: 'driver@example.com' })
  @IsNotEmpty({ message: CmsDriverValidationMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: CmsDriverValidationMessage.EMAIL_INVALID })
  @MaxLength(100, { message: CmsDriverValidationMessage.EMAIL_TOO_LONG })
  email: string;

  @ApiProperty({ example: EntityStatus.ACTIVE, enum: EntityStatus })
  @IsNotEmpty({ message: CmsDriverValidationMessage.DRIVER_STATUS_EMPTY })
  @IsString({ message: CmsDriverValidationMessage.DRIVER_STATUS_INVALID })
  @IsIn([EntityStatus.ACTIVE, EntityStatus.INACTIVE], {
    message: CmsDriverValidationMessage.DRIVER_STATUS_NOT_IN,
  })
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: CmsDriverValidationMessage.DESCRIPTION_INVALID })
  description?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalTurn?: number;
}

export class CreateDriverPayloadDto extends CmsDriverFormPayloadDto {}

export class UpdateDriverPayloadDto extends CmsDriverFormPayloadDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: CmsDriverValidationMessage.DRIVER_ID_INVALID })
  @Min(1, { message: CmsDriverValidationMessage.DRIVER_ID_INVALID })
  id: number;
}

export class CmsDriverEntityDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'DRV-001' })
  code: string;

  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 'Nguyen Van A' })
  name: string;

  @ApiProperty({ example: 'B2' })
  license: string;

  @ApiProperty({ example: '123456' })
  licenseNum: string;

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

export class DriverResponseDto extends CmsDriverEntityDto {}

export class CmsDriverListResponseDto {
  @ApiProperty({ type: [CmsDriverEntityDto] })
  items: CmsDriverEntityDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class CmsDriverDetailResponseDto extends CmsDriverEntityDto {}
