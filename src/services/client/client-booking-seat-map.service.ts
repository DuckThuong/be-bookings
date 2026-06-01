/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable } from '@nestjs/common';
import { EntityStatus } from '../../assets/constants/company.constants';
import { TbSeat } from '../../entities/seat.entity';
import { SeatRepository } from '../../repositories/seat.repository';
import { ClientEnrichmentService } from '../client-enrichment.service';
import {
  ClientBookingTripResolverService,
  ResolvedTripContext,
} from './client-booking-trip-resolver.service';

const SEATED_SEATS_PER_ROW = 4;
const SLEEPER_SEATS_PER_ROW = 2;
const AISLE_INDEX = 2;

export type FeSeatStatus = 'available' | 'booked' | 'vip';

@Injectable()
export class ClientBookingSeatMapService {
  constructor(
    private readonly enrichment: ClientEnrichmentService,
    private readonly seatRepository: SeatRepository,
    private readonly tripResolver: ClientBookingTripResolverService,
  ) {}

  async buildSeatMap(ctx: ResolvedTripContext, floor: number) {
    const vehicleType = this.tripResolver.inferVehicleType(
      ctx.vehicle.seatCount,
      ctx.vehicle.type,
    );
    const normalizedFloor = this.normalizeFloor(vehicleType, floor);
    const occupiedIds = await this.enrichment.getOccupiedSeatIds(ctx.trip.id);
    const occupiedSet = new Set(occupiedIds);
    const allSeats = await this.seatRepository.findByVehicle(
      ctx.trip.vehicleId,
    );
    const activeSeats = this.limitSeatsToVehicleSeatCount(
      allSeats.filter((s) => s.status === EntityStatus.ACTIVE),
      ctx.vehicle.seatCount,
    );
    const floorSeats = this.filterByFloor(
      activeSeats,
      vehicleType,
      normalizedFloor,
    );

    const rows = this.buildRows(floorSeats, occupiedSet, vehicleType);

    return {
      tripId: ctx.tripIdFe,
      vehicleType,
      floor: normalizedFloor,
      rows,
      seatCodeToId: this.mapCodesToIds(floorSeats),
      seatIdToDisplayId: this.mapIdsToDisplay(floorSeats),
    };
  }

  resolveSeatIds(
    seatCodes: string[],
    seatCodeToId: Map<string, number>,
  ): number[] {
    const ids: number[] = [];
    for (const code of seatCodes) {
      const key = code.trim();
      const id = seatCodeToId.get(key) ?? seatCodeToId.get(key.toUpperCase());
      if (id === undefined) {
        throw new Error(`SEAT_NOT_FOUND:${key}`);
      }
      ids.push(id);
    }
    return ids;
  }

  formatDisplaySeatId(seat: TbSeat): string {
    const prefix = (seat.type ?? 'S').trim().charAt(0).toUpperCase() || 'S';
    return `${prefix}${this.getOrdinal(seat)}`;
  }

  private mapIdsToDisplay(seats: TbSeat[]): Map<number, string> {
    const map = new Map<number, string>();
    for (const seat of seats) {
      map.set(seat.id, this.formatDisplaySeatId(seat));
    }
    return map;
  }

  private mapCodesToIds(seats: TbSeat[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const seat of seats) {
      const displayId = this.formatDisplaySeatId(seat);
      map.set(displayId, seat.id);
      map.set(displayId.toUpperCase(), seat.id);

      if (seat.code) {
        map.set(seat.code, seat.id);
        map.set(seat.code.toUpperCase(), seat.id);
      }
      if (seat.name) {
        map.set(seat.name, seat.id);
        map.set(seat.name.toUpperCase(), seat.id);
        const compactName = seat.name.replace(/-/g, '');
        map.set(compactName, seat.id);
        map.set(compactName.toUpperCase(), seat.id);
      }
    }
    return map;
  }

  private limitSeatsToVehicleSeatCount(
    seats: TbSeat[],
    seatCount: number,
  ): TbSeat[] {
    const capacity = Math.max(0, Math.floor(Number(seatCount) || 0));
    const sorted = [...seats].sort(
      (a, b) => this.getOrdinal(a) - this.getOrdinal(b),
    );
    return capacity > 0 ? sorted.slice(0, capacity) : [];
  }

  private normalizeFloor(vehicleType: string, floor: number): number {
    const requested = Math.max(1, Math.floor(Number(floor) || 1));
    const maxFloor = vehicleType === '36' ? 2 : 1;
    return Math.min(requested, maxFloor);
  }

  private filterByFloor(
    seats: TbSeat[],
    vehicleType: string,
    floor: number,
  ): TbSeat[] {
    const sorted = [...seats].sort(
      (a, b) => this.getOrdinal(a) - this.getOrdinal(b),
    );
    if (vehicleType !== '36' || floor === 1) {
      if (vehicleType === '36' && floor === 1) {
        const half = Math.ceil(sorted.length / 2);
        return sorted.slice(0, half);
      }
      return sorted;
    }
    const half = Math.ceil(sorted.length / 2);
    return sorted.slice(half);
  }

  private buildRows(
    seats: TbSeat[],
    occupiedSet: Set<number>,
    vehicleType: string,
  ) {
    const sorted = [...seats].sort(
      (a, b) => this.getOrdinal(a) - this.getOrdinal(b),
    );
    const seatsPerRow =
      vehicleType === '36' ? SLEEPER_SEATS_PER_ROW : SEATED_SEATS_PER_ROW;
    const rows: {
      row: number;
      full?: boolean;
      seats: Array<{
        id: string;
        label: string;
        status: FeSeatStatus;
      } | null>;
    }[] = [];

    let rowNum = 1;
    for (let i = 0; i < sorted.length; i += seatsPerRow) {
      const chunk = sorted.slice(i, i + seatsPerRow);
      const rowSeats: Array<{
        id: string;
        label: string;
        status: FeSeatStatus;
      } | null> = [];

      for (let col = 0; col < seatsPerRow; col++) {
        const hasAislePlaceholder =
          seatsPerRow === SEATED_SEATS_PER_ROW &&
          chunk.length < SEATED_SEATS_PER_ROW;
        if (col === AISLE_INDEX && hasAislePlaceholder) {
          rowSeats.push(null);
          continue;
        }
        const seatIndex =
          hasAislePlaceholder && col > AISLE_INDEX ? col - 1 : col;
        const seat = chunk[seatIndex];
        if (!seat) {
          rowSeats.push(null);
          continue;
        }
        const displayId = this.formatDisplaySeatId(seat);
        rowSeats.push({
          id: displayId,
          label: displayId,
          status: this.mapSeatStatus(seat, occupiedSet),
        });
      }

      rows.push({
        row: rowNum++,
        full: chunk.length >= seatsPerRow,
        seats: rowSeats,
      });
    }

    return rows;
  }

  private mapSeatStatus(seat: TbSeat, occupiedSet: Set<number>): FeSeatStatus {
    const type = (seat.type ?? '').toUpperCase();
    if (type.includes('VIP')) return 'vip';
    if (occupiedSet.has(seat.id)) return 'booked';
    return 'available';
  }

  private getOrdinal(seat: TbSeat): number {
    const fromIndex = Number(seat.index);
    if (!Number.isNaN(fromIndex) && fromIndex > 0) return fromIndex;
    const match = seat.name?.match(/-(\d+)$/) ?? seat.code?.match(/(\d+)$/);
    return match ? Number(match[1]) : seat.id;
  }
}
