import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AuthResponseDto,
  LoginPayloadDto,
  SignUpPayloadDto,
} from '../dtos/user/user.dto';
import { AuthService } from '../services/auth.service';

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
}
