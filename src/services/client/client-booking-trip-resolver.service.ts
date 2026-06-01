/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, NotFoundException } from '@nestjs/common';
import { TbCompany } from '../../entities/company/company.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TripRepository } from '../../repositories/trip.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { EntityStatus } from '../../assets/constants/company.constants';

export interface ResolvedTripContext {
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
      const trip = await this.tripRepository.findById(asNumber);
      if (!trip || trip.status !== EntityStatus.ACTIVE) {
        throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
      }
      return this.loadContext(trip, trimmed);
    }

    const trip = await this.tripRepository.findByCode(trimmed);
    if (!trip || trip.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
    }

    return this.loadContext(trip, trip.code);
  }

  buildTripDto(ctx: ResolvedTripContext) {
    const { trip, road, company } = ctx;
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
      companyId: trip.companyId,
      tripDbId: trip.id,
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
    trip: TbTrip,
    tripIdFe: string,
  ): Promise<ResolvedTripContext> {
    const [road, company, vehicle] = await Promise.all([
      this.roadRepo.findOne({ where: { id: trip.roadId } }),
      this.companyRepo.findOne({ where: { id: trip.companyId } }),
      this.vehicleRepo.findOne({ where: { id: trip.vehicleId } }),
    ]);

    if (!road || !company || !vehicle) {
      throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
    }

    return {
      trip,
      road,
      company,
      vehicle,
      tripIdFe: String(trip.id || tripIdFe),
      unitPrice: Number(trip.seatPrice),
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
