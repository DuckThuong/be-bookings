import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { TbDriver } from '../entities/driver.entity';
import { DriverRepository } from '../repositories/driver.repository';
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { generateEntityCode } from '../common/helpers/common.helper';
import { CreateDriverDto } from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';
import { TbCompany } from '../entities';

@Injectable()
export class DriverService {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateDriverDto,
  ): Promise<TbDriver> {
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);

    return this.driverRepository.save({
      company: { id: companyId } as TbCompany,
      code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.DRIVER),
      name: payload.name,
      license: payload.license,
      licenseNum: payload.licenseNum,
      phone: payload.phone,
      email: payload.email,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
      rate: 0,
      totalTurn: 0,
    });
  }

  async findAll(user: UserDecoratorDtoResponse): Promise<TbDriver[]> {
    const resolvedCompanyId =
      await this.companyAccess.resolveCompanyIdForUser(user);
    return this.driverRepository.findByCompany(resolvedCompanyId);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number): Promise<TbDriver> {
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      throw new NotFoundException(CompanyErrorMessage.DRIVER_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, driver.company.id);
    return driver;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: Partial<TbDriver>,
  ): Promise<TbDriver> {
    await this.findOne(user, id);

    await this.driverRepository.update(id, payload);
    return this.findOne(user, id);
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.driverRepository.update(id, { status: EntityStatus.INACTIVE });
    return { message: 'Đã vô hiệu hóa tài xế' };
  }
}
