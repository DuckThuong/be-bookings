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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { DriverService } from '../services/driver.service';
import { CreateDriverDto, UpdateDriverDto } from '../dtos/company/company.dto';

@ApiTags('Driver')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo tài xế' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateDriverDto,
  ) {
    return this.driverService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài xế theo nhà xe' })
  findAll(@User() user: UserDecoratorDtoResponse) {
    return this.driverService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tài xế' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.driverService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tài xế' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateDriverDto,
  ) {
    return this.driverService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa tài xế' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.driverService.remove(user, id);
  }
}
