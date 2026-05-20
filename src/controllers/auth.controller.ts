import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import {
  AuthResponseDto,
  ChangePasswordPayloadDto,
  ForgotPasswordPayloadDto,
  LoginPayloadDto,
  MessageResponseDto,
  ResetPasswordPayloadDto,
  SignUpPayloadDto,
} from '../dtos/user/user.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { AuthService } from '../services/auth.service';
import { User } from '../user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Sign In' })
  @Post('login')
  public async doLogin(
    @Body() payload: LoginPayloadDto,
  ): Promise<AuthResponseDto> {
    return this.authService.doLogin(payload);
  }

  @ApiOperation({ summary: 'User Sign Up' })
  @Post('sign-up')
  public async doSignUp(
    @Body() payload: SignUpPayloadDto,
  ): Promise<AuthResponseDto> {
    return this.authService.doSignUp(payload);
  }

  @ApiOperation({ summary: 'Gửi OTP đặt lại mật khẩu qua email' })
  @Post('forgot-password')
  public async forgotPassword(
    @Body() payload: ForgotPasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(payload);
  }

  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng OTP (quên mật khẩu)' })
  @Post('reset-password')
  public async resetPassword(
    @Body() payload: ResetPasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resetPassword(payload);
  }

  @ApiOperation({ summary: 'Đổi mật khẩu khi đã đăng nhập' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  public async changePassword(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ChangePasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    return this.authService.changePassword(user, payload);
  }
}
