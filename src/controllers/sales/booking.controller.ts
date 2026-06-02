import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { BookingService } from '../../services/sales/booking.service';
import { CreateBookingDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Booking')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Giữ chỗ' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateBookingDto,
  ) {
    return this.bookingService.create(user, payload);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Danh sách đặt chỗ' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('tripId') tripId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findAll(user, {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      tripId: tripId ? parseInt(tripId, 10) : undefined,
      customerId,
      status,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Chi tiết đặt chỗ' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.findOne(user, id);
  }

  @Post(':id/convert')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Chuyển đặt chỗ thành vé' })
  convert(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.convertToTicket(user, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Hủy đặt chỗ' })
  cancel(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.cancel(user, id);
  }
}
