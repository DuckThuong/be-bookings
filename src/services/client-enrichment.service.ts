import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVehicle } from '../entities/vehicle.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { BookingStatus } from '../assets/constants/sales.constants';
import { TicketStatus } from '../assets/constants/ticket.constants';
import {
  pickRepresentativePayment,
  resolveClientBookingStatus,
} from '../common/helpers/client-booking-status.helper';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ClientEnrichmentService {
  constructor(
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
    @InjectRepository(TbDriver)
    private readonly driverRepo: Repository<TbDriver>,
    @InjectRepository(TbSeat)
    private readonly seatRepo: Repository<TbSeat>,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
    @InjectRepository(TbRefund)
    private readonly refundRepo: Repository<TbRefund>,
  ) {}

  async getOccupiedSeatIds(tripId: number): Promise<number[]> {
    const tickets = await this.ticketRepo.find({
      where: {
        tripId,
        status: In([TicketStatus.PENDING, TicketStatus.PAID]),
      },
    });
    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.tripId = :tripId', { tripId })
      .andWhere('b.status = :status', { status: BookingStatus.HOLD })
      .andWhere('b.holdExpiresAt > :now', { now: new Date() })
      .getMany();

    const ids = new Set<number>();
    for (const t of tickets) {
      (t.seatIds ?? []).forEach((id) => ids.add(id));
    }
    for (const b of bookings) {
      (b.seatIds ?? []).forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }

  wrapPaginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async enrichTripsForClient(trips: TbTrip[]) {
    if (trips.length === 0) {
      return [];
    }
    const [companyMap, roadMap, vehicleMap, driverMap] = await Promise.all([
      this.loadCompanies(trips.map((t) => t.companyId)),
      this.loadRoads(trips.map((t) => t.roadId)),
      this.loadVehicles(trips.map((t) => t.vehicleId)),
      this.loadDrivers(trips.map((t) => t.driverId)),
    ]);

    return trips.map((trip) => {
      const vehicle = vehicleMap.get(trip.vehicleId) ?? null;
      const totalSeat = vehicle?.seatCount ?? 0;
      const company = companyMap.get(trip.companyId) ?? null;
      return {
        id: trip.id,
        pricePerSeat: Number(trip.seatPrice),
        totalSeat,
        totalSeatBooked: trip.bookedSeats ?? 0,
        availableSeats: Math.max(0, totalSeat - (trip.bookedSeats ?? 0)),
        company: company
          ? {
              ...company,
              operatorUserId: company.userLeadId
                ? Number(company.userLeadId)
                : undefined,
            }
          : null,
        trip,
        road: roadMap.get(trip.roadId) ?? null,
        vehicle,
        driver: driverMap.get(trip.driverId) ?? null,
      };
    });
  }

  async enrichTickets(tickets: TbTicket[]) {
    if (tickets.length === 0) {
      return [];
    }
    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
    const trips =
      tripIds.length > 0
        ? await this.tripRepo.find({ where: { id: In(tripIds) } })
        : [];
    const scheduleMap = new Map(
      (await this.enrichTripsForClient(trips)).map((s) => [s.id, s]),
    );
    return tickets.map((ticket) => ({
      ...ticket,
      schedule: scheduleMap.get(ticket.tripId) ?? null,
    }));
  }

  async enrichTicketDetail(ticket: TbTicket) {
    const schedule = await this.tripRepo.findOne({
      where: { id: ticket.tripId },
    });
    const scheduleDetail = schedule
      ? (await this.enrichTripsForClient([schedule]))[0]
      : null;
    const seatIds = ticket.seatIds ?? [];
    const seats =
      seatIds.length > 0
        ? await this.seatRepo.find({ where: { id: In(seatIds) } })
        : [];
    const payments = await this.paymentRepo.find({
      where: { ticketId: ticket.id },
      order: { id: 'DESC' },
    });
    const refunds = await this.refundRepo.find({
      where: { ticketId: ticket.id },
      order: { id: 'DESC' },
    });
    let booking: TbBooking | null = null;
    if (ticket.bookingId) {
      booking = await this.bookingRepo.findOne({
        where: { id: ticket.bookingId },
      });
    }
    return {
      ...ticket,
      seats,
      schedule: scheduleDetail,
      payments,
      refunds,
      booking,
    };
  }

  async enrichInvoices(payments: TbPayment[]) {
    if (payments.length === 0) {
      return [];
    }
    const ticketIds = [...new Set(payments.map((p) => p.ticketId))];
    const tickets = await this.ticketRepo.find({
      where: { id: In(ticketIds) },
    });
    const ticketMap = new Map(
      (await this.enrichTickets(tickets)).map((t) => [t.id, t]),
    );
    return payments.map((payment) => ({
      ...payment,
      ticket: ticketMap.get(payment.ticketId) ?? null,
    }));
  }

  async enrichInvoiceDetail(payment: TbPayment) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: payment.ticketId },
    });
    const ticketDetail = ticket ? await this.enrichTicketDetail(ticket) : null;
    const refunds = await this.refundRepo.find({
      where: { paymentId: payment.id },
      order: { id: 'DESC' },
    });
    const company = await this.companyRepo.findOne({
      where: { id: payment.companyId },
    });
    return {
      ...payment,
      company,
      ticket: ticketDetail,
      refunds,
    };
  }

  async enrichBookings(bookings: TbBooking[]) {
    if (bookings.length === 0) {
      return [];
    }
    const tripIds = [...new Set(bookings.map((b) => b.tripId))];
    const trips =
      tripIds.length > 0
        ? await this.tripRepo.find({ where: { id: In(tripIds) } })
        : [];
    const scheduleMap = new Map(
      (await this.enrichTripsForClient(trips)).map((s) => [s.id, s]),
    );

    const ticketIds = [
      ...new Set(
        bookings
          .map((b) => b.ticketId)
          .filter((id): id is number => id != null),
      ),
    ];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const payments =
      ticketIds.length > 0
        ? await this.paymentRepo.find({
            where: { ticketId: In(ticketIds) },
            order: { id: 'DESC' },
          })
        : [];
    return bookings.map((booking) => {
      const ticket = booking.ticketId
        ? (ticketMap.get(booking.ticketId) ?? null)
        : null;
      const paymentCandidates = ticket
        ? payments.filter((p) => p.ticketId === ticket.id)
        : [];
      const payment = pickRepresentativePayment(paymentCandidates);

      return {
        ...booking,
        status: resolveClientBookingStatus(booking, ticket, payment),
        schedule: scheduleMap.get(booking.tripId) ?? null,
        ticket,
        payment,
        operationStatus:
          scheduleMap.get(booking.tripId)?.trip?.operationStatus ?? null,
      };
    });
  }

  async enrichBookingDetail(booking: TbBooking) {
    const schedule = await this.tripRepo.findOne({
      where: { id: booking.tripId },
    });
    const scheduleDetail = schedule
      ? (await this.enrichTripsForClient([schedule]))[0]
      : null;
    const seatIds = booking.seatIds ?? [];
    const seats =
      seatIds.length > 0
        ? await this.seatRepo.find({ where: { id: In(seatIds) } })
        : [];
    let ticket: TbTicket | null = null;
    if (booking.ticketId) {
      ticket = await this.ticketRepo.findOne({
        where: { id: booking.ticketId },
      });
    }
    const payments = ticket
      ? await this.paymentRepo.find({
          where: { ticketId: ticket.id },
          order: { id: 'DESC' },
        })
      : [];
    const payment = pickRepresentativePayment(payments);

    return {
      ...booking,
      status: resolveClientBookingStatus(booking, ticket, payment),
      seats,
      schedule: scheduleDetail,
      ticket,
      payments,
      payment,
      operationStatus: schedule?.operationStatus ?? null,
    };
  }

  private async loadCompanies(ids: number[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map<number, TbCompany>();
    }
    const rows = await this.companyRepo.find({ where: { id: In(unique) } });
    return new Map(rows.map((r) => [r.id, r]));
  }

  private async loadRoads(ids: number[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map<number, TbRoad>();
    }
    const rows = await this.roadRepo.find({ where: { id: In(unique) } });
    return new Map(rows.map((r) => [r.id, r]));
  }

  private async loadTrips(ids: number[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map<number, TbTrip>();
    }
    const rows = await this.tripRepo.find({ where: { id: In(unique) } });
    return new Map(rows.map((r) => [r.id, r]));
  }

  private async loadVehicles(ids: number[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map<number, TbVehicle>();
    }
    const rows = await this.vehicleRepo.find({ where: { id: In(unique) } });
    return new Map(rows.map((r) => [r.id, r]));
  }

  private async loadDrivers(ids: number[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map<number, TbDriver>();
    }
    const rows = await this.driverRepo.find({ where: { id: In(unique) } });
    return new Map(rows.map((r) => [r.id, r]));
  }
}
