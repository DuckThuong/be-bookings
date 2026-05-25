import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbCompany } from '../../entities/company/company.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { TripRepository } from '../../repositories/trip.repository';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { EntityStatus } from '../../assets/constants/company.constants';
import {
  CLIENT_BOOKING_CATALOG,
  CLIENT_BOOKING_META,
} from '../../assets/config/client-booking.config';

export interface ResolvedTripContext {
  companyTrip: TbCompanyTrip;
  trip: TbTrip;
  road: TbRoad;
  company: TbCompany;
  vehicle: TbVehicle;
  tripIdFe: string;
  unitPrice: number;
}

@Injectable()
export class ClientBookingTripResolverService {
  constructor(
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly tripRepository: TripRepository,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
  ) {}

  async resolve(tripId: string): Promise<ResolvedTripContext> {
    const trimmed = tripId.trim();
    const asNumber = Number(trimmed);

    if (!Number.isNaN(asNumber) && String(asNumber) === trimmed) {
      const companyTrip = await this.companyTripRepository.findById(asNumber);
      if (!companyTrip || companyTrip.status !== EntityStatus.ACTIVE) {
        throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
      }
      return this.loadContext(companyTrip, trimmed);
    }

    const trip = await this.tripRepository.findByCode(trimmed);
    if (!trip || trip.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
    }

    const companyTrips = await this.companyTripRepository.findActiveByTripId(
      trip.id,
    );
    if (companyTrips.length === 0) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }

    return this.loadContext(companyTrips[0], trip.code);
  }

  buildTripDto(ctx: ResolvedTripContext) {
    const { trip, road, company, companyTrip } = ctx;
    return {
      tripId: ctx.tripIdFe,
      from: road.startPoint,
      to: road.endPoint,
      operatorCode: company.code,
      operatorName: company.companyName,
      departTime: trip.departure || '',
      arriveTime: trip.arrival || '',
      arriveNote: this.buildArriveNote(trip.departure, trip.arrival),
      date: new Date().toISOString().slice(0, 10),
      durationLabel: road.standardDuration ? `~${road.standardDuration}` : '',
      unitPrice: ctx.unitPrice,
      companyTripId: companyTrip.id,
      companyId: companyTrip.companyId,
      tripDbId: trip.id,
    };
  }

  getCatalogSlice() {
    return {
      pickupPoints: CLIENT_BOOKING_CATALOG.pickupPoints,
      dropoffPoints: CLIENT_BOOKING_CATALOG.dropoffPoints,
      addonServices: CLIENT_BOOKING_CATALOG.addonServices,
      promoCodes: CLIENT_BOOKING_CATALOG.promoCodes,
      paymentMethods: CLIENT_BOOKING_CATALOG.paymentMethods,
      vehicles: CLIENT_BOOKING_CATALOG.vehicles,
    };
  }

  getMeta() {
    return {
      ...CLIENT_BOOKING_META,
      catalog: CLIENT_BOOKING_CATALOG,
    };
  }

  inferVehicleType(seatCount: number, vehicleTypeRaw?: string): string {
    const normalized = vehicleTypeRaw?.trim();
    if (normalized && ['16', '36', '45'].includes(normalized)) {
      return normalized;
    }
    if (seatCount <= 18) return '16';
    if (seatCount <= 40) return '36';
    return '45';
  }

  private async loadContext(
    companyTrip: TbCompanyTrip,
    tripIdFe: string,
  ): Promise<ResolvedTripContext> {
    const trip = await this.tripRepository.findById(companyTrip.tripId);
    if (!trip) {
      throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
    }

    const [road, company, vehicle] = await Promise.all([
      this.roadRepo.findOne({ where: { id: trip.roadId } }),
      this.companyRepo.findOne({ where: { id: companyTrip.companyId } }),
      this.vehicleRepo.findOne({ where: { id: companyTrip.vehicleId } }),
    ]);

    if (!road || !company) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }

    return {
      companyTrip,
      trip,
      road,
      company,
      vehicle: vehicle!,
      tripIdFe: trip.code || tripIdFe,
      unitPrice: Number(companyTrip.pricePerSeat),
    };
  }

  private buildArriveNote(
    departure?: string,
    arrival?: string,
  ): string | undefined {
    if (!departure || !arrival) return undefined;
    const depH = parseInt(departure.split(':')[0] ?? '0', 10);
    const arrH = parseInt(arrival.split(':')[0] ?? '0', 10);
    if (arrH < depH) return '(+1)';
    return undefined;
  }
}
