import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbVehicle } from '../entities/vehicle.entity';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { EntityStatus } from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import {
  parsePositiveInt,
  validString,
} from '../common/helpers/common.helper';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateVehicleDto,
  ): Promise<TbVehicle> {
    const resolvedCompanyId = await this.companyAccess.resolveCompanyIdForUser(
      user
    );
    if (!validString(payload.code)) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.vehicleRepository.findByCode(
      payload.code.trim(),
    );
    if (existing) {
      throw new HttpException(
        CompanyErrorMessage.CODE_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }

    return this.vehicleRepository.save({
      companyId: resolvedCompanyId,
      code: payload.code.trim(),
      type: payload.type,
      name: payload.name,
      seatCount: payload.seatCount,
      image: payload.image ?? undefined,
      schedule: payload.schedule ?? undefined,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async findAll(user: UserDecoratorDtoResponse): Promise<TbVehicle[]> {
    const resolvedCompanyId = await this.companyAccess.resolveCompanyIdForUser(
      user,
    );
    return this.vehicleRepository.findByCompany(resolvedCompanyId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbVehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(CompanyErrorMessage.VEHICLE_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, vehicle.companyId);
    return vehicle;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateVehicleDto,
  ): Promise<TbVehicle> {
    const existingVehicle = await this.findOne(user, id);
    const formatted = this.buildVehicleUpdateData(existingVehicle, payload);

    if (formatted.code && formatted.code !== existingVehicle.code) {
      const duplicate = await this.vehicleRepository.findByCode(formatted.code);
      if (duplicate && duplicate.id !== id) {
        throw new HttpException(
          CompanyErrorMessage.CODE_CONFLICT,
          HttpStatus.CONFLICT,
        );
      }
    }

    await this.vehicleRepository.update(id, formatted);
    return this.findOne(user, id);
  }

  private buildVehicleUpdateData(
    existing: TbVehicle,
    payload: UpdateVehicleDto,
  ): Partial<TbVehicle> {
    const cloned: TbVehicle = { ...existing };

    return {
      code:
        payload.code !== undefined && validString(payload.code)
          ? payload.code.trim()
          : cloned.code,
      type:
        payload.type !== undefined && validString(payload.type)
          ? payload.type.trim()
          : cloned.type,
      name:
        payload.name !== undefined && validString(payload.name)
          ? payload.name.trim()
          : cloned.name,
      status:
        payload.status !== undefined && validString(payload.status)
          ? payload.status.trim()
          : cloned.status,
      image:
        payload.image !== undefined
          ? validString(payload.image)
            ? payload.image.trim()
            : cloned.image
          : cloned.image,
      schedule:
        payload.schedule !== undefined
          ? validString(payload.schedule)
            ? payload.schedule.trim()
            : cloned.schedule
          : cloned.schedule,
      description:
        payload.description !== undefined
          ? validString(payload.description)
            ? payload.description.trim()
            : cloned.description
          : cloned.description,
      seatCount:
        payload.seatCount !== undefined
          ? (parsePositiveInt(payload.seatCount) ?? cloned.seatCount)
          : cloned.seatCount,
    };
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.vehicleRepository.update(id, { status: EntityStatus.INACTIVE });
    return { message: 'Đã vô hiệu hóa phương tiện' };
  }
}
