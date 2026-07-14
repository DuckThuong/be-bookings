import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbVehicle } from '../entities/vehicle.entity';

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
    // Count vehicles with status 'READY' from master data (Sẵn sàng)
    return this.repo.count({
      where: { companyId, status: 'READY' },
    });
  }

  findIdsByCompany(companyId: number) {
    return this.repo.find({
      where: { companyId },
      select: ['id'],
    });
  }
}
