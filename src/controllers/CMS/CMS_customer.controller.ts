import {
  Controller,
  Get,
  NotFoundException,
  Param,
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
import {
  CmsCustomerListQueryDto,
  CmsCustomerListResponseDto,
} from '../../dtos/CMS/CMS_customer.dto';
import { CMSCustomerService } from '../../services/CMS/CMS_customer.service';

@ApiTags('CMS - Customer')
@Controller('cms/customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSCustomerController {
  constructor(private readonly cmsCustomerService: CMSCustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách khách hàng của nhà xe (CMS)' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsCustomerListQueryDto,
  ): Promise<CmsCustomerListResponseDto> {
    return this.cmsCustomerService.list(user, query);
  }

  @Get(':userCode')
  @ApiOperation({ summary: 'Chi tiết khách hàng theo userCode' })
  async findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('userCode') userCode: string,
    @Query('companyId') companyId?: string,
  ) {
    const detail = await this.cmsCustomerService.getDetail(
      user,
      userCode,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    if (!detail) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    return detail;
  }
}
