import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import {
  UpdateUserPayloadDto,
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

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  public async getMe(
    @User('id') userId: number,
  ): Promise<UserInformationResponseDto> {
    return this.userService.getUserById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng đang đăng nhập' })
  public async updateMe(
    @User('id') userId: number,
    @Body() payload: UpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto> {
    return this.userService.updateUserInformation(userId, payload);
  }
}
