import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { SettlementService } from '../../services/sales/settlement.service';
import {
  CreateSettlementDto,
  UpdateSettlementDto,
} from '../../dtos/sales/sales.dto';

@ApiTags('Sales - Settlement')
@Controller('settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đối soát thủ công' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateSettlementDto,
  ) {
    return this.settlementService.create(user, payload);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Sinh bản đối soát nháp từ payment/refund' })
  generate(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('periodFrom') periodFrom: string,
    @Query('periodTo') periodTo: string,
  ) {
    return this.settlementService.generateDraft(
      user,
      companyId,
      periodFrom,
      periodTo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách đối soát theo nhà xe' })
  findByCompany(
    @User() user: UserDecoratorDtoResponse,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.settlementService.findByCompany(user, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đối soát' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.settlementService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đối soát' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateSettlementDto,
  ) {
    return this.settlementService.update(user, id, payload);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Đánh dấu đã chuyển tiền cho nhà xe' })
  markPaid(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.settlementService.markPaid(user, id);
  }
}
