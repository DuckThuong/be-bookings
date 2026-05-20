import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { PaymentStatus } from '../assets/constants/sales.constants';
import { TicketStatus } from '../assets/constants/ticket.constants';

export interface CustomerActivityRow {
  customerId: string;
  ticketCount: number;
  bookingCount: number;
  totalPaid: number;
  lastActivityAt: Date | null;
  pendingTicketCount: number;
  refundCount: number;
}

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbRefund)
    private readonly refundRepo: Repository<TbRefund>,
  ) {}

  async findDistinctCustomerIdsByCompany(companyId: number): Promise<string[]> {
    const ticketRows = await this.ticketRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.customerId', 'customerId')
      .where('t.companyId = :companyId', { companyId })
      .getRawMany<{ customerId: string }>();

    const bookingRows = await this.bookingRepo
      .createQueryBuilder('b')
      .select('DISTINCT b.customerId', 'customerId')
      .where('b.companyId = :companyId', { companyId })
      .getRawMany<{ customerId: string }>();

    const ids = new Set<string>();
    ticketRows.forEach((r) => ids.add(r.customerId));
    bookingRows.forEach((r) => ids.add(r.customerId));
    return [...ids];
  }

  async getActivityByCompany(
    companyId: number,
    customerId: string,
  ): Promise<CustomerActivityRow> {
    const ticketCount = await this.ticketRepo.count({
      where: { companyId, customerId },
    });
    const bookingCount = await this.bookingRepo.count({
      where: { companyId, customerId },
    });
    const pendingTicketCount = await this.ticketRepo.count({
      where: {
        companyId,
        customerId,
        status: TicketStatus.PENDING,
      },
    });

    const paidResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.companyId = :companyId', { companyId })
      .andWhere('p.customerId = :customerId', { customerId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne<{ total: string }>();

    const refundCount = await this.countRefundsForCustomer(
      companyId,
      customerId,
    );

    const lastTicket = await this.ticketRepo.findOne({
      where: { companyId, customerId },
      order: { createdAt: 'DESC' },
    });
    const lastBooking = await this.bookingRepo.findOne({
      where: { companyId, customerId },
      order: { createdAt: 'DESC' },
    });

    let lastActivityAt: Date | null = null;
    if (lastTicket?.createdAt && lastBooking?.createdAt) {
      lastActivityAt =
        lastTicket.createdAt > lastBooking.createdAt
          ? lastTicket.createdAt
          : lastBooking.createdAt;
    } else {
      lastActivityAt = lastTicket?.createdAt ?? lastBooking?.createdAt ?? null;
    }

    return {
      customerId,
      ticketCount,
      bookingCount,
      totalPaid: Number(paidResult?.total ?? 0),
      lastActivityAt,
      pendingTicketCount,
      refundCount,
    };
  }

  async getGlobalActivity(customerId: string): Promise<CustomerActivityRow> {
    const ticketCount = await this.ticketRepo.count({ where: { customerId } });
    const bookingCount = await this.bookingRepo.count({
      where: { customerId },
    });
    const pendingTicketCount = await this.ticketRepo.count({
      where: { customerId, status: TicketStatus.PENDING },
    });

    const paidResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne<{ total: string }>();

    const refundCount = await this.countRefundsForCustomer(
      undefined,
      customerId,
    );

    const lastTicket = await this.ticketRepo.findOne({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return {
      customerId,
      ticketCount,
      bookingCount,
      totalPaid: Number(paidResult?.total ?? 0),
      lastActivityAt: lastTicket?.createdAt ?? null,
      pendingTicketCount,
      refundCount,
    };
  }

  findTickets(companyId: number | undefined, customerId: string) {
    return this.ticketRepo.find({
      where: {
        customerId,
        ...(companyId !== undefined && { companyId }),
      },
      order: { id: 'DESC' },
    });
  }

  findBookings(companyId: number | undefined, customerId: string) {
    return this.bookingRepo.find({
      where: {
        customerId,
        ...(companyId !== undefined && { companyId }),
      },
      order: { id: 'DESC' },
    });
  }

  findPayments(companyId: number | undefined, customerId: string) {
    return this.paymentRepo.find({
      where: {
        customerId,
        ...(companyId !== undefined && { companyId }),
      },
      order: { id: 'DESC' },
    });
  }

  private async countRefundsForCustomer(
    companyId: number | undefined,
    customerId: string,
  ) {
    const tickets = await this.ticketRepo.find({
      where: {
        customerId,
        ...(companyId !== undefined && { companyId }),
      },
      select: ['id'],
    });
    if (tickets.length === 0) {
      return 0;
    }
    return this.refundRepo.count({
      where: { ticketId: In(tickets.map((t) => t.id)) },
    });
  }
}
