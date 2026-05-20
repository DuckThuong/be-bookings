import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyTripStat } from '../../entities/sales/company-trip-stat.entity';

@Injectable()
export class CompanyTripStatRepository {
  constructor(
    @InjectRepository(TbCompanyTripStat)
    private readonly repo: Repository<TbCompanyTripStat>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByTripAndDate(companyTripId: number, statDate: string) {
    return this.repo.findOne({ where: { companyTripId, statDate } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({
      where: { companyId },
      order: { statDate: 'DESC' },
    });
  }

  findByCompanyTrip(companyTripId: number) {
    return this.repo.find({
      where: { companyTripId },
      order: { statDate: 'DESC' },
    });
  }

  save(data: Partial<TbCompanyTripStat>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbCompanyTripStat>) {
    return this.repo.update({ id }, data);
  }
}
