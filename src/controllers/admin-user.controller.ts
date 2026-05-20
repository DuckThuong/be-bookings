import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../dtos/user/common.dto';
import {
  AdminUpdateUserPayloadDto,
  UserFilterPayloadDto,
  UserInformationResponseDto,
} from '../dtos/user/user.dto';
import { UserService } from '../services/user.service';
import { User } from '../user.decorator';

@ApiTags('Admin - User')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả người dùng' })
  public async getAllUsers(): Promise<UserInformationResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Get('filter')
  @ApiOperation({ summary: '[Admin] Lấy danh sách người dùng theo bộ lọc' })
  public async getUsersByFilter(
    @Query() filter: UserFilterPayloadDto,
  ): Promise<UserInformationResponseDto[]> {
    return this.userService.getUsersByFilter(filter);
  }

  @Get(':userId')
  @ApiOperation({ summary: '[Admin] Lấy thông tin người dùng theo ID' })
  public async getUserById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserInformationResponseDto> {
    return this.userService.getUserById(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: '[Admin] Cập nhật thông tin người dùng' })
  public async updateUser(
    @User('id') adminId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: AdminUpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto> {
    return this.userService.adminUpdateUser(adminId, userId, payload);
  }
}
