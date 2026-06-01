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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { CMSVehicleService } from '../../services/CMS/CMS_vehicle.service';
import {
  CreateVehiclePayloadDto,
  UpdateVehiclePayloadDto,
  CmsVehicleDetailResponseDto,
  CmsVehicleListResponseDto,
} from '../../dtos/CMS/CMS_vehicle.dto';

@ApiTags('CMS - Vehicle')
@Controller('cms/vehicle')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSVehicleController {
  constructor(private readonly cmsVehicleService: CMSVehicleService) {}

  @Get()
  @ApiOperation({
    summary:
      'Danh sách phương tiện CMS (xe + ghế + trip + driver)',
  })
  @ApiResponse({ status: 200, type: CmsVehicleListResponseDto })
  findAll(@User() user: UserDecoratorDtoResponse) {
    return this.cmsVehicleService.getAllVehicles(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết phương tiện CMS theo ID (xe + ghế + trip + driver)',
  })
  @ApiResponse({ status: 200, type: CmsVehicleDetailResponseDto })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsVehicleService.getVehicleById(user, id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary:
      '[Owner] Tạo phương tiện + ghế (tripId/driverId tùy chọn; gắn chuyến khai thác ở PATCH)',
  })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateVehiclePayloadDto,
  ) {
    return this.cmsVehicleService.createVehicle(payload, user);
  }

  @Patch()
  @Roles(UserRole.OWNER)
  @ApiOperation({
    summary: '[Owner] Cập nhật phương tiện + ghế + chuyến khai thác',
  })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateVehiclePayloadDto,
  ) {
    return this.cmsVehicleService.updateVehicle(payload, user);
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
    return this.cmsVehicleService.deleteVehicle(user, id);
  }
}
