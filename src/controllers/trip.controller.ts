import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { TripService } from '../services/trip.service';
import { CreateTripDto, UpdateTripDto } from '../dtos/company/company.dto';

@ApiTags('Trip')
@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chuyến xe mẫu' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateTripDto,
  ) {
    return this.tripService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách chuyến (theo companyId hoặc roadId)' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('roadId') roadId?: string,
  ) {
    if (roadId) {
      return this.tripService.findByRoad(user, parseInt(roadId, 10));
    }
    return this.tripService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chuyến' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tripService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật chuyến' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateTripDto,
  ) {
    return this.tripService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa chuyến' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tripService.remove(user, id);
  }
}
