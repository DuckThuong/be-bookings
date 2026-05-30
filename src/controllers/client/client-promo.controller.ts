import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../dtos/user/common.dto';
import { ClientBookingsService } from '../../services/CLIENT/client-bookings.service';
import { ValidatePromoDto } from '../../dtos/CLIENT/bookings.dto';

@ApiTags('Client - Promo')
@Controller('api/promo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientPromoController {
  constructor(private readonly bookings: ClientBookingsService) {}

  @Post('validate')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Kiểm tra mã giảm giá (FE contract)' })
  validatePromo(@Body() body: ValidatePromoDto) {
    return this.bookings.validatePromo(body);
  }
}
