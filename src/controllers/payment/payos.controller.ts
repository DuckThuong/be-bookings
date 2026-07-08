import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { CreatePayOSPaymentDto } from '../../dtos/payment/payos.dto';
import { PayOSService } from '../../services/payment/payos.service';
import { User } from '../../user.decorator';

@ApiTags('Payment - PayOS')
@Controller('payments/payos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
@ApiBearerAuth('JWT-auth')
export class PayOSController {
  constructor(private readonly payOSService: PayOSService) {}

  @Post('create-link')
  @ApiOperation({ summary: 'Tạo link thanh toán PayOS' })
  createPaymentLink(
    @User() user: UserDecoratorDtoResponse,
    @Body() dto: CreatePayOSPaymentDto,
  ) {
    return this.payOSService.createPaymentLink(dto);
  }

  @Get('status/:paymentLinkId')
  @ApiOperation({ summary: 'Lấy trạng thái thanh toán PayOS' })
  getPaymentStatus(@Param('paymentLinkId') paymentLinkId: string) {
    return this.payOSService.getPaymentStatus(paymentLinkId);
  }

  @Post('cancel/:paymentLinkId')
  @ApiOperation({ summary: 'Hủy link thanh toán PayOS' })
  cancelPaymentLink(@Param('paymentLinkId') paymentLinkId: string) {
    return this.payOSService.cancelPaymentLink(paymentLinkId);
  }
}

@Controller('payments/payos/webhook')
@ApiTags('Payment - PayOS Webhook')
export class PayOSWebhookController {
  constructor(private readonly payOSService: PayOSService) {}

  @Post()
  @ApiOperation({ summary: 'Webhook nhận thông báo thanh toán từ PayOS' })
  handleWebhook(@Body() data: any) {
    return this.payOSService.handleWebhook(data);
  }
}
