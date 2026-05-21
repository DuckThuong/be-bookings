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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { VehicleService } from '../services/vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from '../dtos/company/company.dto';
import { OptionalCompanyIdQueryDto } from '../dtos/transport/common.dto';

@ApiTags('Vehicle')
@Controller('cms/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo phương tiện' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateVehicleDto,
  ) {
    return this.vehicleService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách phương tiện theo nhà xe' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: OptionalCompanyIdQueryDto,
  ) {
    return this.vehicleService.findAll(user, query.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phương tiện' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vehicleService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật phương tiện' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa phương tiện' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vehicleService.remove(user, id);
  }
}
