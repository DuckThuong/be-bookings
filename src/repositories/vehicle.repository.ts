import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbVerhical } from '../entities/verhical.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(TbVerhical)
    private readonly repo: Repository<TbVerhical>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  save(data: Partial<TbVerhical>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbVerhical>) {
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
