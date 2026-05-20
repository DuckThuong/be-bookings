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
import { RefundService } from '../../services/sales/refund.service';
import { CreateRefundDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Refund')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu hoàn tiền' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateRefundDto,
  ) {
    return this.refundService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách hoàn tiền' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('paymentId') paymentId?: string,
    @Query('ticketId') ticketId?: string,
  ) {
    return this.refundService.findAll(user, {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      paymentId: paymentId ? parseInt(paymentId, 10) : undefined,
      ticketId: ticketId ? parseInt(ticketId, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết hoàn tiền' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.refundService.findOne(user, id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Xác nhận hoàn tiền' })
  confirm(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.refundService.confirm(user, id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Từ chối hoàn tiền' })
  reject(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.refundService.reject(user, id);
  }
}
