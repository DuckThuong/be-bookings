import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { ClientBookingsService } from '../../services/client/client-bookings.service';
import {
  CreateHoldDto,
  CreateClientBookingDto,
  PassengerDto,
  ValidatePromoDto,
  ConfirmPaymentDto,
} from '../../dtos/client/bookings.dto';
import { SeatSelectionQueryDto } from '../../dtos/client/seat-selection.dto';
@ApiTags('Client - Bookings')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientBookingsController {
  constructor(private readonly bookings: ClientBookingsService) {}

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

  @Get('seat-selection/:tripId')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: 'Dữ liệu trang chọn ghế (step 1) — contract FE',
  })
  getSeatSelectionPage(
    @User() user: UserDecoratorDtoResponse,
    @Param('tripId') tripId: string,
    @Query() query: SeatSelectionQueryDto,
  ) {
    return this.bookings.getSeatSelectionPage(user, tripId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Tạo đơn đặt vé & thanh toán (FE contract)' })
  createBooking(
    @User() user: UserDecoratorDtoResponse,
    @Body() body: CreateClientBookingDto,
  ) {
    return this.bookings.createBooking(user, body);
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

  @Post('hold/:holdId/payment-link')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Tạo PayOS payment link từ hold' })
  createPaymentLink(
    @User() user: UserDecoratorDtoResponse,
    @Param('holdId') holdId: string,
  ) {
    return this.bookings.createPayOSPaymentLink(user, holdId);
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

  @Get('by-payment/:paymentLinkId')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Lấy booking từ paymentLinkId (sau PayOS redirect)' })
  getBookingByPaymentLink(
    @User() user: UserDecoratorDtoResponse,
    @Param('paymentLinkId') paymentLinkId: string,
  ) {
    return this.bookings.getBookingByPaymentLink(user, paymentLinkId);
  }
}
