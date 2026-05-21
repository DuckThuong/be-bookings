import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { ClientPaymentFlowService } from '../../services/client-flow/client-payment-flow.service';
import {
  ClientConfirmPaymentDto,
  ClientCreatePaymentDto,
} from '../../dtos/client/payment-flow.dto';

/**
 * Flow thanh toán — tách từng bước:
 * 1. POST create — tạo hóa đơn PENDING
 * 2. PATCH :id/confirm — xác nhận thành công → vé PAID
 * 3. PATCH :id/fail — thanh toán thất bại
 */
@ApiTags('Client - Payment Flow')
@Controller('client/payment')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientPaymentFlowController {
  constructor(private readonly paymentFlow: ClientPaymentFlowService) {}

  @Post('create')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Bước 1] Tạo hóa đơn thanh toán' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ClientCreatePaymentDto,
  ) {
    return this.paymentFlow.create(user, payload);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Bước 2] Xác nhận thanh toán thành công' })
  confirm(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ClientConfirmPaymentDto,
  ) {
    return this.paymentFlow.confirm(user, id, payload);
  }

  @Patch(':id/fail')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Bước 3] Đánh dấu thanh toán thất bại' })
  fail(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentFlow.fail(user, id);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết hóa đơn (theo flow client)' })
  getOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentFlow.getDetail(user, id);
  }
}
