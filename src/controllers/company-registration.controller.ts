import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiPropertyOptional,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { CompanyRegistrationService } from '../services/company-registration.service';
import {
  CreateCompanyRegistrationDto,
  UpdateCompanyRegistrationStatusDto,
  CompanyRegistrationResponseDto,
} from '../dtos/company-registration.dto';
import { IsOptional, IsIn } from 'class-validator';

class RegistrationQueryDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;
}

@ApiTags('CompanyRegistration')
@Controller('company-registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyRegistrationController {
  constructor(
    private readonly companyRegistrationService: CompanyRegistrationService,
  ) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '[USER] Đăng ký trở thành nhà xe' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateCompanyRegistrationDto,
  ): Promise<CompanyRegistrationResponseDto> {
    return this.companyRegistrationService.createRegistration(
      user.id,
      user.userCode,
      user.fullName ?? '',
      user.phone,
      user.email,
      payload,
    );
  }

  @Get('me')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: '[USER] Xem yêu cầu đăng ký của tôi' })
  getMyRegistration(@User() user: UserDecoratorDtoResponse) {
    return this.companyRegistrationService.findMyRegistration(user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Danh sách yêu cầu đăng ký nhà xe' })
  findAll(@Query() query: RegistrationQueryDto) {
    return this.companyRegistrationService.findAll(query.status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Chi tiết yêu cầu đăng ký' })
  findOne(@Param('id') id: string) {
    return this.companyRegistrationService.findById(parseInt(id, 10));
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Phê duyệt / Từ chối yêu cầu đăng ký' })
  updateStatus(
    @User() user: UserDecoratorDtoResponse,
    @Param('id') id: string,
    @Body() payload: UpdateCompanyRegistrationStatusDto,
  ) {
    if (payload.status === 'APPROVED') {
      return this.companyRegistrationService.approveRegistration(
        user.id,
        parseInt(id, 10),
      );
    }
    return this.companyRegistrationService.rejectRegistration(
      user.id,
      parseInt(id, 10),
      payload.rejectionReason ?? 'Hồ sơ không đạt yêu cầu',
    );
  }
}
