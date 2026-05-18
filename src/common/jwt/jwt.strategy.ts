import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../dtos/jwt/jwt.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'duckthuong-28072003-secretkey',
    });
  }

  validate(payload: JwtPayload): UserDecoratorDtoResponse {
    return {
      id: payload.sub,
      userCode: payload.userCode,
      username: payload.username,
      email: payload.email,
      password: '',
      fullName: payload.fullName,
      dateOfBirth: payload.dateOfBirth,
      status: payload.status,
      role: payload.role,
      isEmailVerified: payload.isEmailVerified,
    };
  }
}
