import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TripContextQueryDto {
  @ApiProperty({ description: 'Mã chuyến (trip.code) hoặc companyTripId' })
  @IsString()
  @IsNotEmpty()
  tripId: string;
}

export class SeatMapQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ enum: ['16', '36', '45'] })
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floor?: number = 1;
}

export class ValidatePromoDto {
  @ApiProperty()
  @IsString()
  tripId: string;

  @ApiProperty()
  @IsString()
  promoCode: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subTotal: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  addonsTotal: number;
}

export class PassengerDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  pickupPoint: string;

  @ApiProperty()
  @IsString()
  dropoffPoint: string;
}

export class AddonLineDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty?: number;
}

export class CreateHoldDto {
  @ApiProperty()
  @IsString()
  tripId: string;

  @ApiProperty({ enum: ['16', '36', '45'] })
  @IsString()
  vehicleType: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floor?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  seatIds: string[];

  @ApiPropertyOptional({ type: [AddonLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonLineDto)
  addons?: AddonLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiPropertyOptional({ type: PassengerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PassengerDto)
  passenger?: PassengerDto;

  @ApiPropertyOptional({ description: 'ADMIN/OWNER: mã khách' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ default: 600 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(3600)
  holdSeconds?: number;
}

export class ConfirmPaymentDto {
  @ApiProperty({ enum: ['card', 'ewallet', 'bank', 'cash'] })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionRef?: string;
}

export class BookingIdParamDto {
  @ApiProperty()
  @IsString()
  holdId: string;
}
