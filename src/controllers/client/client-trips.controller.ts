import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ClientSearchTripsQueryDto,
  ClientSearchTripsResponseDto,
} from '../../dtos/CLIENT/trips.dto';
import { ClientTripsService } from '../../services/CLIENT/client-trips.service';

@ApiTags('Client - Trips')
@Controller('api/trips')
export class ClientTripsController {
  constructor(private readonly tripsService: ClientTripsService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Tìm chuyến xe (FE Page2 contract)',
    description:
      'Trả về danh sách chuyến theo contract TripPage: search + meta + trips[]. Hỗ trợ lọc theo giờ, wifi, điều hoà, loại ghế và sắp xếp.',
  })
  searchTrips(
    @Query() query: ClientSearchTripsQueryDto,
  ): Promise<ClientSearchTripsResponseDto> {
    return this.tripsService.searchTrips(query);
  }
}
