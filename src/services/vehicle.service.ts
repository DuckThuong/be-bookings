import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbVerhical } from '../entities/verhical.entity';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { EntityStatus } from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { validString } from '../common/helpers/common.helper';
import { CreateVehicleDto, UpdateVehicleDto } from '../dtos/company/company.dto';
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
  ): Promise<TbVerhical> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);

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
      companyId: payload.companyId,
      code: payload.code.trim(),
      type: payload.type,
      name: payload.name,
      image: payload.image ?? undefined,
      schedule: payload.schedule ?? undefined,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbVerhical[]> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.vehicleRepository.findByCompany(companyId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbVerhical> {
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
  ): Promise<TbVerhical> {
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
