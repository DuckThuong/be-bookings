import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../assets/constants/company.constants';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Nhà xe Phương Trang' })
  companyName: string;

  @ApiPropertyOptional({ example: 'Nhà xe uy tín' })
  description?: string;

  @ApiPropertyOptional({
    example: EntityStatus.ACTIVE,
    enum: EntityStatus,
  })
  status?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional({ description: 'Chỉ Admin — mã userCode người đại diện' })
  userLeadId?: string;
}

export class CreateRoadDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  companyId: number;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  name: string;

  @ApiProperty({ example: 764.5 })
  length: number;

  @ApiProperty({ example: 'EXPRESS' })
  type: string;

  @ApiProperty({ example: 'Hà Nội' })
  startPoint: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  endPoint: string;

  @ApiProperty({ example: '20:00' })
  startTime: string;

  @ApiProperty({ example: '10:00' })
  endTime: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class UpdateRoadDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  length?: number;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  startPoint?: string;

  @ApiPropertyOptional()
  endPoint?: string;

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class CreateTripDto {
  @ApiProperty({ example: 'Chuyến đêm HN-ĐN' })
  name: string;

  @ApiProperty({ example: 1, description: 'ID tuyến thuộc nhà xe' })
  roadId: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class UpdateTripDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  roadId?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class CreateVehicleDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  companyId: number;

  @ApiProperty({ example: '51B-12345', description: 'Biển số xe' })
  code: string;

  @ApiProperty({ example: 'Giường nằm 40 chỗ' })
  type: string;

  @ApiProperty({ example: 'Xe giường nằm VIP' })
  name: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  schedule?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  schedule?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class CreateDriverDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  companyId: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 1, description: 'ID phương tiện mặc định' })
  verhicalId: number;

  @ApiProperty({ example: 'B2-123456' })
  license: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;

  @ApiProperty({ example: 'driver@example.com' })
  email: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class UpdateDriverDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  verhicalId?: number;

  @ApiPropertyOptional()
  license?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class CreateCompanyTripDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  companyId: number;

  @ApiProperty({ example: 1, description: 'ID chuyến mẫu (tb_trip)' })
  tripId: number;

  @ApiProperty({ example: 1, description: 'ID phương tiện' })
  verhicalId: number;

  @ApiProperty({ example: 1, description: 'ID tài xế' })
  driverId: number;

  @ApiProperty({ example: 40 })
  totalSeat: number;

  @ApiProperty({ example: 350000 })
  pricePerSeat: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class UpdateCompanyTripDto {
  @ApiPropertyOptional()
  tripId?: number;

  @ApiPropertyOptional()
  verhicalId?: number;

  @ApiPropertyOptional()
  driverId?: number;

  @ApiPropertyOptional()
  totalSeat?: number;

  @ApiPropertyOptional()
  pricePerSeat?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;
}

export class CreateSeatDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe (kiểm tra quyền)' })
  companyId: number;

  @ApiProperty({ example: 1, description: 'ID phương tiện' })
  verhicalId: number;

  @ApiProperty({ example: 'A1' })
  name: string;

  @ApiProperty({ example: '1-1', description: 'Vị trí hàng/cột' })
  index: string;

  @ApiProperty({ example: 'STANDARD' })
  type: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CreateSeatItemDto {
  @ApiProperty({ example: 'A1' })
  name: string;

  @ApiProperty({ example: '1-1' })
  index: string;

  @ApiProperty({ example: 'STANDARD' })
  type: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CreateSeatsBatchDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  verhicalId: number;

  @ApiProperty({ type: [CreateSeatItemDto] })
  seats: CreateSeatItemDto[];
}

export class CompanyOverviewDto {
  roadCount: number;
  tripCount: number;
  vehicleCount: number;
  driverCount: number;
  companyTripCount: number;
  seatCount: number;
}
