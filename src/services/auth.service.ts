import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorLoginMessage } from '../assets/messages/auth.message';
import { CommonErrorMessage } from '../assets/messages/common.message';
import { validString } from '../common/helpers/common.helper';
import { JwtPayload } from '../dtos/jwt.dto';
import { AuthResponseDto, LoginPayloadDto } from '../dtos/user/user.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private firebaseService?: FirebaseService,
  ) {}

  public async doLogin(payload: LoginPayloadDto): Promise<AuthResponseDto> {
    if (!validString(payload.phoneNumber)) {
      throw new HttpException(
        ErrorLoginMessage.PHONE_NOT_VALID.toString(),
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

    if (!user.isEmailVerified) {
      throw new HttpException(
        ErrorLoginMessage.USER_NOT_VERIFIED.toString(),
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

  // public async doSignUp(payload: SignUpPayloadDto): Promise<AuthResponseDto> {
  //   try {
  //   } catch (error) {
  //     console.log('error: ', error);
  //     throw new HttpException(
  //       CommonErrorMessage.CATCH_ERROR.toString(),
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
