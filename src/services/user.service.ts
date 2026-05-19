import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorRegisterMessage } from '../assets/messages/auth.message';
import { CommonErrorMessage } from '../assets/messages/common.message';
import { ErrorUserMessage } from '../assets/messages/user.message';
import { validString } from '../common/helpers/common.helper';
import {
  UpdateUserPayloadDto,
  UserFilterPayloadDto,
  UserInformationResponseDto,
} from '../dtos/user/user.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUserById(
    userId: number,
  ): Promise<UserInformationResponseDto> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException(
        CommonErrorMessage.DATA_NOT_FOUND.toString(),
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  public async getAllUsers(): Promise<UserInformationResponseDto[]> {
    return this.userRepository.findAllUsers();
  }

  public async getUsersByFilter(
    filter: UserFilterPayloadDto,
  ): Promise<UserInformationResponseDto[]> {
    return this.userRepository.findUsersByFilter(filter);
  }

  public async updateUserInformation(
    userId: number,
    payload: UpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto> {
    if (!this.hasUpdateFields(payload)) {
      throw new HttpException(
        ErrorUserMessage.PAYLOAD_EMPTY.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payload.userName !== undefined && !validString(payload.userName)) {
      throw new HttpException(
        ErrorUserMessage.USER_NAME_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payload.userDob !== undefined && !validString(payload.userDob)) {
      throw new HttpException(
        ErrorUserMessage.USER_DOB_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      payload.userGender !== undefined &&
      ![1, 2, 3].includes(payload.userGender)
    ) {
      throw new HttpException(
        ErrorUserMessage.USER_GENDER_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payload.userPhone !== undefined && !validString(payload.userPhone)) {
      throw new HttpException(
        ErrorUserMessage.USER_PHONE_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payload.userEmail !== undefined && !validString(payload.userEmail)) {
      throw new HttpException(
        ErrorUserMessage.USER_EMAIL_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      if (payload.userPhone) {
        const phoneExists =
          await this.userRepository.findBasicByPhoneExcludingUser(
            payload.userPhone,
            userId,
          );
        if (phoneExists) {
          throw new HttpException(
            ErrorRegisterMessage.PHONE_NUMBER_ALREADY_EXISTS.toString(),
            HttpStatus.CONFLICT,
          );
        }
      }

      if (payload.userEmail) {
        const emailExists =
          await this.userRepository.findBasicByEmailExcludingUser(
            payload.userEmail,
            userId,
          );
        if (emailExists) {
          throw new HttpException(
            ErrorRegisterMessage.EMAIL_ALREADY_EXISTS.toString(),
            HttpStatus.CONFLICT,
          );
        }
      }

      const user = await this.userRepository.updateUserInformation(
        userId,
        payload,
      );
      if (!user) {
        throw new HttpException(
          CommonErrorMessage.DATA_NOT_FOUND.toString(),
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private hasUpdateFields(payload: UpdateUserPayloadDto): boolean {
    return Object.values(payload).some((value) => value !== undefined);
  }
}
