import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import {
  CmsDashboardOverviewDto,
  CmsDashboardQueryDto,
} from '../../dtos/CMS/CMS_dashboard.dto';
import { CMSDashboardService } from '../../services/CMS/CMS_dashboard.service';

@ApiTags('CMS - Dashboard')
@Controller('cms/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSDashboardController {
  constructor(private readonly dashboardService: CMSDashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Tổng quan dashboard (admin: toàn hệ thống, owner: theo nhà xe)',
  })
  getOverview(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsDashboardQueryDto,
  ): Promise<CmsDashboardOverviewDto> {
    return this.dashboardService.getOverview(user, query);
  }
}
