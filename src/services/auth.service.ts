import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ErrorLoginMessage,
  ErrorRegisterMessage,
} from '../assets/messages/auth.message';
import { CommonErrorMessage } from '../assets/messages/common.message';
import {
  equalString,
  randomString,
  validString,
} from '../common/helpers/common.helper';
import { JwtPayload } from '../dtos/jwt.dto';
import {
  AuthResponseDto,
  LoginPayloadDto,
  SignUpPayloadDto,
} from '../dtos/user/user.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserRole, UserStatus } from '../dtos/user/common.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  public async doLogin(payload: LoginPayloadDto): Promise<AuthResponseDto> {
    if (!validString(payload.phoneNumber)) {
      throw new HttpException(
        ErrorLoginMessage.PHONE_NOT_VALID.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!validString(payload.password)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_EMPTY.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const user = await this.authRepository.findByPhone(payload.phoneNumber);

    if (!user) {
      throw new HttpException(
        ErrorLoginMessage.USER_NOT_FOUND.toString(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!equalString(user.password, payload.password)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_INCORRECT.toString(),
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const payload: JwtPayload = {
        sub: user.id,
        userCode: user.userCode,
        phone: user.phone,
        email: user.email,
        status: user.status,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      };

      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async doSignUp(payload: SignUpPayloadDto): Promise<AuthResponseDto> {
    if (!validString(payload.phone)) {
      throw new HttpException(
        ErrorLoginMessage.PHONE_NOT_VALID.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!validString(payload.password)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_EMPTY.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const user = await this.authRepository.findByPhone(payload.phone);

    if (user) {
      throw new HttpException(
        ErrorRegisterMessage.USER_ALREADY_EXISTS.toString(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!equalString(payload.password, payload.confirm_password)) {
      throw new HttpException(
        ErrorRegisterMessage.PASSWORD_NOT_VALID.toString(),
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const userRegis = await this.authRepository.createUser({
        userCode: randomString(),
        email: payload.email,
        isEmailVerified: true,
        password: payload.password,
        phone: payload.phone,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      const jwtPayload: JwtPayload = {
        sub: userRegis.id,
        userCode: userRegis.userCode,
        phone: userRegis.phone,
        email: userRegis.email,
        status: userRegis.status,
        role: userRegis.role,
        isEmailVerified: userRegis.isEmailVerified,
      };

      return {
        accessToken: this.jwtService.sign(jwtPayload),
      };
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
