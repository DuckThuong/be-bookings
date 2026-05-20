import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyStatRepository } from '../../repositories/sales/company-stat.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { RefundRepository } from '../../repositories/sales/refund.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { UpsertCompanyStatDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class CompanyStatService {
  constructor(
    private readonly companyStatRepository: CompanyStatRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly refundRepository: RefundRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async upsert(user: UserDecoratorDtoResponse, payload: UpsertCompanyStatDto) {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);

    const existing = await this.companyStatRepository.findByCompanyAndDate(
      payload.companyId,
      payload.statDate,
    );

    if (existing) {
      await this.companyStatRepository.update(existing.id, payload);
      return this.companyStatRepository.findById(existing.id);
    }

    return this.companyStatRepository.save(payload);
  }

  async findByCompany(user: UserDecoratorDtoResponse, companyId: number) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.companyStatRepository.findByCompany(companyId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    companyId: number,
    statDate: string,
  ) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    const stat = await this.companyStatRepository.findByCompanyAndDate(
      companyId,
      statDate,
    );
    if (!stat) {
      throw new NotFoundException(SalesErrorMessage.STAT_NOT_FOUND);
    }
    return stat;
  }

  async recompute(
    user: UserDecoratorDtoResponse,
    companyId: number,
    statDate: string,
  ) {
    await this.companyAccess.assertCompanyAccess(user, companyId);

    const tickets = await this.ticketRepository.findByFilter({ companyId });
    const paidTickets = tickets.filter((t) => t.status === TicketStatus.PAID);
    const cancelledTickets = tickets.filter(
      (t) => t.status === TicketStatus.CANCELLED,
    );

    const grossRevenue = paidTickets.reduce(
      (s, t) => s + Number(t.subtotal),
      0,
    );
    const discountTotal = paidTickets.reduce(
      (s, t) => s + Number(t.discountAmount),
      0,
    );
    const seatSold = paidTickets.reduce((s, t) => s + t.totalSeat, 0);
    const netRevenue = await this.paymentRepository.sumSuccessByCompany(
      companyId,
    );
    const refundTotal = await this.refundRepository.sumSuccessByCompany(
      companyId,
    );
    const ticketCount = paidTickets.length;
    const avgTicketValue =
      ticketCount > 0 ? netRevenue / ticketCount : 0;

    const payload: UpsertCompanyStatDto = {
      companyId,
      statDate,
      ticketCount,
      seatSold,
      grossRevenue,
      discountTotal,
      netRevenue,
      refundTotal,
      cancelledCount: cancelledTickets.length,
      occupancyRate: 0,
      avgTicketValue,
    };

    return this.upsert(user, payload);
  }
}
