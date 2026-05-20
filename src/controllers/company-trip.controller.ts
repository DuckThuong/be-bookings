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
import { CompanyTripService } from '../services/company-trip.service';
import {
  CreateCompanyTripDto,
  UpdateCompanyTripDto,
} from '../dtos/company/company.dto';
import { CompanyIdQueryDto } from '../dtos/transport/common.dto';

@ApiTags('Company Trip')
@Controller('company-trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CompanyTripController {
  constructor(private readonly companyTripService: CompanyTripService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chuyến khai thác' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateCompanyTripDto,
  ) {
    return this.companyTripService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách chuyến khai thác theo nhà xe' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: CompanyIdQueryDto,
  ) {
    return this.companyTripService.findAll(user, query.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chuyến khai thác' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companyTripService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật chuyến khai thác' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateCompanyTripDto,
  ) {
    return this.companyTripService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa chuyến khai thác' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companyTripService.remove(user, id);
  }
}
