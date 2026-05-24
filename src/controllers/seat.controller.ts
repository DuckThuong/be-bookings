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
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { SeatService } from '../services/seat.service';
import {
  CreateSeatDto,
  CreateSeatsBatchDto,
} from '../dtos/company/company.dto';
import { UpdateSeatDto } from '../dtos/transport/ticket.dto';
import { VehicleIdQueryDto } from '../dtos/transport/common.dto';

@ApiTags('Seat')
@Controller('seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post('batch')
  @ApiOperation({ summary: 'Tạo nhiều ghế (layout xe)' })
  createBatch(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateSeatsBatchDto,
  ) {
    return this.seatService.createBatch(user, payload);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo một ghế' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateSeatDto,
  ) {
    return this.seatService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách ghế theo xe' })
  findByVehicle(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: VehicleIdQueryDto,
  ) {
    return this.seatService.findByVehicle(
      user,
      query.companyId,
      query.vehicleId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết ghế' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.seatService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật ghế' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Body() payload: UpdateSeatDto,
  ) {
    return this.seatService.update(user, id, companyId, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vô hiệu hóa ghế' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.seatService.remove(user, id, companyId);
  }
}
