import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ValidatePromoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tripId?: string;

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

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải gồm 10 chữ số' })
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

  @ApiPropertyOptional({
    default: 600,
    description: 'Alias FE: holdDurationSeconds',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(3600)
  holdSeconds?: number;

  @ApiPropertyOptional({
    default: 600,
    description: 'Thời gian giữ ghế (giây) — field FE',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(3600)
  holdDurationSeconds?: number;
}

export class BookingSeatDto {
  @ApiProperty({ example: 'A1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'A1' })
  @IsString()
  label: string;
}

export class CreateBookingAddonDto {
  @ApiProperty({ example: 'insurance' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;
}

export class BookingPricingDto {
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

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  promoDiscount: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateClientBookingDto {
  @ApiProperty()
  @IsString()
  holdId: string;

  @ApiProperty()
  @IsString()
  tripId: string;

  @ApiProperty({ enum: ['16', '36', '45'] })
  @IsString()
  @IsIn(['16', '36', '45'])
  vehicleType: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floor?: number;

  @ApiProperty({ type: [BookingSeatDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingSeatDto)
  seats: BookingSeatDto[];

  @ApiProperty({ type: PassengerDto })
  @ValidateNested()
  @Type(() => PassengerDto)
  passenger: PassengerDto;

  @ApiPropertyOptional({ type: [CreateBookingAddonDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingAddonDto)
  addons?: CreateBookingAddonDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  promoCode?: string | null;

  @ApiProperty({ enum: ['card', 'ewallet', 'bank', 'cash'] })
  @IsString()
  @IsIn(['card', 'ewallet', 'bank', 'cash'])
  paymentMethod: string;

  @ApiPropertyOptional({
    type: BookingPricingDto,
    description: 'FE gửi để đối chiếu; BE tự tính lại',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingPricingDto)
  pricing?: BookingPricingDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionRef?: string;
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
