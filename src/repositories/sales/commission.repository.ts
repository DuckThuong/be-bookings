import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCommission } from '../../entities/sales/commission.entity';

@Injectable()
export class CommissionRepository {
  constructor(
    @InjectRepository(TbCommission)
    private readonly repo: Repository<TbCommission>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByPaymentId(paymentId: number) {
    return this.repo.findOne({ where: { paymentId } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  save(data: Partial<TbCommission>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbCommission>) {
    return this.repo.update({ id }, data);
  }
}
