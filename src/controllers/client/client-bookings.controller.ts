import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
