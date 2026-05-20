import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbRefund } from '../../entities/sales/refund.entity';
import { RefundStatus } from '../../assets/constants/sales.constants';

@Injectable()
export class RefundRepository {
  constructor(
    @InjectRepository(TbRefund)
    private readonly repo: Repository<TbRefund>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByFilter(filter: {
    companyId?: number;
    paymentId?: number;
    ticketId?: number;
  }) {
    return this.repo.find({
      where: {
        ...(filter.companyId !== undefined && { companyId: filter.companyId }),
        ...(filter.paymentId !== undefined && { paymentId: filter.paymentId }),
        ...(filter.ticketId !== undefined && { ticketId: filter.ticketId }),
      },
      order: { id: 'DESC' },
    });
  }

  save(data: Partial<TbRefund>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbRefund>) {
    return this.repo.update({ id }, data);
  }

  async sumSuccessByCompany(companyId: number) {
    const result = await this.repo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.companyId = :companyId', { companyId })
      .andWhere('r.status = :status', { status: RefundStatus.SUCCESS })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }
}
