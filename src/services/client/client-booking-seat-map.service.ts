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
import {
  buildVehicleLayout,
  layoutPresetToClientVehicleType,
  resolveVehicleLayoutConfig,
} from '../../common/seat-layout/seat-layout';

export type FeSeatStatus = 'available' | 'booked' | 'vip';
export type FeSeatCell =
  | {
      type: 'seat';
      id: string;
      label: string;
      status: FeSeatStatus;
    }
  | { type: 'aisle' }
  | { type: 'empty' };

@Injectable()
export class ClientBookingSeatMapService {
  constructor(
    private readonly enrichment: ClientEnrichmentService,
    private readonly seatRepository: SeatRepository,
    private readonly tripResolver: ClientBookingTripResolverService,
  ) {}

  async buildSeatMap(ctx: ResolvedTripContext, floor: number) {
    const layoutConfig = resolveVehicleLayoutConfig(ctx.vehicle.layoutConfig, {
      seatCount: ctx.vehicle.seatCount,
      vehicleType: ctx.vehicle.type,
    });
    const layout = buildVehicleLayout(layoutConfig);
    const vehicleType = layoutPresetToClientVehicleType(
      layoutConfig.preset,
      ctx.vehicle.seatCount,
      ctx.vehicle.type,
    );
    const normalizedFloor = this.normalizeFloor(layoutConfig.floorCount, floor);
    const occupiedIds = await this.enrichment.getOccupiedSeatIds(ctx.trip.id);
    const occupiedSet = new Set(occupiedIds);
    const allSeats = await this.seatRepository.findByVehicle(
      ctx.trip.vehicleId,
    );
    const activeSeats = this.sortSeatsByOrdinalAsc(
      allSeats.filter((s) => s.status === EntityStatus.ACTIVE),
    ).slice(0, layout.seatCount);
    const seatsByOrdinal = new Map(
      activeSeats.map((seat) => [this.getOrdinal(seat), seat]),
    );
    const floors = layout.floors.map((layoutFloor) => ({
      floor: layoutFloor.floor,
      label: layoutFloor.label,
      rows: layoutFloor.rows.map((row) => ({
        row: row.row,
        cells: row.cells.map((cell): FeSeatCell => {
          if (cell.type !== 'seat') {
            return { type: cell.type };
          }
          const seat = seatsByOrdinal.get(cell.ordinal);
          if (!seat) {
            return { type: 'empty' };
          }
          const displayId = this.formatDisplaySeatId(seat);
          return {
            type: 'seat',
            id: displayId,
            label: displayId,
            status: this.mapSeatStatus(seat, occupiedSet),
          };
        }),
      })),
    }));
    const selectedFloor =
      floors.find((item) => item.floor === normalizedFloor) ?? floors[0];

    return {
      tripId: ctx.tripIdFe,
      vehicleType,
      seatCount: layout.seatCount,
      floor: normalizedFloor,
      floors,
      rows: selectedFloor?.rows ?? [],
      seatCodeToId: this.mapCodesToIds(activeSeats),
      seatIdToDisplayId: this.mapIdsToDisplay(activeSeats),
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
    const name = seat.name?.trim();
    if (name && /^[A-Z]\d{2,}$/i.test(name)) {
      return name.toUpperCase();
    }
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

  private normalizeFloor(floorCount: number, floor: number): number {
    const requested = Math.max(1, Math.floor(Number(floor) || 1));
    const maxFloor = Math.max(1, floorCount);
    return Math.min(requested, maxFloor);
  }

  private sortSeatsByOrdinalAsc(seats: TbSeat[]): TbSeat[] {
    return [...seats].sort(
      (a, b) => this.getOrdinal(a) - this.getOrdinal(b),
    );
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
