import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RegistrationStatus } from '../entities/company-registration.entity';

export class CreateCompanyRegistrationDto {
  @ApiProperty({ example: 'Nhà xe Phương Trang' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  representativePhone?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  representativeName?: string;

  @ApiPropertyOptional({ example: 'Giám đốc' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  representativePosition?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessAddress?: string;

  @ApiPropertyOptional({ example: '2024-01-01', type: String })
  @IsOptional()
  @IsString()
  businessLicenseDate?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/license.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessLicenseUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/idcard.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  idCardUrl?: string;

  @ApiPropertyOptional({ example: 'Nhà xe uy tín' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCompanyRegistrationStatusDto {
  @ApiProperty({
    example: RegistrationStatus.APPROVED,
    enum: RegistrationStatus,
  })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiPropertyOptional({ example: 'Hồ sơ không đầy đủ' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}

export class CompanyRegistrationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'USR-001' })
  userCode: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  userName: string;

  @ApiProperty({ example: '0912345678' })
  userPhone: string;

  @ApiProperty({ example: 'user@example.com' })
  userEmail: string;

  @ApiProperty({ example: 'Nhà xe Phương Trang' })
  companyName: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  address?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  representativePhone?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  representativeName?: string;

  @ApiPropertyOptional({ example: 'Giám đốc' })
  representativePosition?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  businessAddress?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  businessLicenseDate?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/license.pdf' })
  businessLicenseUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/idcard.jpg' })
  idCardUrl?: string;

  @ApiPropertyOptional({ example: 'Nhà xe uy tín' })
  description?: string;

  @ApiProperty({ example: RegistrationStatus.PENDING, enum: RegistrationStatus })
  status: RegistrationStatus;

  @ApiPropertyOptional({ example: 'Hồ sơ không đầy đủ' })
  rejectionReason?: string | null;

  @ApiPropertyOptional({ example: 1 })
  processedByAdminId?: number | null;

  @ApiPropertyOptional({ example: '2024-01-02' })
  processedAt?: string | Date | null;

  @ApiProperty({ example: '2024-01-01' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-02' })
  updatedAt: string;
}

export class RegistrationQueryDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;
}
