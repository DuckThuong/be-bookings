import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TbMasterData } from '../entities/master-data.entity';
import { MasterDataRepository } from '../repositories/master-data.repository';
import { MasterDataDtoPayload, MasterDataAllResponseDto } from '../dtos/master-data.dto';
import { validString } from '../common/helpers/common.helper';
import { CommonErrorMessage } from '../assets/messages/common.message';
import { MasterDataType } from '../assets/constants/company.constants';

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

  /**
   * Get all statuses from database
   */
  public async getAllStatuses(): Promise<MasterDataAllResponseDto> {
    try {
      const [
        driverStatuses,
        driverLicenses,
        vehicleStatuses,
        vehicleTypes,
        routeStatuses,
        customerStatuses,
        customerTiers,
        reportStatuses,
        reportTypes,
        seatTypes,
        registrationStatuses,
        bookingStatuses,
      ] = await Promise.all([
        this.masterDataRepository.findDataByType(MasterDataType.DRIVER_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.DRIVER_LICENSE),
        this.masterDataRepository.findDataByType(MasterDataType.VEHICLE_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.VEHICLE_TYPE),
        this.masterDataRepository.findDataByType(MasterDataType.ROUTE_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.CUSTOMER_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.CUSTOMER_TIER),
        this.masterDataRepository.findDataByType(MasterDataType.REPORT_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.REPORT_TYPE),
        this.masterDataRepository.findDataByType(MasterDataType.SEAT_TYPE),
        this.masterDataRepository.findDataByType(MasterDataType.REGISTRATION_STATUS),
        this.masterDataRepository.findDataByType(MasterDataType.BOOKING_STATUS),
      ]);

      return {
        driverStatuses: this.toMasterDataItem(driverStatuses),
        driverLicenses: this.toMasterDataItem(driverLicenses),
        vehicleStatuses: this.toMasterDataItem(vehicleStatuses),
        vehicleTypes: this.toMasterDataItem(vehicleTypes),
        routeStatuses: this.toMasterDataItem(routeStatuses),
        customerStatuses: this.toMasterDataItem(customerStatuses),
        customerTiers: this.toMasterDataItem(customerTiers),
        reportStatuses: this.toMasterDataItem(reportStatuses),
        reportTypes: this.toMasterDataItem(reportTypes),
        seatTypes: this.toMasterDataItem(seatTypes),
        registrationStatuses: this.toMasterDataItem(registrationStatuses),
        bookingStatuses: this.toMasterDataItem(bookingStatuses),
      };
    } catch (error) {
      console.log('error in getAllStatuses: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get master data by multiple types
   */
  public async getByTypes(types: string[]): Promise<Record<string, TbMasterData[]>> {
    const result: Record<string, TbMasterData[]> = {};

    for (const type of types) {
      const data = await this.masterDataRepository.findDataByType(type);
      result[type] = data ?? [];
    }

    return result;
  }

  private toMasterDataItem(
    data: TbMasterData[] | null | undefined,
  ): { id: number; type: string; code: string; name: string; rule?: string; sort: number }[] {
    if (data && data.length > 0) {
      return data.map((item) => ({
        id: item.id,
        type: item.type,
        code: item.code,
        name: item.name,
        rule: item.rule ?? undefined,
        sort: item.sort,
      }));
    }
    return [];
  }
}
