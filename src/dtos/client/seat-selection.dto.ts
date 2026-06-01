import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SeatSelectionQueryDto {
  @ApiPropertyOptional({ enum: ['16', '36', '45'] })
  @IsOptional()
  @IsString()
  @IsIn(['16', '36', '45'])
  vehicleType?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floor?: number;

  @ApiPropertyOptional({ example: '11/05/2026', description: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  date?: string;
}

export class SeatSelectionPointOptionDto {
  @ApiProperty()
  value: string;

  @ApiProperty()
  label: string;
}

export class SeatSelectionPassengerDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  pickupPointDefault: string;

  @ApiProperty()
  dropoffPointDefault: string;

  @ApiProperty({ type: [SeatSelectionPointOptionDto] })
  pickupPointOptions: SeatSelectionPointOptionDto[];

  @ApiProperty({ type: [SeatSelectionPointOptionDto] })
  dropoffPointOptions: SeatSelectionPointOptionDto[];
}

export class SeatSelectionTripDto {
  @ApiProperty()
  tripId: string;

  @ApiProperty()
  companyTripId: number;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  operatorCode: string;

  @ApiProperty()
  operatorName: string;

  @ApiProperty()
  departTime: string;

  @ApiProperty()
  arriveTime: string;

  @ApiPropertyOptional()
  arriveNote?: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  durationLabel: string;

  @ApiProperty()
  unitPrice: number;
}

export class SeatSelectionUserDto {
  @ApiProperty()
  userName: string;

  @ApiProperty()
  notifCount: number;

  @ApiProperty({ nullable: true })
  phone: string | null;
}

export class SeatSelectionBreadcrumbDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  href: string;
}

export class SeatSelectionPageDataDto {
  @ApiProperty({ type: SeatSelectionUserDto })
  user: SeatSelectionUserDto;

  @ApiProperty({ type: [SeatSelectionBreadcrumbDto] })
  breadcrumb: SeatSelectionBreadcrumbDto[];

  @ApiProperty({ type: SeatSelectionTripDto })
  trip: SeatSelectionTripDto;

  @ApiProperty({ type: SeatSelectionPassengerDto })
  passenger: SeatSelectionPassengerDto;
}

export class SeatSelectionOperatorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: string;

  @ApiProperty()
  routeLabel: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  amenities: { icon: string; label: string }[];
}

export class SeatSelectionSeatCellDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['available', 'booked', 'vip'] })
  status: 'available' | 'booked' | 'vip';
}

export class SeatSelectionRowDto {
  @ApiProperty()
  row: number;

  @ApiPropertyOptional()
  full?: boolean;

  @ApiProperty({
    type: 'array',
    items: { oneOf: [{ $ref: '' }], nullable: true },
  })
  seats: (SeatSelectionSeatCellDto | null)[];
}

export class SeatSelectionVehicleDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  mapTitle: string;

  @ApiProperty()
  mapSub: string;

  @ApiProperty()
  floors: number;

  @ApiProperty()
  isSleeper: boolean;

  @ApiProperty({
    description: 'Key = floor number (1, 2), value = seat rows',
    type: 'object',
    additionalProperties: { type: 'array' },
  })
  layouts: Record<string, SeatSelectionRowDto[]>;
}

export class SeatSelectionMetaDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  holdSecondsDefault: number;

  @ApiProperty()
  maxSeatsPerBooking: number;

  @ApiProperty()
  feeRate: number;

  @ApiProperty()
  pickupAddonUnitPrice: number;

  @ApiProperty()
  unitPrice: number;
}

export class SeatSelectionResponseDto {
  @ApiProperty({ type: SeatSelectionMetaDto })
  meta: SeatSelectionMetaDto;

  @ApiProperty({ type: SeatSelectionPageDataDto })
  pageData: SeatSelectionPageDataDto;

  @ApiProperty({ type: SeatSelectionOperatorDto })
  operator: SeatSelectionOperatorDto;

  catalog: {
    addonServices: Record<string, unknown>[];
    promoCodes: Record<string, unknown>[];
    policies: Record<string, unknown>[];
  };

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object' },
  })
  vehicles: Record<string, SeatSelectionVehicleDto>;

  @ApiProperty({ enum: ['16', '36', '45'] })
  defaultVehicleType: string;

  @ApiProperty({ default: 1 })
  defaultFloor: number;
}
