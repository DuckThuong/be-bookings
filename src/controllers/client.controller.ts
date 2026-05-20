import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { ClientCatalogService } from '../services/client-catalog.service';
import { ClientAccountService } from '../services/client-account.service';
import {
  ClientCompanyQueryDto,
  ClientCompanyTripQueryDto,
  ClientMyBookingQueryDto,
  ClientMyInvoiceQueryDto,
  ClientMyTicketQueryDto,
  ClientRoadQueryDto,
  ClientTripQueryDto,
} from '../dtos/client/client.dto';

@ApiTags('Client')
@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientController {
  constructor(
    private readonly catalogService: ClientCatalogService,
    private readonly accountService: ClientAccountService,
  ) {}

  @Get('companies')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Danh sách nhà xe (tìm kiếm + phân trang)' })
  listCompanies(@Query() query: ClientCompanyQueryDto) {
    return this.catalogService.listCompanies(query);
  }

  @Get('companies/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết nhà xe + tuyến đường' })
  getCompany(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getCompany(id);
  }

  @Get('roads')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Danh sách quãng đường / tuyến' })
  listRoads(@Query() query: ClientRoadQueryDto) {
    return this.catalogService.listRoads(query);
  }

  @Get('roads/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết tuyến + các chuyến mẫu' })
  getRoad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getRoad(id);
  }

  @Get('trips')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Danh sách chuyến xe (mẫu)' })
  listTrips(@Query() query: ClientTripQueryDto) {
    return this.catalogService.listTrips(query);
  }

  @Get('trips/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết chuyến + lịch khai thác' })
  getTrip(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getTrip(id);
  }

  @Get('company-trips')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: '[Client] Chuyến khai thác (có xe, tài xế, ghế trống)',
  })
  listCompanyTrips(@Query() query: ClientCompanyTripQueryDto) {
    return this.catalogService.listCompanyTrips(query);
  }

  @Get('company-trips/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết chuyến khai thác + sơ đồ ghế' })
  getCompanyTrip(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getCompanyTrip(id);
  }

  @Get('my/tickets')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: '[Client] Vé đã đặt (lọc hoặc xem tất cả). USER: của mình; ADMIN/OWNER: cần customerId',
  })
  listMyTickets(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyTicketQueryDto,
  ) {
    return this.accountService.listMyTickets(user, query);
  }

  @Get('my/tickets/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết vé (đầy đủ chuyến, ghế, thanh toán)' })
  getMyTicket(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyTicket(user, id, customerId);
  }

  @Get('my/invoices')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: '[Client] Hóa đơn / thanh toán (lọc hoặc xem tất cả)',
  })
  listMyInvoices(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyInvoiceQueryDto,
  ) {
    return this.accountService.listMyInvoices(user, query);
  }

  @Get('my/invoices/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết hóa đơn + vé + hoàn tiền' })
  getMyInvoice(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyInvoice(user, id, customerId);
  }

  @Get('my/bookings')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Đặt chỗ của khách (lọc hoặc xem tất cả)' })
  listMyBookings(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientMyBookingQueryDto,
  ) {
    return this.accountService.listMyBookings(user, query);
  }

  @Get('my/bookings/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Client] Chi tiết đặt chỗ' })
  getMyBooking(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountService.getMyBooking(user, id, customerId);
  }
}
