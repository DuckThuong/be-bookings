import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbRefund } from '../../entities/sales/refund.entity';
import { RefundStatus } from '../../assets/constants/sales.constants';

export interface RefundPaginatedResult {
  items: TbRefund[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  async findByCustomerIdPaginated(
    customerId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<RefundPaginatedResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.payment', 'payment')
      .leftJoinAndSelect('refund.ticket', 'ticket')
      .leftJoinAndSelect('refund.trip', 'trip')
      .leftJoinAndSelect('refund.company', 'company')
      .leftJoinAndSelect('trip.road', 'road')
      .where('payment.customerId = :customerId', { customerId });

    if (options.status) {
      queryBuilder.andWhere('refund.status = :status', { status: options.status });
    }

    if (options.fromDate) {
      queryBuilder.andWhere('DATE(refund.createdAt) >= :fromDate', { fromDate: options.fromDate });
    }

    if (options.toDate) {
      queryBuilder.andWhere('DATE(refund.createdAt) <= :toDate', { toDate: options.toDate });
    }

    const [items, total] = await queryBuilder
      .orderBy('refund.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
      .createQueryBuilder('r')
      .innerJoin('r.payment', 'p')
      .select('SUM(r.amount)', 'total')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('r.status = :status', { status: RefundStatus.SUCCESS })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
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
