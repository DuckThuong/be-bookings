import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ErrorForgotPasswordMessage,
  ErrorLoginMessage,
  ErrorRegisterMessage,
  ErrorResetPasswordMessage,
  MailErrorMessage,
  MailSuccessMessage,
  SuccessResetPasswordMessage,
} from '../assets/messages/auth.message';
import { CommonErrorMessage } from '../assets/messages/common.message';
import {
  equalString,
  generateOtp,
  randomString,
  validString,
} from '../common/helpers/common.helper';
import { isEmail } from '../common/validators/validator';
import { JwtPayload } from '../dtos/jwt.dto';
import {
  AuthResponseDto,
  ChangePasswordPayloadDto,
  ForgotPasswordPayloadDto,
  LoginPayloadDto,
  MessageResponseDto,
  ResetPasswordPayloadDto,
  SignUpPayloadDto,
} from '../dtos/user/user.dto';
import { AuthRepository } from '../repositories/auth.repository';
import {
  UserDecoratorDtoResponse,
  UserRole,
  UserStatus,
} from '../dtos/user/common.dto';
import { MailService } from './mail.service';
import { OtpCacheService } from './otp-cache.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private otpCacheService: OtpCacheService,
    private mailService: MailService,
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

      await this.authRepository.createInfoUser({
        userName: payload.name,
        userDob: payload.dateOfBirth,
        userGender: payload.gender,
        avatar: '',
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

  public async forgotPassword(
    payload: ForgotPasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    if (!validString(payload.email) || !isEmail(payload.email)) {
      throw new HttpException(
        ErrorRegisterMessage.EMAIL_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) {
      throw new HttpException(
        ErrorForgotPasswordMessage.EMAIL_NOT_EXIST.toString(),
        HttpStatus.NOT_FOUND,
      );
    }

    const otp = generateOtp();
    this.otpCacheService.set(payload.email, otp);

    try {
      await this.mailService.sendPasswordResetOtp(payload.email, otp);
    } catch {
      throw new HttpException(
        MailErrorMessage.SEND_EMAIL_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: MailSuccessMessage.OTP_SENT };
  }

  public async resetPassword(
    payload: ResetPasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    if (!validString(payload.email) || !isEmail(payload.email)) {
      throw new HttpException(
        ErrorRegisterMessage.EMAIL_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validString(payload.otp)) {
      throw new HttpException(
        MailErrorMessage.OTP_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validString(payload.password)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_EMPTY.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!equalString(payload.password, payload.confirm_password)) {
      throw new HttpException(
        ErrorRegisterMessage.PASSWORD_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) {
      throw new HttpException(
        ErrorForgotPasswordMessage.EMAIL_NOT_EXIST.toString(),
        HttpStatus.NOT_FOUND,
      );
    }

    const otpStatus = this.otpCacheService.verify(payload.email, payload.otp);
    if (otpStatus === 'not_found') {
      throw new HttpException(
        MailErrorMessage.OTP_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (otpStatus === 'expired') {
      throw new HttpException(
        MailErrorMessage.OTP_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (otpStatus === 'invalid') {
      throw new HttpException(
        MailErrorMessage.OTP_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (equalString(user.password, payload.password)) {
      throw new HttpException(
        ErrorResetPasswordMessage.PASSWORD_IS_EQUAL.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.authRepository.updatePassword(user.id, payload.password);
      this.otpCacheService.delete(payload.email);
      return { message: SuccessResetPasswordMessage.RESET_SUCCESS };
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        ErrorResetPasswordMessage.RESET_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async changePassword(
    user: UserDecoratorDtoResponse,
    payload: ChangePasswordPayloadDto,
  ): Promise<MessageResponseDto> {
    if (!validString(payload.oldPassword)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_EMPTY.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!validString(payload.password)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_EMPTY.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!equalString(payload.password, payload.confirm_password)) {
      throw new HttpException(
        ErrorRegisterMessage.PASSWORD_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    const basicUser = await this.authRepository.findByPhone(user.phone);
    if (!basicUser) {
      throw new HttpException(
        ErrorLoginMessage.USER_NOT_FOUND.toString(),
        HttpStatus.NOT_FOUND,
      );
    }

    if (!equalString(basicUser.password, payload.oldPassword)) {
      throw new HttpException(
        ErrorLoginMessage.PASSWORD_INCORRECT.toString(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (equalString(basicUser.password, payload.password)) {
      throw new HttpException(
        ErrorResetPasswordMessage.PASSWORD_IS_EQUAL.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.authRepository.updatePassword(basicUser.id, payload.password);
      return { message: SuccessResetPasswordMessage.RESET_SUCCESS };
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        ErrorResetPasswordMessage.RESET_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
