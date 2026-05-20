import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { CompanyTripStatService } from '../../services/sales/company-trip-stat.service';
import { UpsertCompanyTripStatDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Company Trip Stat')
@Controller('company-trip-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CompanyTripStatController {
  constructor(
    private readonly companyTripStatService: CompanyTripStatService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo/cập nhật thống kê chuyến theo ngày' })
  upsert(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpsertCompanyTripStatDto,
  ) {
    return this.companyTripStatService.upsert(user, payload);
  }

  @Post('recompute')
  @ApiOperation({ summary: 'Tính lại thống kê chuyến' })
  recompute(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyTripId', ParseIntPipe) companyTripId: number,
    @Query('statDate') statDate: string,
  ) {
    return this.companyTripStatService.recompute(
      user,
      companyTripId,
      statDate,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Thống kê theo nhà xe hoặc chuyến' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId') companyId?: string,
    @Query('companyTripId') companyTripId?: string,
  ) {
    if (companyTripId) {
      return this.companyTripStatService.findByCompanyTrip(
        user,
        parseInt(companyTripId, 10),
      );
    }
    if (companyId) {
      return this.companyTripStatService.findByCompany(
        user,
        parseInt(companyId, 10),
      );
    }
    return [];
  }
}
