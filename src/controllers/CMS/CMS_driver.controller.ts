import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CMSDriverService } from '../../services/CMS/CMS_driver.service';
import {
  CreateDriverPayloadDto,
  UpdateDriverPayloadDto,
  CmsDriverDetailResponseDto,
  CmsDriverListResponseDto,
} from '../../dtos/CMS/CMS_driver.dto';

@ApiTags('CMS - Driver')
@Controller('cms/driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSDriverController {
  constructor(private readonly cmsDriverService: CMSDriverService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách tài xế CMS (tài xế + xe + trip + company_trip)',
  })
  @ApiResponse({ status: 200, type: CmsDriverListResponseDto })
  findAll(@User() user: UserDecoratorDtoResponse) {
    return this.cmsDriverService.getAllDrivers(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết tài xế CMS theo ID (tài xế + xe + trip + company_trip)',
  })
  @ApiResponse({ status: 200, type: CmsDriverDetailResponseDto })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsDriverService.getDriverById(user, id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Tạo tài xế' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateDriverPayloadDto,
  ) {
    return this.cmsDriverService.createDriver(payload, user);
  }

  @Patch()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Cập nhật tài xế' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateDriverPayloadDto,
  ) {
    return this.cmsDriverService.updateDriver(payload, user);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Vô hiệu hóa tài xế' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsDriverService.deleteDriver(user, id);
  }
}
