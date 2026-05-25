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

  @ApiPropertyOptional({
    description: 'Chỉ Admin — ID người đại diện (user.id)',
  })
  userLeadId?: string;
}

export class CreateRoadDto {
  @ApiProperty({ example: 1, description: 'ID nhà xe' })
  companyId: number;

  @ApiPropertyOptional({
    example: 'ROD-xxx',
    description: 'Mã tuyến (tự sinh nếu bỏ trống)',
  })
  code?: string;

  @ApiProperty({ example: 'Hà Nội - Đà Nẵng' })
  name: string;

  @ApiProperty({ example: 764.5 })
  length: number;

  @ApiProperty({ example: 'Hà Nội' })
  startPoint: string;

  @ApiProperty({ example: 'Đà Nẵng' })
  endPoint: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  totalTurn?: number;

  @ApiPropertyOptional({ example: '6h30m' })
  standardDuration?: string;

  @ApiPropertyOptional({ example: 4 })
  tripsPerDay?: number;

  @ApiPropertyOptional({ example: 75.5 })
  averageOccupancy?: number;

  @ApiPropertyOptional({ example: 15000000 })
  estimatedRevenue?: number;

  @ApiPropertyOptional({ example: 'Xe giường 34 chỗ' })
  leadVehicle?: string | null;

  @ApiPropertyOptional({ example: 'HIGH' })
  demandLevel?: string | null;

  @ApiPropertyOptional({ example: 'Tuyến cao điểm cuối tuần' })
  note?: string | null;
}

export class UpdateRoadDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  length?: number;

  @ApiPropertyOptional()
  startPoint?: string;

  @ApiPropertyOptional()
  endPoint?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  totalTurn?: number;

  @ApiPropertyOptional()
  standardDuration?: string;

  @ApiPropertyOptional()
  tripsPerDay?: number;

  @ApiPropertyOptional()
  averageOccupancy?: number;

  @ApiPropertyOptional()
  estimatedRevenue?: number;

  @ApiPropertyOptional()
  leadVehicle?: string | null;

  @ApiPropertyOptional()
  demandLevel?: string | null;

  @ApiPropertyOptional()
  note?: string | null;
}

export class CreateTripDto {
  @ApiProperty({ example: 'Chuyến đêm HN-ĐN' })
  name: string;

  @ApiPropertyOptional({
    example: 'TRP-xxx',
    description: 'Mã chuyến (tự sinh nếu bỏ trống)',
  })
  code?: string;

  @ApiProperty({ example: 1, description: 'ID tuyến thuộc nhà xe' })
  roadId: number;

  @ApiProperty({ example: 1, description: 'ID tài xế' })
  driverId: number;

  @ApiProperty({ example: 1, description: 'ID phương tiện' })
  vehicleId: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional({ example: '08:00' })
  departure?: string;

  @ApiPropertyOptional({ example: '14:30' })
  arrival?: string;

  @ApiProperty({ example: '350000' })
  seatPrice: string;

  @ApiPropertyOptional({ example: 0 })
  bookedSeats?: number;
}

export class UpdateTripDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  roadId?: number;

  @ApiPropertyOptional()
  driverId?: number;

  @ApiPropertyOptional()
  vehicleId?: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  departure?: string;

  @ApiPropertyOptional()
  arrival?: string;

  @ApiPropertyOptional()
  seatPrice?: string;

  @ApiPropertyOptional()
  bookedSeats?: number;
}

export class CreateVehicleDto {
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
  @ApiPropertyOptional({ example: 1, description: 'ID nhà xe' })
  companyId?: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiPropertyOptional({
    example: 'DRV-xxx',
    description: 'Mã tài xế (tự sinh nếu bỏ trống)',
  })
  code?: string;

  @ApiProperty({ example: 'B2' })
  license: string;

  @ApiProperty({ example: '123456' })
  licenseNum: string;

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
  vehicleId: number;

  @ApiProperty({ example: 1, description: 'ID tài xế' })
  driverId: number;

  @ApiProperty({ example: 40 })
  totalSeat: number;

  @ApiPropertyOptional({ example: 0 })
  totalSeatBooked?: number;

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
  vehicleId?: number;

  @ApiPropertyOptional()
  driverId?: number;

  @ApiPropertyOptional()
  totalSeat?: number;

  @ApiPropertyOptional()
  totalSeatBooked?: number;

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
  vehicleId: number;

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
  vehicleId: number;

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
