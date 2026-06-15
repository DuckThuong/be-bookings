import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ClientTripFilterKey,
  ClientTripSeatType,
  ClientTripSortKey,
} from '../../assets/config/client-trip-search.config';

const SEAT_TYPES: ClientTripSeatType[] = [
  'all',
  'sleeper',
  'seat',
  'limousine',
  'bus',
];

const SORT_KEYS: ClientTripSortKey[] = [
  'price',
  'departure',
  'duration',
  'rating',
];

const FILTER_KEYS: ClientTripFilterKey[] = [
  'all',
  'morning',
  'daytime',
  'night',
  'wifi',
  'ac',
];

const parseCommaList = (value: unknown): string[] | undefined => {
  if (value == null || value === '') return undefined;
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      String(item)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    );
  }
  return String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
};

export class ClientSearchTripsQueryDto {
  @ApiPropertyOptional({ example: 'Hà Nội', description: 'Thành phố đi' })
  @IsOptional()
  @IsString()
  fromCity?: string;

  @ApiPropertyOptional({
    example: 'TP. Hồ Chí Minh',
    description: 'Thành phố đến',
  })
  @IsOptional()
  @IsString()
  toCity?: string;

  @ApiPropertyOptional({
    example: '11/05/2026',
    description: 'Ngày đi (DD/MM/YYYY)',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 9 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  passengers?: number;

  @ApiPropertyOptional({
    enum: SEAT_TYPES,
    example: 'all',
    description: 'Loại ghế',
  })
  @IsOptional()
  @IsIn(SEAT_TYPES)
  seatType?: ClientTripSeatType;

  @ApiPropertyOptional({
    example: 'morning,wifi',
    description:
      'Bộ lọc: all | morning | daytime | night | wifi | ac (phân tách bằng dấu phẩy)',
  })
  @IsOptional()
  @Transform(({ value }) => parseCommaList(value))
  @IsArray()
  @IsIn(FILTER_KEYS, { each: true })
  filters?: ClientTripFilterKey[];

  @ApiPropertyOptional({ enum: SORT_KEYS, example: 'price' })
  @IsOptional()
  @IsIn(SORT_KEYS)
  sortKey?: ClientTripSortKey;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @ApiPropertyOptional({
    example: 12,
    description:
      'Lọc theo nhà xe (companyId). Dùng khi click vào nhà xe nổi bật ở trang chủ.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;
}

export class ClientTripRoutePointDto {
  @ApiProperty({ example: '06:00' })
  time: string;

  @ApiProperty({ example: 'Hà Nội' })
  city: string;

  @ApiProperty({ example: 'Bến xe Mỹ Đình' })
  station: string;
}

export class ClientTripOperatorDto {
  @ApiProperty({ example: 'GR' })
  code: string;

  @ApiProperty({ example: '#0a0e1a' })
  logoColor: string;

  @ApiProperty({ example: 'GoRide Express' })
  name: string;

  @ApiProperty({ example: 'Giường nằm VIP 40 chỗ' })
  vehicleType: string;

  @ApiProperty({ example: 4.9 })
  rating: number;

  @ApiProperty({ example: '2.1k' })
  reviewCount: string;
}

export class ClientTripBadgeDto {
  @ApiProperty({ enum: ['green', 'amber', 'blue', 'gray', 'red'] })
  type: 'green' | 'amber' | 'blue' | 'gray' | 'red';

  @ApiProperty({ example: '✓ Còn vé' })
  label: string;
}

export class ClientTripAmenityDto {
  @ApiProperty({ example: '📶' })
  icon: string;

  @ApiProperty({ example: 'Wifi miễn phí' })
  label: string;
}

export class ClientTripItemDto {
  @ApiProperty({ example: '12' })
  id: string;

  @ApiPropertyOptional({ example: true })
  featured?: boolean;

  @ApiProperty({ type: ClientTripOperatorDto })
  operator: ClientTripOperatorDto;

  @ApiProperty({ type: ClientTripRoutePointDto })
  departure: ClientTripRoutePointDto;

  @ApiProperty({ type: ClientTripRoutePointDto })
  arrival: ClientTripRoutePointDto;

  @ApiProperty({ example: '~32 tiếng' })
  duration: string;

  @ApiProperty({ example: 'Thẳng, không dừng' })
  stopLabel: string;

  @ApiProperty({ example: 350000 })
  price: number;

  @ApiProperty({ example: 4 })
  seatsLeft: number;

  @ApiProperty({ type: [ClientTripBadgeDto] })
  badges: ClientTripBadgeDto[];

  @ApiProperty({ type: [ClientTripAmenityDto] })
  amenities: ClientTripAmenityDto[];
}

export class ClientTripSearchCriteriaDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty({ example: '11/05/2026' })
  date: string;

  @ApiProperty({ example: 1 })
  passengers: number;

  @ApiProperty({ enum: SEAT_TYPES, example: 'all' })
  seatType: ClientTripSeatType;

  @ApiPropertyOptional({ example: 12, description: 'Lọc theo nhà xe (nếu có)' })
  companyId?: number;

  @ApiPropertyOptional({
    example: 'Viet Express',
    description: 'Tên nhà xe (nếu có)',
  })
  companyName?: string;
}

export class ClientTripSearchMetaDto {
  @ApiProperty({ example: 12 })
  resultCount: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: true })
  hasMore: boolean;

  @ApiProperty({ enum: SORT_KEYS, example: 'price' })
  sortKey: ClientTripSortKey;

  @ApiProperty({ type: [String], example: ['all'] })
  filters: ClientTripFilterKey[];
}

export class ClientSearchTripsResponseDto {
  @ApiProperty({ type: ClientTripSearchCriteriaDto })
  search: ClientTripSearchCriteriaDto;

  @ApiProperty({ type: ClientTripSearchMetaDto })
  meta: ClientTripSearchMetaDto;

  @ApiProperty({ type: [ClientTripItemDto] })
  trips: ClientTripItemDto[];
}
