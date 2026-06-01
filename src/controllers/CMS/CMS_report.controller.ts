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
  CmsReportListQueryDto,
  CmsReportListResponseDto,
} from '../../dtos/CMS/CMS_report.dto';
import { CMSReportService } from '../../services/CMS/CMS_report.service';

@ApiTags('CMS - Reports')
@Controller('cms/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSReportController {
  constructor(private readonly reportService: CMSReportService) {}

  @Get()
  @ApiOperation({
    summary:
      'Danh sách báo cáo CMS (sinh từ dữ liệu thực, admin/owner theo scope)',
  })
  list(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsReportListQueryDto,
  ): Promise<CmsReportListResponseDto> {
    return this.reportService.list(user, query);
  }
}
