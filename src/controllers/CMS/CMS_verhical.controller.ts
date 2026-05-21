import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { CMSVerhicalService } from '../../services/CMS/CMS_verhical.service';
import {
  CreateVehicalPayloadDto,
  UpdateVehicalPayloadDto,
  CmsVehicalDetailResponseDto,
  CmsVehicalListResponseDto,
} from '../../dtos/CMS/CMS_verhical.dto';
import { OptionalCompanyIdQueryDto } from '../../dtos/transport/common.dto';

@ApiTags('CMS - Verhical')
@Controller('cms/verhical')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSVerhicalController {
  constructor(private readonly cmsVerhicalService: CMSVerhicalService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách phương tiện CMS (xe + ghế + trip + driver + company_trip)',
  })
  @ApiResponse({ status: 200, type: CmsVehicalListResponseDto })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: OptionalCompanyIdQueryDto,
  ) {
    return this.cmsVerhicalService.getAllVehicals(user, query.companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết phương tiện CMS theo ID (xe + ghế + trip + driver)',
  })
  @ApiResponse({ status: 200, type: CmsVehicalDetailResponseDto })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsVerhicalService.getVehicalById(user, id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary:
      '[Owner] Tạo phương tiện + ghế (tripId/driverId tùy chọn; gắn chuyến khai thác ở PATCH)',
  })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateVehicalPayloadDto,
  ) {
    return this.cmsVerhicalService.createVehical(payload, user);
  }

  @Patch()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: '[Owner] Cập nhật phương tiện + ghế + chuyến khai thác',
  })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateVehicalPayloadDto,
  ) {
    return this.cmsVerhicalService.updateVehical(payload, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary:
      '[Owner] Xóa phương tiện (vô hiệu hóa xe + ghế + chuyến khai thác liên kết)',
  })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsVerhicalService.deleteVehical(user, id);
  }
}
