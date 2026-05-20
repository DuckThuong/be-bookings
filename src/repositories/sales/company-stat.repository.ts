import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyStat } from '../../entities/sales/company-stat.entity';

@Injectable()
export class CompanyStatRepository {
  constructor(
    @InjectRepository(TbCompanyStat)
    private readonly repo: Repository<TbCompanyStat>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCompanyAndDate(companyId: number, statDate: string) {
    return this.repo.findOne({ where: { companyId, statDate } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({
      where: { companyId },
      order: { statDate: 'DESC' },
    });
  }

  save(data: Partial<TbCompanyStat>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbCompanyStat>) {
    return this.repo.update({ id }, data);
  }
}
