import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { User } from '../../user.decorator';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { ClientInvoiceQueryDto, ClientRefundQueryDto } from '../../dtos/client/invoice.dto';
import { ClientInvoiceService } from '../../services/client/client-invoice.service';

@ApiTags('Client - Invoice')
@Controller('client/invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClientInvoiceController {
  constructor(private readonly invoiceService: ClientInvoiceService) {}

  @Get('payments')
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn thanh toán của khách hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách hóa đơn thanh toán' })
  async getMyPayments(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientInvoiceQueryDto,
  ) {
    return this.invoiceService.getMyPayments(user, query);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn hoàn tiền của khách hàng' })
  @ApiResponse({ status: 200, description: 'Danh sách hóa đơn hoàn tiền' })
  async getMyRefunds(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ClientRefundQueryDto,
  ) {
    return this.invoiceService.getMyRefunds(user, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Lấy tổng quan hóa đơn của khách hàng' })
  @ApiResponse({ status: 200, description: 'Tổng quan hóa đơn' })
  async getPaymentSummary(@User() user: UserDecoratorDtoResponse) {
    return this.invoiceService.getPaymentSummary(user);
  }
}
