import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto, LoginPayloadDto } from '../dtos/user/user.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Sign Up' })
  @Post('login')
  public async doLogin(
    @Body() payload: LoginPayloadDto,
  ): Promise<AuthResponseDto> {
    return this.authService.doLogin(payload);
  }
}
