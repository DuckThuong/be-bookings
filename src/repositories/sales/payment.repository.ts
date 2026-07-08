import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbPayment } from '../../entities/sales/payment.entity';
import { PaymentStatus } from '../../assets/constants/sales.constants';

export interface PaymentPaginatedResult {
  items: TbPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  findByTransactionRef(transactionRef: string) {
    return this.repo.findOne({ where: { transactionRef } });
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

  async findByCustomerIdPaginated(
    customerId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      method?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<PaymentPaginatedResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.ticket', 'ticket')
      .leftJoinAndSelect('payment.trip', 'trip')
      .leftJoinAndSelect('payment.company', 'company')
      .leftJoinAndSelect('trip.road', 'road')
      .where('payment.customerId = :customerId', { customerId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS });

    if (options.method) {
      queryBuilder.andWhere('payment.method = :method', { method: options.method });
    }

    if (options.fromDate) {
      queryBuilder.andWhere('DATE(payment.paidAt) >= :fromDate', { fromDate: options.fromDate });
    }

    if (options.toDate) {
      queryBuilder.andWhere('DATE(payment.paidAt) <= :toDate', { toDate: options.toDate });
    }

    const [items, total] = await queryBuilder
      .orderBy('payment.paidAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Debug: log first item to check relations
    if (items.length > 0) {
      console.log('[PaymentRepo] First payment raw data:', JSON.stringify(items[0], null, 2));
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sumTotalByCustomer(customerId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
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
