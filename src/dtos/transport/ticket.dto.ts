import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../assets/constants/company.constants';

export class CreateTicketDto {
  @ApiProperty({ example: 1 })
  companyId: number;

  @ApiProperty({ example: 1 })
  companyTripId: number;

  @ApiProperty({ example: 1 })
  tripId: number;

  @ApiProperty({ example: 'USR001', description: 'userCode khách' })
  customerId: string;

  @ApiProperty({ example: 350000 })
  pricePerSeat: number;

  @ApiProperty({ example: 2 })
  totalSeat: number;

  @ApiProperty({ example: [1, 2], type: [Number] })
  seatIds: number[];

  @ApiPropertyOptional({ example: 0 })
  discountAmount?: number;

  @ApiPropertyOptional()
  promoCode?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  status?: string;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  discountAmount?: number;

  @ApiPropertyOptional()
  promoCode?: string;
}

export class UpdateSeatDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  index?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional({ enum: EntityStatus })
  status?: string;

  @ApiPropertyOptional()
  description?: string;
}
