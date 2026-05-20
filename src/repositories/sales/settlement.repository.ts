import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbSettlement } from '../../entities/sales/settlement.entity';

@Injectable()
export class SettlementRepository {
  constructor(
    @InjectRepository(TbSettlement)
    private readonly repo: Repository<TbSettlement>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  save(data: Partial<TbSettlement>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbSettlement>) {
    return this.repo.update({ id }, data);
  }
}
