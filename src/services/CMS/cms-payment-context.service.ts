import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { BookingRepository } from '../../repositories/sales/booking.repository';

export type CmsPaymentContext = {
  ticketMap: Map<number, TbTicket>;
  bookingMap: Map<number, TbBooking>;
  companyTripMap: Map<number, TbCompanyTrip>;
  tripMap: Map<number, TbTrip>;
  roadMap: Map<number, TbRoad>;
  vehicleMap: Map<number, TbVehicle>;
};

@Injectable()
export class CmsPaymentContextService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbCompanyTrip)
    private readonly companyTripRepo: Repository<TbCompanyTrip>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
  ) {}

  async load(payments: TbPayment[]): Promise<CmsPaymentContext> {
    if (payments.length === 0) {
      return {
        ticketMap: new Map(),
        bookingMap: new Map(),
        companyTripMap: new Map(),
        tripMap: new Map(),
        roadMap: new Map(),
        vehicleMap: new Map(),
      };
    }

    const ticketIds = [...new Set(payments.map((p) => p.ticketId))];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const bookingIds = [
      ...new Set(
        tickets
          .map((t) => t.bookingId)
          .filter((id): id is number => id != null),
      ),
    ];
    const bookings =
      bookingIds.length > 0
        ? (
            await Promise.all(
              bookingIds.map((id) => this.bookingRepository.findById(id)),
            )
          ).filter((b): b is TbBooking => b != null)
        : [];
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));

    const companyTripIds = [...new Set(payments.map((p) => p.companyTripId))];
    const companyTrips =
      companyTripIds.length > 0
        ? await this.companyTripRepo.find({ where: { id: In(companyTripIds) } })
        : [];
    const companyTripMap = new Map(companyTrips.map((ct) => [ct.id, ct]));

    const tripIds = [...new Set(companyTrips.map((ct) => ct.tripId))];
    const trips =
      tripIds.length > 0
        ? await this.tripRepo.find({ where: { id: In(tripIds) } })
        : [];
    const tripMap = new Map(trips.map((t) => [t.id, t]));

    const roadIds = [...new Set(trips.map((t) => t.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((r) => [r.id, r]));

    const vehicleIds = [...new Set(companyTrips.map((ct) => ct.vehicleId))];
    const vehicles =
      vehicleIds.length > 0
        ? await this.vehicleRepo.find({ where: { id: In(vehicleIds) } })
        : [];
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    return {
      ticketMap,
      bookingMap,
      companyTripMap,
      tripMap,
      roadMap,
      vehicleMap,
    };
  }

  resolveRouteLabel(
    payment: TbPayment,
    context: CmsPaymentContext,
  ): string {
    const companyTrip = context.companyTripMap.get(payment.companyTripId);
    const trip = companyTrip
      ? context.tripMap.get(companyTrip.tripId)
      : null;
    const road = trip ? context.roadMap.get(trip.roadId) : null;
    if (road?.startPoint && road?.endPoint) {
      return `${road.startPoint} → ${road.endPoint}`;
    }
    return trip?.name ?? '—';
  }

  resolveVehicleCode(
    payment: TbPayment,
    context: CmsPaymentContext,
  ): string {
    const companyTrip = context.companyTripMap.get(payment.companyTripId);
    if (!companyTrip) return '—';
    return context.vehicleMap.get(companyTrip.vehicleId)?.code ?? '—';
  }
}
