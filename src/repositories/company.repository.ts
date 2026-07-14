import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompany } from '../entities/company/company.entity';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
  ) {}

  findCompanyById(id: number) {
    return this.companyRepo.findOne({ where: { id } });
  }

  findCompanyByCode(code: string) {
    return this.companyRepo.findOne({ where: { code } });
  }

  findCompaniesByUserLead(userLeadId: string) {
    return this.companyRepo.find({
      where: { userLead: { id: Number(userLeadId) } },
    });
  }

  findAllCompanies() {
    return this.companyRepo.find({ order: { id: 'DESC' } });
  }

  saveCompany(data: Partial<TbCompany>) {
    return this.companyRepo.save(this.companyRepo.create(data));
  }

  updateCompany(id: number, data: Partial<TbCompany>) {
    return this.companyRepo.update({ id }, data as object);
  }
}
