import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { PromotionUsageService } from '../../services/sales/promotion-usage.service';
import { CreatePromotionUsageDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Promotion')
@Controller('promotion-usages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class PromotionUsageController {
  constructor(
    private readonly promotionUsageService: PromotionUsageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Ghi nhận sử dụng mã khuyến mãi' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreatePromotionUsageDto,
  ) {
    return this.promotionUsageService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách lịch sử KM' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('promoCode') promoCode?: string,
    @Query('ticketId') ticketId?: string,
    @Query('bookingId') bookingId?: string,
  ) {
    return this.promotionUsageService.findAll(user, {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      promoCode,
      ticketId: ticketId ? parseInt(ticketId, 10) : undefined,
      bookingId: bookingId ? parseInt(bookingId, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.promotionUsageService.findOne(user, id);
  }
}
