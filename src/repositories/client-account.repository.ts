import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { TbTicket } from '../entities/ticket.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbRefund } from '../entities/sales/refund.entity';

export interface AccountTicketFilter {
  customerId?: string;
  companyIds?: number[];
  companyId?: number;
  status?: string;
  code?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
}

export interface AccountInvoiceFilter {
  customerId?: string;
  companyIds?: number[];
  companyId?: number;
  status?: string;
  method?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
}

export interface AccountBookingFilter {
  customerId?: string;
  companyIds?: number[];
  companyId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
}

@Injectable()
export class ClientAccountRepository {
  constructor(
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
    @InjectRepository(TbRefund)
    private readonly refundRepo: Repository<TbRefund>,
  ) {}

  findTickets(filter: AccountTicketFilter) {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .orderBy('t.createdAt', 'DESC');
    this.applyAccountScope(qb, 't', filter);
    if (filter.status) {
      qb.andWhere('t.status = :status', { status: filter.status });
    }
    if (filter.code?.trim()) {
      qb.andWhere('t.code LIKE :code', { code: `%${filter.code.trim()}%` });
    }
    this.applyDateRange(qb, 't.createdAt', filter.fromDate, filter.toDate);
    return this.paginate(qb, filter.page, filter.limit);
  }

  findTicketById(id: number) {
    return this.ticketRepo.findOne({ where: { id } });
  }

  findInvoices(filter: AccountInvoiceFilter) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .orderBy('p.createdAt', 'DESC');
    this.applyAccountScope(qb, 'p', filter);
    if (filter.status) {
      qb.andWhere('p.status = :status', { status: filter.status });
    }
    if (filter.method) {
      qb.andWhere('p.method = :method', { method: filter.method });
    }
    if (filter.search?.trim()) {
      const q = `%${filter.search.trim()}%`;
      qb.andWhere('(p.code LIKE :q OR p.transactionRef LIKE :q)', { q });
    }
    this.applyDateRange(qb, 'p.createdAt', filter.fromDate, filter.toDate);
    return this.paginate(qb, filter.page, filter.limit);
  }

  findInvoiceById(id: number) {
    return this.paymentRepo.findOne({ where: { id } });
  }

  findBookings(filter: AccountBookingFilter) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .orderBy('b.createdAt', 'DESC');
    this.applyAccountScope(qb, 'b', filter);
    if (filter.status) {
      qb.andWhere('b.status = :status', { status: filter.status });
    }
    this.applyDateRange(qb, 'b.createdAt', filter.fromDate, filter.toDate);
    return this.paginate(qb, filter.page, filter.limit);
  }

  findBookingById(id: number) {
    return this.bookingRepo.findOne({ where: { id } });
  }

  findPaymentsByTicketId(ticketId: number) {
    return this.paymentRepo.find({
      where: { ticketId },
      order: { id: 'DESC' },
    });
  }

  findRefundsByTicketId(ticketId: number) {
    return this.refundRepo.find({
      where: { ticketId },
      order: { id: 'DESC' },
    });
  }

  findRefundsByPaymentId(paymentId: number) {
    return this.refundRepo.find({
      where: { paymentId },
      order: { id: 'DESC' },
    });
  }

  private applyAccountScope(
    qb: SelectQueryBuilder<ObjectLiteral>,
    alias: string,
    filter: {
      customerId?: string;
      companyIds?: number[];
      companyId?: number;
    },
  ) {
    if (filter.customerId) {
      qb.andWhere(`${alias}.customerId = :customerId`, {
        customerId: filter.customerId,
      });
    }
    if (filter.companyIds?.length) {
      qb.andWhere(`${alias}.companyId IN (:...companyIds)`, {
        companyIds: filter.companyIds,
      });
    }
    if (filter.companyId !== undefined) {
      qb.andWhere(`${alias}.companyId = :companyId`, {
        companyId: filter.companyId,
      });
    }
  }

  private applyDateRange(
    qb: SelectQueryBuilder<ObjectLiteral>,
    column: string,
    fromDate?: string,
    toDate?: string,
  ) {
    if (fromDate) {
      qb.andWhere(`${column} >= :fromDate`, {
        fromDate: `${fromDate} 00:00:00`,
      });
    }
    if (toDate) {
      qb.andWhere(`${column} <= :toDate`, { toDate: `${toDate} 23:59:59` });
    }
  }

  private async paginate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    page: number,
    limit: number,
  ): Promise<{ items: T[]; total: number }> {
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total };
  }
}
