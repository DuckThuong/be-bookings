import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { ClientAccountService } from '../../services/client-account.service';
import {
  ClientMyBookingQueryDto,
  ClientMyInvoiceQueryDto,
  ClientMyTicketQueryDto,
} from '../../dtos/client/client.dto';

/** Flow tài khoản: xem vé / hóa đơn / đặt chỗ (chỉ đọc) */
@ApiTags('Client - Account')
@Controller('client/account')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientAccountController {
  constructor(private readonly accountService: ClientAccountService) {}

  @Get('tickets')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách vé đã đặt (lọc / xem tất cả)' })
  listTickets(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyTicketQueryDto,
  ) {
    return this.accountService.listMyTickets(user, query);
  }

  @Get('tickets/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết vé' })
  getTicket(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyTicket(user, id, customerId);
  }

  @Get('invoices')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách hóa đơn (lọc / xem tất cả)' })
  listInvoices(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyInvoiceQueryDto,
  ) {
    return this.accountService.listMyInvoices(user, query);
  }

  @Get('invoices/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết hóa đơn' })
  getInvoice(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyInvoice(user, id, customerId);
  }

  @Get('bookings')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách đặt chỗ (lọc / xem tất cả)' })
  listBookings(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyBookingQueryDto,
  ) {
    return this.accountService.listMyBookings(user, query);
  }

  @Get('bookings/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết đặt chỗ' })
  getBooking(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyBooking(user, id, customerId);
  }
}
