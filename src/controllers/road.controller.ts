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
import { RoadService } from '../services/road.service';
import { CreateRoadDto, UpdateRoadDto } from '../dtos/company/company.dto';
import { CompanyIdQueryDto } from '../dtos/transport/common.dto';

@ApiTags('Road')
@Controller('roads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class RoadController {
  constructor(private readonly roadService: RoadService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo tuyến đường' })
  create(@User() user: UserDecoratorDtoResponse, @Body() payload: CreateRoadDto) {
    return this.roadService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tuyến theo nhà xe' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CompanyIdQueryDto,
  ) {
    return this.roadService.findAll(user, query.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tuyến' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.roadService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tuyến' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRoadDto,
  ) {
    return this.roadService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa tuyến' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.roadService.remove(user, id);
  }
}
