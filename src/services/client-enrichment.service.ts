import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { ClientCatalogRepository } from '../repositories/client-catalog.repository';

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
    @InjectRepository(TbCompanyTrip)
    private readonly companyTripRepo: Repository<TbCompanyTrip>,
    @InjectRepository(TbVerhical)
    private readonly vehicleRepo: Repository<TbVerhical>,
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
    private readonly catalogRepository: ClientCatalogRepository,
  ) {}

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

  async enrichCompanies(companies: TbCompany[]) {
    return Promise.all(
      companies.map(async (company) => {
        const [roadCount, activeTripCount] = await Promise.all([
          this.catalogRepository.countRoadsByCompany(company.id),
          this.catalogRepository.countCompanyTripsByCompany(company.id),
        ]);
        return {
          ...company,
          roadCount,
          activeCompanyTripCount: activeTripCount,
        };
      }),
    );
  }

  async enrichCompanyDetail(company: TbCompany) {
    const roads = await this.catalogRepository.findRoadsByCompany(company.id);
    const [roadCount, activeTripCount] = await Promise.all([
      this.catalogRepository.countRoadsByCompany(company.id),
      this.catalogRepository.countCompanyTripsByCompany(company.id),
    ]);
    const roadDetails = await this.enrichRoads(roads);
    return {
      ...company,
      roadCount,
      activeCompanyTripCount: activeTripCount,
      roads: roadDetails,
    };
  }

  async enrichRoads(roads: TbRoad[]) {
    if (roads.length === 0) {
      return [];
    }
    const companyMap = await this.loadCompanies(
      roads.map((r) => r.companyId),
    );
    return roads.map((road) => ({
      ...road,
      company: companyMap.get(road.companyId) ?? null,
    }));
  }

  async enrichRoadDetail(road: TbRoad) {
    const company = await this.companyRepo.findOne({
      where: { id: road.companyId },
    });
    const trips = await this.catalogRepository.findTripsByRoadId(road.id);
    const tripDetails = await this.enrichTrips(trips);
    return {
      ...road,
      company,
      trips: tripDetails,
    };
  }

  async enrichTrips(trips: TbTrip[]) {
    if (trips.length === 0) {
      return [];
    }
    const roadMap = await this.loadRoads(trips.map((t) => t.roadId));
    const companyIds = [...roadMap.values()].map((r) => r.companyId);
    const companyMap = await this.loadCompanies(companyIds);
    return trips.map((trip) => {
      const road = roadMap.get(trip.roadId) ?? null;
      const company = road ? (companyMap.get(road.companyId) ?? null) : null;
      return { ...trip, road, company };
    });
  }

  async enrichTripDetail(trip: TbTrip) {
    const road = await this.roadRepo.findOne({ where: { id: trip.roadId } });
    const company = road
      ? await this.companyRepo.findOne({ where: { id: road.companyId } })
      : null;
    const companyTrips = await this.companyTripRepo.find({
      where: { tripId: trip.id, status: 'ACTIVE' },
      order: { id: 'DESC' },
    });
    const schedules = await this.enrichCompanyTrips(companyTrips);
    return {
      ...trip,
      road,
      company,
      companyTrips: schedules,
    };
  }

  async enrichCompanyTrips(companyTrips: TbCompanyTrip[]) {
    if (companyTrips.length === 0) {
      return [];
    }
    const [companyMap, tripMap, vehicleMap, driverMap] = await Promise.all([
      this.loadCompanies(companyTrips.map((c) => c.companyId)),
      this.loadTrips(companyTrips.map((c) => c.tripId)),
      this.loadVehicles(companyTrips.map((c) => c.verhicalId)),
      this.loadDrivers(companyTrips.map((c) => c.driverId)),
    ]);
    const roadIds = [...tripMap.values()].map((t) => t.roadId);
    const roadMap = await this.loadRoads(roadIds);

    return Promise.all(
      companyTrips.map(async (ct) => {
        const trip = tripMap.get(ct.tripId) ?? null;
        const road = trip ? (roadMap.get(trip.roadId) ?? null) : null;
        const availableSeats = ct.totalSeat - ct.totalSeatBooked;
        return {
          ...ct,
          availableSeats,
          company: companyMap.get(ct.companyId) ?? null,
          trip,
          road,
          vehicle: vehicleMap.get(ct.verhicalId) ?? null,
          driver: driverMap.get(ct.driverId) ?? null,
        };
      }),
    );
  }

  async enrichCompanyTripDetail(companyTrip: TbCompanyTrip) {
    const occupiedSeatIds =
      await this.catalogRepository.getOccupiedSeatIds(companyTrip.id);
    const seats = await this.seatRepo.find({
      where: { verhicalId: companyTrip.verhicalId },
      order: { id: 'ASC' },
    });
    const [company, trip, vehicle, driver] = await Promise.all([
      this.companyRepo.findOne({ where: { id: companyTrip.companyId } }),
      this.tripRepo.findOne({ where: { id: companyTrip.tripId } }),
      this.vehicleRepo.findOne({ where: { id: companyTrip.verhicalId } }),
      this.driverRepo.findOne({ where: { id: companyTrip.driverId } }),
    ]);
    const road = trip
      ? await this.roadRepo.findOne({ where: { id: trip.roadId } })
      : null;

    const seatDetails = seats.map((seat) => ({
      ...seat,
      isOccupied: occupiedSeatIds.includes(seat.id),
    }));

    return {
      ...companyTrip,
      availableSeats: companyTrip.totalSeat - companyTrip.totalSeatBooked,
      occupiedSeatIds,
      company,
      trip,
      road,
      vehicle,
      driver,
      seats: seatDetails,
    };
  }

  async enrichTickets(tickets: TbTicket[]) {
    if (tickets.length === 0) {
      return [];
    }
    const companyTripIds = [...new Set(tickets.map((t) => t.companyTripId))];
    const companyTrips = await this.companyTripRepo.find({
      where: { id: In(companyTripIds) },
    });
    const scheduleMap = new Map(
      (await this.enrichCompanyTrips(companyTrips)).map((s) => [s.id, s]),
    );
    return tickets.map((ticket) => ({
      ...ticket,
      schedule: scheduleMap.get(ticket.companyTripId) ?? null,
    }));
  }

  async enrichTicketDetail(ticket: TbTicket) {
    const schedule = await this.companyTripRepo.findOne({
      where: { id: ticket.companyTripId },
    });
    const scheduleDetail = schedule
      ? await this.enrichCompanyTripDetail(schedule)
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
    const tickets = await this.ticketRepo.find({ where: { id: In(ticketIds) } });
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
    const companyTripIds = [...new Set(bookings.map((b) => b.companyTripId))];
    const companyTrips = await this.companyTripRepo.find({
      where: { id: In(companyTripIds) },
    });
    const scheduleMap = new Map(
      (await this.enrichCompanyTrips(companyTrips)).map((s) => [s.id, s]),
    );
    return bookings.map((booking) => ({
      ...booking,
      schedule: scheduleMap.get(booking.companyTripId) ?? null,
    }));
  }

  async enrichBookingDetail(booking: TbBooking) {
    const schedule = await this.companyTripRepo.findOne({
      where: { id: booking.companyTripId },
    });
    const scheduleDetail = schedule
      ? await this.enrichCompanyTripDetail(schedule)
      : null;
    const seatIds = booking.seatIds ?? [];
    const seats =
      seatIds.length > 0
        ? await this.seatRepo.find({ where: { id: In(seatIds) } })
        : [];
    let ticket: TbTicket | null = null;
    if (booking.ticketId) {
      ticket = await this.ticketRepo.findOne({ where: { id: booking.ticketId } });
    }
    return {
      ...booking,
      seats,
      schedule: scheduleDetail,
      ticket,
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
      return new Map<number, TbVerhical>();
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
