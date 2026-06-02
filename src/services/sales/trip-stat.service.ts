import { Injectable, NotFoundException } from '@nestjs/common';
import { TripStatRepository } from '../../repositories/sales/trip-stat.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { TripRepository } from '../../repositories/trip.repository';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { PaymentStatus } from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { UpsertTripStatDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class TripStatService {
  constructor(
    private readonly tripStatRepository: TripStatRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly tripRepository: TripRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async upsert(user: UserDecoratorDtoResponse, payload: UpsertTripStatDto) {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertTripBelongsToCompany(
      payload.companyId,
      payload.tripId,
    );

    const existing = await this.tripStatRepository.findByTripAndDate(
      payload.tripId,
      payload.statDate,
    );

    if (existing) {
      await this.tripStatRepository.update(existing.id, payload);
      return this.tripStatRepository.findById(existing.id);
    }

    return this.tripStatRepository.save(payload);
  }

  async findByCompany(user: UserDecoratorDtoResponse, companyId: number) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.tripStatRepository.findByCompany(companyId);
  }

  async findByTrip(user: UserDecoratorDtoResponse, tripId: number) {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException(SalesErrorMessage.STAT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, trip.companyId);
    return this.tripStatRepository.findByTrip(tripId);
  }

  async recompute(
    user: UserDecoratorDtoResponse,
    tripId: number,
    statDate: string,
  ) {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException(SalesErrorMessage.STAT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, trip.companyId);

    const tickets = await this.ticketRepository.findByFilter({ tripId });
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
      tripId,
      status: PaymentStatus.SUCCESS,
    });
    const netRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);

    return this.upsert(user, {
      tripId,
      companyId: trip.companyId,
      statDate,
      ticketCount: paidTickets.length,
      seatSold,
      grossRevenue,
      discountTotal,
      netRevenue,
      refundTotal: 0,
      cancelledCount: tickets.filter((t) => t.status === TicketStatus.CANCELLED)
        .length,
      occupancyRate: 0,
    });
  }
}
