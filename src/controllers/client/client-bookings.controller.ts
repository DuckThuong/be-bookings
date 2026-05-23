import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { ClientBookingsService } from '../../services/CLIENT/client-bookings.service';
import {
  ConfirmPaymentDto,
  CreateHoldDto,
  PassengerDto,
  SeatMapQueryDto,
  TripContextQueryDto,
  ValidatePromoDto,
} from '../../dtos/CLIENT/bookings.dto';

@ApiTags('Client - Bookings')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientBookingsController {
  constructor(private readonly bookings: ClientBookingsService) {}

  @Get('config')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Cấu hình luồng đặt vé (meta, catalog, enums)' })
  getConfig() {
    return this.bookings.getConfig();
  }

  @Get('trip-context')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Ngữ cảnh chuyến + catalog cho màn đặt vé' })
  getTripContext(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: TripContextQueryDto,
  ) {
    return this.bookings.getTripContext(user, query.tripId);
  }

  @Get('seat-map')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Sơ đồ ghế theo hàng/tầng' })
  getSeatMap(@Query() query: SeatMapQueryDto) {
    return this.bookings.getSeatMap(
      query.tripId,
      query.vehicleType,
      query.floor ?? 1,
    );
  }

  @Post('validate-promo')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Kiểm tra mã khuyến mãi' })
  validatePromo(@Body() body: ValidatePromoDto) {
    return this.bookings.validatePromo(body);
  }

  @Post('hold')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Giữ chỗ — bước 1' })
  createHold(
    @User() user: UserDecoratorDtoResponse,
    @Body() body: CreateHoldDto,
  ) {
    return this.bookings.createHold(user, body);
  }

  @Patch('hold/:holdId/passenger')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Cập nhật hành khách — bước 2' })
  updatePassenger(
    @User() user: UserDecoratorDtoResponse,
    @Param('holdId') holdId: string,
    @Body() body: PassengerDto,
  ) {
    return this.bookings.updatePassenger(user, holdId, body);
  }

  @Post('hold/:holdId/pay')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Xác nhận thanh toán — bước 3' })
  confirmPayment(
    @User() user: UserDecoratorDtoResponse,
    @Param('holdId') holdId: string,
    @Body() body: ConfirmPaymentDto,
  ) {
    return this.bookings.confirmPayment(user, holdId, body);
  }

  @Get(':bookingId')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết đặt vé / kết quả' })
  getBooking(
    @User() user: UserDecoratorDtoResponse,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookings.getBookingResult(user, bookingId);
  }
}
