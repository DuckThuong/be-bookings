import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { TripStatService } from '../../services/sales/trip-stat.service';
import { UpsertTripStatDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Trip Stat')
@Controller('trip-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class TripStatController {
  constructor(private readonly tripStatService: TripStatService) {}

  @Post()
  @ApiOperation({ summary: 'Tao/cap nhat thong ke chuyen theo ngay' })
  upsert(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpsertTripStatDto,
  ) {
    return this.tripStatService.upsert(user, payload);
  }

  @Post('recompute')
  @ApiOperation({ summary: 'Tinh lai thong ke chuyen' })
  recompute(
    @User() user: UserDecoratorDtoResponse,
    @Query('tripId', ParseIntPipe) tripId: number,
    @Query('statDate') statDate: string,
  ) {
    return this.tripStatService.recompute(user, tripId, statDate);
  }

  @Get()
  @ApiOperation({ summary: 'Thong ke theo nha xe hoac chuyen' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('tripId') tripId?: string,
  ) {
    if (tripId) {
      return this.tripStatService.findByTrip(user, parseInt(tripId, 10));
    }
    if (companyId) {
      return this.tripStatService.findByCompany(user, parseInt(companyId, 10));
    }
    return [];
  }
}
