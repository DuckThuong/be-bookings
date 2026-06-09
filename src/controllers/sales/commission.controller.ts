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
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { User } from '../../user.decorator';
import { CommissionService } from '../../services/sales/commission.service';
import { CreateCommissionDto } from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Commission')
@Controller('commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hoa hồng cho thanh toán' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateCommissionDto,
  ) {
    return this.commissionService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách hoa hồng theo nhà xe' })
  findByCompany(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.commissionService.findByCompany(user, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết hoa hồng' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commissionService.findOne(user, id);
  }
}
