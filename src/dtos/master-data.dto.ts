import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MasterDataDtoPayload {
  @ApiProperty({
    example: 'OPERATOR',
    description: 'Loại dữ liệu',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: 'code',
    description: 'Mã dữ liệu',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class MasterDataItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'DRIVER_STATUS' })
  type: string;

  @ApiProperty({ example: 'available' })
  code: string;

  @ApiProperty({ example: 'Sẵn sàng' })
  name: string;

  @ApiProperty({ example: '#22c55e', required: false })
  rule?: string;

  @ApiProperty({ example: 1 })
  sort: number;
}

export class MasterDataDtoResponse {
  @ApiProperty({
    example: 'id',
    description: 'ID dữ liệu',
    required: true,
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'name',
    description: 'Tên dữ liệu',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 'rule',
    description: 'Quy tắc/giá trị bổ sung',
    required: true,
    type: String,
  })
  rule: string;

  @ApiProperty({
    example: 0,
    description: 'Thứ tự sắp xếp',
    required: true,
    type: Number,
  })
  sort: number;

  @ApiProperty({
    example: 'type',
    description: 'Loại dữ liệu',
    required: true,
    type: String,
  })
  type: string;

  @ApiProperty({
    example: 'code',
    description: 'Mã dữ liệu',
    required: true,
    type: String,
  })
  code: string;
}

// Response for all statuses endpoint
export class MasterDataAllResponseDto {
  @ApiProperty({ type: [MasterDataItemDto] })
  driverStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  driverLicenses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  vehicleStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  vehicleTypes: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  routeStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  customerStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  customerTiers: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  reportStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  reportTypes: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  seatTypes: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  registrationStatuses: MasterDataItemDto[];

  @ApiProperty({ type: [MasterDataItemDto] })
  bookingStatuses: MasterDataItemDto[];
}
