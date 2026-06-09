import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { CMSBookingService } from '../../services/CMS/CMS_booking.service';
import {
  CmsBookingListQueryDto,
  CmsBookingListResponseDto,
  CmsConfirmBookingDto,
  CmsRejectBookingDto,
} from '../../dtos/CMS/CMS_booking.dto';

@ApiTags('CMS - Booking')
@Controller('cms/booking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSBookingController {
  constructor(private readonly cmsBookingService: CMSBookingService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách đặt vé CMS (chờ duyệt / đã xác nhận)' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsBookingListQueryDto,
  ): Promise<CmsBookingListResponseDto> {
    return this.cmsBookingService.list(user, query);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Chi tiết đặt vé theo paymentId' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.cmsBookingService.getDetail(user, paymentId);
  }

  @Patch(':paymentId/confirm')
  @ApiOperation({ summary: 'Nhà xe xác nhận đặt vé (duyệt thanh toán)' })
  confirm(
    @User() user: UserDecoratorDtoResponse,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() payload: CmsConfirmBookingDto,
  ) {
    return this.cmsBookingService.confirm(user, paymentId, payload);
  }

  @Patch(':paymentId/reject')
  @ApiOperation({ summary: 'Nhà xe từ chối đặt vé' })
  reject(
    @User() user: UserDecoratorDtoResponse,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() body: CmsRejectBookingDto,
  ) {
    return this.cmsBookingService.reject(user, paymentId, body.reason);
  }
}
