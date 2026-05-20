import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TbMasterData } from '../entities/master-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterDataRepository } from '../repositories/master-data.repository';
import { MasterDataDtoPayload } from '../dtos/master-data.dto';
import { validString } from '../common/helpers/common.helper';
import { CommonErrorMessage } from '../assets/messages/common.message';

@Injectable()
export class MasterDataService {
  constructor(private readonly masterDataRepository: MasterDataRepository) {}

  public async findDataByType(
    payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    if (!validString(payload.type)) {
      throw new HttpException(
        CommonErrorMessage.TYPE_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.masterDataRepository.findDataByType(payload.type);
      if (!data) {
        throw new HttpException(
          CommonErrorMessage.DATA_NOT_FOUND.toString(),
          HttpStatus.BAD_REQUEST,
        );
      }
      return data;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async findDataByCode(
    payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    if (!validString(payload.code)) {
      throw new HttpException(
        CommonErrorMessage.CODE_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.masterDataRepository.findDataByCode(payload.code);
      if (!data) {
        throw new HttpException(
          CommonErrorMessage.DATA_NOT_FOUND.toString(),
          HttpStatus.BAD_REQUEST,
        );
      }
      return data;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async findDataByTypeAndCode(
    payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    if (!validString(payload.type) || !validString(payload.code)) {
      throw new HttpException(
        CommonErrorMessage.TYPE_AND_CODE_NOT_VALID.toString(),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.masterDataRepository.findDataByTypeAndCode(
        payload.type,
        payload.code,
      );
      if (!data) {
        throw new HttpException(
          CommonErrorMessage.DATA_NOT_FOUND.toString(),
          HttpStatus.BAD_REQUEST,
        );
      }
      return data;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
