import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class CompanyTripRepository {
  constructor(
    @InjectRepository(TbCompanyTrip)
    private readonly repo: Repository<TbCompanyTrip>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  save(data: Partial<TbCompanyTrip>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbCompanyTrip>) {
    return this.repo.update({ id }, data);
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }
}
