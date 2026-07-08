import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePayOSPaymentDto } from '../dtos/payment/payos.dto';
import { PayOSService } from '../services/payment/payos.service';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { User } from '../user.decorator';

@ApiTags('Payment - PayOS')
@Controller('payments/payos')
export class PayOSController {
  constructor(private readonly payOSService: PayOSService) {}

  @Post('create-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo link thanh toán PayOS' })
  createPaymentLink(
    @User() user: UserDecoratorDtoResponse,
    @Body() dto: CreatePayOSPaymentDto,
  ) {
    return this.payOSService.createPaymentLink(dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook nhận thông báo thanh toán từ PayOS' })
  handleWebhook(@Body() data: any) {
    return this.payOSService.handleWebhook(data);
  }

  @Get('status/:paymentLinkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy trạng thái thanh toán PayOS' })
  getPaymentStatus(@Param('paymentLinkId') paymentLinkId: string) {
    return this.payOSService.getPaymentStatus(paymentLinkId);
  }

  @Post('cancel/:paymentLinkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hủy link thanh toán PayOS' })
  cancelPaymentLink(@Param('paymentLinkId') paymentLinkId: string) {
    return this.payOSService.cancelPaymentLink(paymentLinkId);
  }
}
