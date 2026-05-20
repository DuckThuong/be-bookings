import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyTripStatRepository } from '../../repositories/sales/company-trip-stat.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { PaymentStatus } from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { UpsertCompanyTripStatDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class CompanyTripStatService {
  constructor(
    private readonly companyTripStatRepository: CompanyTripStatRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async upsert(
    user: UserDecoratorDtoResponse,
    payload: UpsertCompanyTripStatDto,
  ) {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertCompanyTripBelongsToCompany(
      payload.companyId,
      payload.companyTripId,
    );

    const existing =
      await this.companyTripStatRepository.findByTripAndDate(
        payload.companyTripId,
        payload.statDate,
      );

    if (existing) {
      await this.companyTripStatRepository.update(existing.id, payload);
      return this.companyTripStatRepository.findById(existing.id);
    }

    return this.companyTripStatRepository.save(payload);
  }

  async findByCompany(user: UserDecoratorDtoResponse, companyId: number) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.companyTripStatRepository.findByCompany(companyId);
  }

  async findByCompanyTrip(
    user: UserDecoratorDtoResponse,
    companyTripId: number,
  ) {
    const trip = await this.companyTripRepository.findById(companyTripId);
    if (!trip) {
      throw new NotFoundException(SalesErrorMessage.STAT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, trip.companyId);
    return this.companyTripStatRepository.findByCompanyTrip(companyTripId);
  }

  async recompute(
    user: UserDecoratorDtoResponse,
    companyTripId: number,
    statDate: string,
  ) {
    const companyTrip = await this.companyTripRepository.findById(
      companyTripId,
    );
    if (!companyTrip) {
      throw new NotFoundException(SalesErrorMessage.STAT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, companyTrip.companyId);

    const tickets = await this.ticketRepository.findByFilter({
      companyTripId,
    });
    const paidTickets = tickets.filter((t) => t.status === TicketStatus.PAID);

    const grossRevenue = paidTickets.reduce(
      (s, t) => s + Number(t.subtotal),
      0,
    );
    const discountTotal = paidTickets.reduce(
      (s, t) => s + Number(t.discountAmount),
      0,
    );
    const seatSold = paidTickets.reduce((s, t) => s + t.totalSeat, 0);

    const payments = await this.paymentRepository.findByFilter({
      companyTripId,
      status: PaymentStatus.SUCCESS,
    });
    const netRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);

    const occupancyRate =
      companyTrip.totalSeat > 0
        ? (seatSold / companyTrip.totalSeat) * 100
        : 0;

    return this.upsert(user, {
      companyTripId,
      companyId: companyTrip.companyId,
      statDate,
      ticketCount: paidTickets.length,
      seatSold,
      grossRevenue,
      discountTotal,
      netRevenue,
      refundTotal: 0,
      cancelledCount: tickets.filter((t) => t.status === TicketStatus.CANCELLED)
        .length,
      occupancyRate,
    });
  }
}
