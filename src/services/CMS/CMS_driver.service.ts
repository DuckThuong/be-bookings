import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DriverService } from '../driver.service';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsDriverSuccessMessage } from '../../assets/messages/cms-driver.message';
import {
  CreateDriverPayloadDto,
  UpdateDriverPayloadDto,
  DriverResponseDto,
  CmsDriverDetailResponseDto,
  CmsDriverEntityDto,
  CmsDriverListResponseDto,
} from '../../dtos/CMS/CMS_driver.dto';
import { CODE_PREFIX } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { TbDriver } from '../../entities/driver.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';

@Injectable()
export class CMSDriverService {
  constructor(private readonly driverService: DriverService) {}

  async getDriverById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsDriverDetailResponseDto> {
    return this.toResponse(await this.driverService.findOne(user, id));
  }

  async getAllDrivers(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsDriverListResponseDto> {
    const drivers = await this.driverService.findAll(user, companyId);
    const items = drivers.map((driver) => this.toResponse(driver));
    return { items, total: items.length };
  }

  async createDriver(
    payload: CreateDriverPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<DriverResponseDto> {
    try {
      const driver = await this.driverService.create(user, {
        companyId: payload.companyId,
        code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.DRIVER),
        name: payload.name.trim(),
        license: payload.license.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim(),
        licenseNum: payload.licenseNum.trim(),
        description: payload.description?.trim(),
        status: payload.status,
      });

      if (payload.rate !== undefined || payload.totalTurn !== undefined) {
        await this.driverService.update(user, driver.id, {
          ...(payload.rate !== undefined ? { rate: payload.rate } : {}),
          ...(payload.totalTurn !== undefined
            ? { totalTurn: payload.totalTurn }
            : {}),
        } as Partial<TbDriver>);
        return this.toResponse(await this.driverService.findOne(user, driver.id));
      }

      return this.toResponse(driver);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async updateDriver(
    payload: UpdateDriverPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<DriverResponseDto> {
    try {
      const driver = await this.driverService.update(user, payload.id, {
        name: payload.name.trim(),
        license: payload.license.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim(),
        description: payload.description?.trim(),
        status: payload.status,
        rate: payload.rate,
        totalTurn: payload.totalTurn,
      } as Partial<TbDriver>);

      return this.toResponse(driver);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async deleteDriver(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; driverId: number }> {
    try {
      await this.driverService.remove(user, id);
      return {
        message: CmsDriverSuccessMessage.DELETE_SUCCESS,
        driverId: id,
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  private toResponse(driver: TbDriver): CmsDriverEntityDto {
    return {
      id: driver.id,
      code: driver.code,
      companyId: driver.companyId,
      name: driver.name,
      license: driver.license,
      licenseNum: driver.licenseNum,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      description: driver.description ?? undefined,
      rate: Number(driver.rate),
      totalTurn: driver.totalTurn,
      createdAt: driver.createdAt?.toISOString?.() ?? undefined,
      updatedAt: driver.updatedAt?.toISOString?.() ?? undefined,
    };
  }

  private rethrow(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      CommonErrorMessage.CATCH_ERROR.toString(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
