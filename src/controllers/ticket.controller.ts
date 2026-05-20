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
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto, UpdateTicketDto } from '../dtos/transport/ticket.dto';
import { TicketFilterQueryDto } from '../dtos/transport/common.dto';

@ApiTags('Ticket')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vé (seed / đặt vé)' })
  create(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateTicketDto,
  ) {
    return this.ticketService.create(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách vé (lọc theo companyId, ...)' })
  findAll(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: TicketFilterQueryDto,
  ) {
    return this.ticketService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vé' })
  findOne(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vé' })
  update(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateTicketDto,
  ) {
    return this.ticketService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy vé' })
  remove(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketService.remove(user, id);
  }
}
