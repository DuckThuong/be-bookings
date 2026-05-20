import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../dtos/user/common.dto';
import { ClientSeatFlowService } from '../../services/client-flow/client-seat-flow.service';

/** Flow chọn ghế: kiểm tra ghế trống trước khi giữ chỗ */
@ApiTags('Client - Seat')
@Controller('client/seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientSeatFlowController {
  constructor(private readonly seatFlow: ClientSeatFlowService) {}

  @Get('availability')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: 'Sơ đồ ghế + trạng thái trống/đã đặt của một chuyến khai thác',
  })
  getAvailability(@Query('companyTripId', ParseIntPipe) companyTripId: number) {
    return this.seatFlow.getAvailability(companyTripId);
  }
}
