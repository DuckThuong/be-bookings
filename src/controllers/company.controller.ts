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
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dtos/company/company.dto';

@ApiTags('Company')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Đăng ký nhà xe' })
  createCompany(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateCompanyDto,
  ) {
    return this.companyService.createCompany(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách nhà xe' })
  getCompanies(@User() user: UserDecoratorDtoResponse) {
    return this.companyService.getCompanies(user);
  }

  @Get('my')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Nhà xe của tôi' })
  getMyCompany(@User() user: UserDecoratorDtoResponse) {
    return this.companyService.getMyCompany(user);
  }

  @Get(':companyId/overview')
  @ApiOperation({ summary: 'Tổng quan tài nguyên nhà xe' })
  getOverview(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getCompanyOverview(user, companyId);
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Chi tiết nhà xe' })
  getCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getCompanyById(user, companyId);
  }

  @Patch(':companyId')
  @ApiOperation({ summary: 'Cập nhật nhà xe' })
  updateCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(user, companyId, payload);
  }

  @Delete(':companyId')
  @ApiOperation({ summary: 'Vô hiệu hóa nhà xe' })
  deleteCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.deleteCompany(user, companyId);
  }
}
