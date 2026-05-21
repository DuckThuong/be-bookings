import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { ClientBookingFlowService } from '../../services/client-flow/client-booking-flow.service';
import { ClientHoldBookingDto } from '../../dtos/client/booking-flow.dto';

/**
 * Flow đặt vé — tách từng bước, cập nhật độc lập:
 * 1. POST hold — giữ chỗ
 * 2. POST :id/issue-ticket — phát hành vé (PENDING)
 * 3. DELETE :id — hủy giữ chỗ
 */
@ApiTags('Client - Booking Flow')
@Controller('client/booking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientBookingFlowController {
  constructor(private readonly bookingFlow: ClientBookingFlowService) {}

  @Post('hold')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Bước 1] Giữ chỗ (HOLD)' })
  hold(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ClientHoldBookingDto,
  ) {
    return this.bookingFlow.hold(user, payload);
  }

  @Post(':id/issue-ticket')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: '[Bước 2] Chuyển giữ chỗ → vé (PENDING)' })
  issueTicket(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingFlow.convertToTicket(user, id);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Hủy giữ chỗ' })
  cancel(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingFlow.cancel(user, id);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết đặt chỗ (theo flow client)' })
  getOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingFlow.getDetail(user, id);
  }
}
