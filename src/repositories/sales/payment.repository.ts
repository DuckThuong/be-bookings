import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbPayment } from '../../entities/sales/payment.entity';
import { PaymentStatus } from '../../assets/constants/sales.constants';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(TbPayment)
    private readonly repo: Repository<TbPayment>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByTicketId(ticketId: number) {
    return this.repo.find({ where: { ticketId }, order: { id: 'DESC' } });
  }

  findByFilter(filter: {
    companyId?: number;
    tripId?: number;
    customerId?: string;
    status?: string;
  }) {
    return this.repo.find({
      where: {
        ...(filter.companyId !== undefined && { companyId: filter.companyId }),
        ...(filter.tripId !== undefined && { tripId: filter.tripId }),
        ...(filter.customerId && { customerId: filter.customerId }),
        ...(filter.status && { status: filter.status }),
      },
      order: { id: 'DESC' },
    });
  }

  save(data: Partial<TbPayment>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbPayment>) {
    return this.repo.update({ id }, data);
  }

  async sumSuccessByCompany(companyId: number) {
    const result = await this.repo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.companyId = :companyId', { companyId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }
}
