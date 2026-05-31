import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbVehicle } from '../entities/vehicle.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(TbVehicle)
    private readonly repo: Repository<TbVehicle>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({
      where: {
        companyId,
        status: EntityStatus.ACTIVE || EntityStatus.INACTIVE,
      },
      order: { id: 'DESC' },
    });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  save(data: Partial<TbVehicle>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbVehicle>) {
    return this.repo.update({ id }, data);
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  findIdsByCompany(companyId: number) {
    return this.repo.find({
      where: { companyId },
      select: ['id'],
    });
  }
}
