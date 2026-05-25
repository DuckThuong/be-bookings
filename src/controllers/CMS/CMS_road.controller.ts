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
import { CMSRoadService } from '../../services/CMS/CMS_road.service';
import {
  CreateRoadPayloadDto,
  UpdateRoadPayloadDto,
  CmsRoadDetailResponseDto,
  CmsRoadListResponseDto,
} from '../../dtos/CMS/CMS_road.dto';
import { OptionalCompanyIdQueryDto } from '../../dtos/transport/common.dto';

@ApiTags('CMS - Road')
@Controller('cms/road')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSRoadController {
  constructor(private readonly cmsRoadService: CMSRoadService) {}

  @Get()
  @ApiOperation({
    summary:
      'Danh sách tuyến CMS (tuyến + chuyến mẫu + xe + tài xế + company_trip)',
  })
  @ApiResponse({ status: 200, type: CmsRoadListResponseDto })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: OptionalCompanyIdQueryDto,
  ) {
    return this.cmsRoadService.getAllRoads(user, query.companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Chi tiết tuyến CMS theo ID (tuyến + chuyến mẫu + xe + tài xế + company_trip)',
  })
  @ApiResponse({ status: 200, type: CmsRoadDetailResponseDto })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsRoadService.getRoadById(user, id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Tạo tuyến đường (tb_road)' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateRoadPayloadDto,
  ) {
    return this.cmsRoadService.createRoad(payload, user);
  }

  @Patch()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Cập nhật tuyến đường' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateRoadPayloadDto,
  ) {
    return this.cmsRoadService.updateRoad(payload, user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: '[Owner] Cập nhật tuyến đường theo ID trên URL',
  })
  updateById(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRoadPayloadDto,
  ) {
    return this.cmsRoadService.updateRoad({ ...payload, id }, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Vô hiệu hóa tuyến đường' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsRoadService.deleteRoad(user, id);
  }
}
