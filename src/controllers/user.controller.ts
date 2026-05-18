import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {}
