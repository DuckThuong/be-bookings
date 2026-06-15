import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const HIGHLIGHT_TYPE_OPERATOR = 'OPERATOR';
export const HIGHLIGHT_TYPE_TRIP = 'TRIP';

export const HIGHLIGHT_TYPES = [
  HIGHLIGHT_TYPE_OPERATOR,
  HIGHLIGHT_TYPE_TRIP,
] as const;

export type ClientHomeHighlightType = (typeof HIGHLIGHT_TYPES)[number];

export class ClientHomeHighlightsQueryDto {
  @ApiProperty({
    enum: HIGHLIGHT_TYPES,
    example: HIGHLIGHT_TYPE_OPERATOR,
    description:
      'Loại dữ liệu: OPERATOR (nhà xe nổi bật) hoặc TRIP (chuyến xe đặt nhiều nhất)',
  })
  @IsIn(HIGHLIGHT_TYPES)
  type: ClientHomeHighlightType;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class ClientHomeHighlightOperatorItemDto {
  @ApiProperty({ example: 12, description: 'ID nhà xe' })
  id: number;

  @ApiProperty({ example: 'VXR' })
  code: string;

  @ApiProperty({ example: 'Viet Express' })
  name: string;

  @ApiProperty({ example: '#0a0e1a' })
  logoColor: string;

  @ApiProperty({ example: 'GR' })
  shortName: string;

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: '2.3k' })
  reviewCount: string;

  @ApiProperty({
    example: 1248,
    description: 'Tổng số vé đã bán (PAID) của nhà xe',
  })
  totalTickets: number;

  @ApiProperty({
    example: 26,
    description: 'Số chuyến xe (template) đang hoạt động của nhà xe',
  })
  activeTrips: number;
}

export class ClientHomeHighlightTripOperatorDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'VXR' })
  code: string;

  @ApiProperty({ example: 'Viet Express' })
  name: string;

  @ApiProperty({ example: 'GR' })
  shortName: string;

  @ApiProperty({ example: '#0a0e1a' })
  logoColor: string;

  @ApiProperty({ example: 4.8 })
  rating: number;

  @ApiProperty({ example: '2.3k' })
  reviewCount: string;
}

export class ClientHomeHighlightTripRoutePointDto {
  @ApiProperty({ example: '06:00' })
  time: string;

  @ApiProperty({ example: 'Hà Nội' })
  city: string;

  @ApiProperty({ example: 'Bến xe Mỹ Đình' })
  station: string;
}

export class ClientHomeHighlightTripItemDto {
  @ApiProperty({ example: 34, description: 'ID chuyến' })
  id: number;

  @ApiProperty({ example: 'TRIP-340001' })
  code: string;

  @ApiProperty({ example: 'Hà Nội - Sài Gòn (Limousine)' })
  name: string;

  @ApiProperty({ type: ClientHomeHighlightTripOperatorDto })
  operator: ClientHomeHighlightTripOperatorDto;

  @ApiProperty({ type: ClientHomeHighlightTripRoutePointDto })
  departure: ClientHomeHighlightTripRoutePointDto;

  @ApiProperty({ type: ClientHomeHighlightTripRoutePointDto })
  arrival: ClientHomeHighlightTripRoutePointDto;

  @ApiProperty({ example: '~32 tiếng' })
  duration: string;

  @ApiProperty({ example: 'Giường nằm VIP 40 chỗ' })
  vehicleType: string;

  @ApiProperty({ example: 350000 })
  price: number;

  @ApiProperty({ example: 12, description: 'Số chỗ còn lại' })
  seatsLeft: number;

  @ApiProperty({
    example: 156,
    description: 'Tổng số vé đã bán (PAID) của chuyến này',
  })
  totalTickets: number;
}

export class ClientHomeHighlightsResponseDto {
  @ApiProperty({ enum: HIGHLIGHT_TYPES, example: HIGHLIGHT_TYPE_OPERATOR })
  type: ClientHomeHighlightType;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ type: [ClientHomeHighlightOperatorItemDto] })
  operators: ClientHomeHighlightOperatorItemDto[];

  @ApiProperty({ type: [ClientHomeHighlightTripItemDto] })
  trips: ClientHomeHighlightTripItemDto[];
}
