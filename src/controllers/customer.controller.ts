import {
  Controller,
  Get,
  Param,
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
import { CustomerService } from '../services/customer.service';
import { CustomerFilterQueryDto } from '../dtos/customer/customer.dto';

@ApiTags('Customer')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('me')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '[Khách] Hồ sơ & thống kê của tôi' })
  getMe(@User() user: UserDecoratorDtoResponse) {
    return this.customerService.getMe(user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary:
      'Danh sách khách hàng (OWNER bắt buộc companyId; ADMIN có thể bỏ qua)',
  })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CustomerFilterQueryDto,
  ) {
    return this.customerService.findAll(user, query);
  }

  @Get(':userCode')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Chi tiết khách hàng' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('userCode') userCode: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.customerService.findOne(
      user,
      userCode,
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  @Get(':userCode/tickets')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Lịch sử vé của khách' })
  getTickets(
    @User() user: UserDecoratorDtoResponse,
    @Param('userCode') userCode: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.customerService.getTickets(
      user,
      userCode,
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  @Get(':userCode/bookings')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Lịch sử đặt chỗ của khách' })
  getBookings(
    @User() user: UserDecoratorDtoResponse,
    @Param('userCode') userCode: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.customerService.getBookings(
      user,
      userCode,
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  @Get(':userCode/payments')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({ summary: 'Lịch sử thanh toán của khách' })
  getPayments(
    @User() user: UserDecoratorDtoResponse,
    @Param('userCode') userCode: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.customerService.getPayments(
      user,
      userCode,
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }
}
