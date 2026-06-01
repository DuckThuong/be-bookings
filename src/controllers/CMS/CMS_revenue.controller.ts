import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import {
  CmsRevenuePageResponseDto,
  CmsRevenueQueryDto,
} from '../../dtos/CMS/CMS_revenue.dto';
import { CMSRevenueService } from '../../services/CMS/CMS_revenue.service';

@ApiTags('CMS - Revenue')
@Controller('cms/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSRevenueController {
  constructor(private readonly revenueService: CMSRevenueService) {}

  @Get()
  @ApiOperation({
    summary:
      'Trang doanh thu CMS (admin: toàn hệ thống, owner: theo nhà xe)',
  })
  getPage(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsRevenueQueryDto,
  ): Promise<CmsRevenuePageResponseDto> {
    return this.revenueService.getPage(user, query);
  }
}
