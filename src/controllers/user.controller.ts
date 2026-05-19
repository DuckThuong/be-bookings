import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import {
  UpdateUserPayloadDto,
  UserFilterPayloadDto,
  UserInformationResponseDto,
} from '../dtos/user/user.dto';
import { UserService } from '../services/user.service';
import { User } from '../user.decorator';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  public async getAllUsers(): Promise<UserInformationResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Get('filter')
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo bộ lọc' })
  public async getUsersByFilter(
    @Query() filter: UserFilterPayloadDto,
  ): Promise<UserInformationResponseDto[]> {
    return this.userService.getUsersByFilter(filter);
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  public async getUserById(
    @User('id') userId: number,
  ): Promise<UserInformationResponseDto> {
    return this.userService.getUserById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng đang đăng nhập' })
  public async updateUserInformation(
    @User('id') userId: number,
    @Body() payload: UpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto> {
    return this.userService.updateUserInformation(userId, payload);
  }
}
