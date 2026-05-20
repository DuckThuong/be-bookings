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
import { CompanyStatService } from '../../services/sales/company-stat.service';
import { UpsertCompanyStatDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Company Stat')
@Controller('company-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CompanyStatController {
  constructor(private readonly companyStatService: CompanyStatService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo/cập nhật thống kê nhà xe theo ngày' })
  upsert(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: UpsertCompanyStatDto,
  ) {
    return this.companyStatService.upsert(user, payload);
  }

  @Post('recompute')
  @ApiOperation({ summary: 'Tính lại thống kê từ ticket/payment' })
  recompute(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('statDate') statDate: string,
  ) {
    return this.companyStatService.recompute(user, companyId, statDate);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách thống kê theo nhà xe' })
  findByCompany(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyStatService.findByCompany(user, companyId);
  }

  @Get('detail')
  @ApiOperation({ summary: 'Thống kê một ngày' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('statDate') statDate: string,
  ) {
    return this.companyStatService.findOne(user, companyId, statDate);
  }
}
