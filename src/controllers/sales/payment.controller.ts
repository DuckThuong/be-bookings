import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { PaymentService } from '../../services/sales/payment.service';
import {
  ConfirmPaymentDto,
  CreatePaymentDto,
} from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thanh toán cho vé' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreatePaymentDto,
  ) {
    return this.paymentService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách thanh toán' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('companyTripId') companyTripId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentService.findAll(user, {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      companyTripId: companyTripId ? parseInt(companyTripId, 10) : undefined,
      customerId,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thanh toán' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.findOne(user, id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Xác nhận thanh toán thành công' })
  confirm(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ConfirmPaymentDto,
  ) {
    return this.paymentService.confirm(user, id, payload);
  }

  @Patch(':id/fail')
  @ApiOperation({ summary: 'Đánh dấu thanh toán thất bại' })
  fail(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.markFailed(user, id);
  }
}
