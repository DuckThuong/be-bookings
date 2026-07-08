import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbDriver } from '../entities/driver.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class DriverRepository {
  constructor(
    @InjectRepository(TbDriver)
    private readonly repo: Repository<TbDriver>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['company'] });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code }, relations: ['company'] });
  }

  findByCompany(companyId: number) {
    return this.repo.find({
      where: {
        company: { id: companyId },
        status: EntityStatus.ACTIVE || EntityStatus.INACTIVE,
      },
      relations: ['company'],
      order: { id: 'DESC' },
    });
  }

  save(data: Partial<TbDriver>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbDriver>) {
    return this.repo.update({ id }, data);
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { company: { id: companyId }, status: EntityStatus.ACTIVE },
    });
  }
}
