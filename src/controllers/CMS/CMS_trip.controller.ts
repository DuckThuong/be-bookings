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
import { CMSTripService } from '../../services/CMS/CMS_trip.service';
import {
  CreateTripPayloadDto,
  UpdateTripPayloadDto,
  CmsTripDetailResponseDto,
  CmsTripListResponseDto,
  CmsTripListQueryDto,
  UpdateOperationStatusPayloadDto,
  ResetTripOperationStatusPayloadDto,
} from '../../dtos/CMS/CMS_trip.dto';

@ApiTags('CMS - Trip')
@Controller('cms/trip')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CMSTripController {
  constructor(private readonly cmsTripService: CMSTripService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách chuyến CMS (chuyến + tuyến + xe + tài xế)',
  })
  @ApiResponse({ status: 200, type: CmsTripListResponseDto })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CmsTripListQueryDto,
  ) {
    return this.cmsTripService.getAllTrips(user, query.roadId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết chuyến CMS theo ID (chuyến + tuyến + xe + tài xế)',
  })
  @ApiResponse({ status: 200, type: CmsTripDetailResponseDto })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsTripService.getTripById(user, id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Tạo chuyến mẫu (tb_trip)' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateTripPayloadDto,
  ) {
    return this.cmsTripService.createTrip(payload, user);
  }

  @Patch()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Cập nhật chuyến mẫu' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateTripPayloadDto,
  ) {
    return this.cmsTripService.updateTrip(payload, user);
  }

  @Patch('operation-status')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Cập nhật trạng thái vận hành chuyến' })
  updateOperationStatus(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpdateOperationStatusPayloadDto,
  ) {
    return this.cmsTripService.updateOperationStatus(user, payload);
  }

  @Patch('operation-status/reset')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Reset trạng thái vận hành chuyến về SCHEDULED (bắt đầu lại)' })
  resetOperationStatus(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ResetTripOperationStatusPayloadDto,
  ) {
    return this.cmsTripService.resetOperationStatus(user, payload);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Vô hiệu hóa chuyến mẫu' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cmsTripService.deleteTrip(user, id);
  }
}
