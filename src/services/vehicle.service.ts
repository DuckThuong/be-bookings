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
import { validString } from '../common/helpers/common.helper';
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
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);

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
      companyId,
      code: payload.code.trim(),
      type: payload.type,
      name: payload.name,
      image: payload.image ?? undefined,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
      seatNumber: payload.seatNumber ?? undefined,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<TbVehicle[]> {
    const resolvedCompanyId = await this.companyAccess.resolveCompanyIdForUser(
      user,
      companyId,
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
    const vehicle = await this.findOne(user, id);

    if (payload.code) {
      const existing = await this.vehicleRepository.findByCode(
        payload.code.trim(),
      );
      if (existing && existing.id !== id) {
        throw new HttpException(
          CompanyErrorMessage.CODE_CONFLICT,
          HttpStatus.CONFLICT,
        );
      }
    }

    await this.vehicleRepository.update(id, payload);
    return this.findOne(user, id);
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
