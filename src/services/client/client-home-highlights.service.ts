import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbCompany } from '../../entities/company/company.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbMasterData } from '../../entities/master-data.entity';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { EntityStatus } from '../../assets/constants/company.constants';
import { CLIENT_TRIP_OPERATOR_COLORS } from '../../assets/config/client-trip-search.config';
import {
  ClientHomeHighlightOperatorItemDto,
  ClientHomeHighlightTripItemDto,
  ClientHomeHighlightTripOperatorDto,
  ClientHomeHighlightTripRoutePointDto,
  ClientHomeHighlightsQueryDto,
  ClientHomeHighlightsResponseDto,
  ClientHomeHighlightType,
  HIGHLIGHT_TYPE_OPERATOR,
  HIGHLIGHT_TYPE_TRIP,
} from '../../dtos/client/home-highlights.dto';

const MASTER_DATA_TYPE_OPERATOR = 'OPERATOR';
const DEFAULT_HIGHLIGHT_LIMIT = 10;

interface OperatorMasterMeta {
  rating: number;
  reviewCount: string;
  logoColor?: string;
}

interface TicketAggregateRow {
  groupKey: number;
  totalTickets: number;
  totalSeats: number;
}

@Injectable()
export class ClientHomeHighlightsService {
  private operatorMetaCache: Map<string, OperatorMasterMeta> | null = null;

  constructor(
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
    @InjectRepository(TbMasterData)
    private readonly masterDataRepo: Repository<TbMasterData>,
  ) {}

  async getHighlights(
    query: ClientHomeHighlightsQueryDto,
  ): Promise<ClientHomeHighlightsResponseDto> {
    await this.loadOperatorMeta();

    const type: ClientHomeHighlightType = query.type;
    const limit = query.limit ?? DEFAULT_HIGHLIGHT_LIMIT;

    if (type === HIGHLIGHT_TYPE_OPERATOR) {
      const operators = await this.getTopOperators(limit);
      return {
        type,
        limit,
        operators,
        trips: [],
      };
    }

    const trips = await this.getTopTrips(limit);
    return {
      type,
      limit,
      operators: [],
      trips,
    };
  }

  private async getTopOperators(
    limit: number,
  ): Promise<ClientHomeHighlightOperatorItemDto[]> {
    const aggregates = await this.aggregateTicketsByCompany(limit);
    if (aggregates.length === 0) {
      return [];
    }

    const companyIds = aggregates.map((row) => row.groupKey);
    const companies = await this.companyRepo.find({
      where: { id: In(companyIds) },
    });
    const activeTripCounts = await this.countActiveTripsByCompany(companyIds);

    const companyMap = new Map(companies.map((c) => [c.id, c]));

    return aggregates
      .map((row) => {
        const company = companyMap.get(row.groupKey);
        if (!company) return null;
        const meta = this.resolveOperatorMeta(company);
        return {
          id: company.id,
          code: company.code,
          name: company.companyName,
          shortName: this.toShortName(company.code),
          logoColor:
            meta.logoColor ?? this.pickLogoColor(company.id, company.code),
          rating: meta.rating,
          reviewCount: meta.reviewCount,
          totalTickets: row.totalTickets,
          activeTrips: activeTripCounts.get(company.id) ?? 0,
        } satisfies ClientHomeHighlightOperatorItemDto;
      })
      .filter(
        (item): item is ClientHomeHighlightOperatorItemDto => item !== null,
      );
  }

  private async getTopTrips(
    limit: number,
  ): Promise<ClientHomeHighlightTripItemDto[]> {
    const aggregates = await this.aggregateTicketsByTrip(limit);
    if (aggregates.length === 0) {
      return [];
    }

    const tripIds = aggregates.map((row) => row.groupKey);
    const trips = await this.tripRepo.find({ where: { id: In(tripIds) } });
    if (trips.length === 0) {
      return [];
    }

    const tripMap = new Map(trips.map((t) => [t.id, t]));

    const [roads, vehicles, companies] = await Promise.all([
      this.roadRepo.find({
        where: { id: In(trips.map((t) => t.roadId)) },
      }),
      this.vehicleRepo.find({
        where: { id: In(trips.map((t) => t.vehicleId)) },
      }),
      this.companyRepo.find({
        where: { id: In(trips.map((t) => t.companyId)) },
      }),
    ]);

    const roadMap = new Map(roads.map((r) => [r.id, r]));
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    const validAggregates = aggregates.filter((row) => {
      const trip = tripMap.get(row.groupKey);
      if (!trip) return false;
      if (trip.status !== EntityStatus.ACTIVE) return false;
      const road = roadMap.get(trip.roadId);
      if (!road || road.status !== EntityStatus.ACTIVE) return false;
      const company = companyMap.get(trip.companyId);
      if (!company || company.status !== EntityStatus.ACTIVE) return false;
      return true;
    });

    return validAggregates.map((row) => {
      const trip = tripMap.get(row.groupKey)!;
      const road = roadMap.get(trip.roadId)!;
      const company = companyMap.get(trip.companyId)!;
      const vehicle = vehicleMap.get(trip.vehicleId) ?? null;
      const operatorMeta = this.resolveOperatorMeta(company);

      const totalSeat = vehicle?.seatCount ?? 0;
      const seatsLeft = Math.max(0, totalSeat - (trip.bookedSeats ?? 0));
      const price = Number(trip.seatPrice);

      return {
        id: trip.id,
        code: trip.code,
        name: trip.name,
        operator: this.toTripOperatorDto(company, operatorMeta),
        departure: this.toRoutePoint(
          trip.departure,
          road.startPoint,
          road.pickUpPoint,
        ),
        arrival: this.toRoutePoint(
          trip.arrival,
          road.endPoint,
          road.dropOffPoint,
        ),
        duration: road.standardDuration
          ? `~${road.standardDuration}`
          : this.estimateDuration(trip.departure, trip.arrival),
        vehicleType: this.buildVehicleTypeLabel(vehicle, trip),
        price,
        seatsLeft,
        totalTickets: row.totalTickets,
      } satisfies ClientHomeHighlightTripItemDto;
    });
  }

  private async aggregateTicketsByCompany(
    limit: number,
  ): Promise<TicketAggregateRow[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.companyId', 'groupKey')
      .addSelect('COUNT(*)', 'totalTickets')
      .addSelect('COALESCE(SUM(ticket.totalSeat), 0)', 'totalSeats')
      .where('ticket.status = :status', { status: TicketStatus.PAID })
      .andWhere('ticket.companyId IS NOT NULL')
      .groupBy('ticket.companyId')
      .orderBy('totalTickets', 'DESC')
      .addOrderBy('totalSeats', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<{
      groupKey: number;
      totalTickets: string | number;
      totalSeats: string | number;
    }>();

    return rows.map((row) => ({
      groupKey: Number(row.groupKey),
      totalTickets: Number(row.totalTickets),
      totalSeats: Number(row.totalSeats),
    }));
  }

  private async aggregateTicketsByTrip(
    limit: number,
  ): Promise<TicketAggregateRow[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.tripId', 'groupKey')
      .addSelect('COUNT(*)', 'totalTickets')
      .addSelect('COALESCE(SUM(ticket.totalSeat), 0)', 'totalSeats')
      .where('ticket.status = :status', { status: TicketStatus.PAID })
      .andWhere('ticket.tripId IS NOT NULL')
      .groupBy('ticket.tripId')
      .orderBy('totalTickets', 'DESC')
      .addOrderBy('totalSeats', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany<{
      groupKey: number;
      totalTickets: string | number;
      totalSeats: string | number;
    }>();

    return rows
      .map((row) => ({
        groupKey: Number(row.groupKey),
        totalTickets: Number(row.totalTickets),
        totalSeats: Number(row.totalSeats),
      }))
      .filter((row) => Number.isFinite(row.groupKey) && row.groupKey > 0);
  }

  private async countActiveTripsByCompany(
    companyIds: number[],
  ): Promise<Map<number, number>> {
    const result = new Map<number, number>();
    if (companyIds.length === 0) {
      return result;
    }

    const rows = await this.tripRepo
      .createQueryBuilder('trip')
      .select('trip.companyId', 'companyId')
      .addSelect('COUNT(*)', 'total')
      .where('trip.companyId IN (:...companyIds)', { companyIds })
      .andWhere('trip.status = :status', { status: EntityStatus.ACTIVE })
      .groupBy('trip.companyId')
      .getRawMany<{ companyId: number; total: string | number }>();

    for (const row of rows) {
      result.set(Number(row.companyId), Number(row.total));
    }
    return result;
  }

  private resolveOperatorMeta(company: TbCompany): OperatorMasterMeta {
    const cache = this.getOperatorMetaCache();
    const normalizedName = company.companyName.trim().toLowerCase();

    if (cache.size > 0) {
      const match = Array.from(cache.entries()).find(
        ([name]) =>
          normalizedName.includes(name) || name.includes(normalizedName),
      );
      if (match) {
        return match[1];
      }
    }

    const fallbackRating = 4.5 + ((company.id * 7) % 5) * 0.1;
    return {
      rating: Math.round(fallbackRating * 10) / 10,
      reviewCount: this.formatReviewCount(500 + company.id * 137),
    };
  }

  private getOperatorMetaCache(): Map<string, OperatorMasterMeta> {
    if (this.operatorMetaCache) {
      return this.operatorMetaCache;
    }
    this.operatorMetaCache = new Map();
    return this.operatorMetaCache;
  }

  private async ensureOperatorMetaLoaded(): Promise<void> {
    if (this.operatorMetaCache && this.operatorMetaCache.size > 0) {
      return;
    }

    const cache: Map<string, OperatorMasterMeta> = new Map();
    try {
      const rows = await this.masterDataRepo.find({
        where: { type: MASTER_DATA_TYPE_OPERATOR },
      });
      for (const row of rows) {
        const parsed = this.parseOperatorRule(row.rule);
        if (!parsed) continue;
        cache.set(row.name.trim().toLowerCase(), parsed);
      }
    } catch {
      // master-data table may be unavailable; fall back to derived rating
    }
    this.operatorMetaCache = cache;
  }

  private async loadOperatorMeta(): Promise<void> {
    await this.ensureOperatorMetaLoaded();
  }

  private parseOperatorRule(rule?: string | null): OperatorMasterMeta | null {
    if (!rule?.trim()) return null;
    try {
      const data = JSON.parse(rule) as {
        rating?: number;
        reviews?: number;
        logo?: string;
      };
      if (typeof data.rating !== 'number') return null;
      return {
        rating: data.rating,
        reviewCount: this.formatReviewCount(data.reviews ?? 0),
      };
    } catch {
      return null;
    }
  }

  private toTripOperatorDto(
    company: TbCompany,
    meta: OperatorMasterMeta,
  ): ClientHomeHighlightTripOperatorDto {
    return {
      id: company.id,
      code: company.code,
      name: company.companyName,
      shortName: this.toShortName(company.code),
      logoColor: meta.logoColor ?? this.pickLogoColor(company.id, company.code),
      rating: meta.rating,
      reviewCount: meta.reviewCount,
    };
  }

  private toRoutePoint(
    time: string,
    city: string,
    station: string,
  ): ClientHomeHighlightTripRoutePointDto {
    return {
      time: time || '',
      city: this.extractCity(city),
      station: station?.trim() || '',
    };
  }

  private buildVehicleTypeLabel(
    vehicle: TbVehicle | null,
    trip: TbTrip,
  ): string {
    if (!vehicle) {
      return trip.name || '—';
    }
    const base = vehicle.type || vehicle.name || 'Xe khách';
    if (vehicle.seatCount > 0) {
      return `${base} ${vehicle.seatCount} chỗ`;
    }
    return base;
  }

  private toShortName(code: string): string {
    const trimmed = (code ?? '').trim();
    if (!trimmed) return 'OP';
    return trimmed.slice(0, 2).toUpperCase();
  }

  private pickLogoColor(companyId: number, companyCode: string): string {
    const palette = CLIENT_TRIP_OPERATOR_COLORS;
    const seed = companyCode
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), companyId);
    return palette[seed % palette.length];
  }

  private extractCity(point: string): string {
    const trimmed = point?.trim() ?? '';
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    if (lower.includes('hà nội')) return 'Hà Nội';
    if (lower.includes('hồ chí minh') || lower.includes('tp.')) {
      return 'TP. Hồ Chí Minh';
    }
    if (lower.includes('đà nẵng')) return 'Đà Nẵng';
    return trimmed;
  }

  private estimateDuration(departure?: string, arrival?: string): string {
    const dep = this.parseDepartureHour(departure);
    const arr = this.parseDepartureHour(arrival);
    if (dep == null || arr == null) return '';
    let diff = arr - dep;
    if (diff <= 0) diff += 24;
    return `~${diff} tiếng`;
  }

  private parseDepartureHour(departure?: string): number | null {
    if (!departure?.trim()) return null;
    const match = departure.trim().match(/^(\d{1,2})/);
    if (!match) return null;
    const hour = Number(match[1]);
    return Number.isNaN(hour) ? null : hour;
  }

  private formatReviewCount(count: number): string {
    if (count >= 1000) {
      const rounded = Math.round((count / 1000) * 10) / 10;
      return `${rounded}k`;
    }
    return String(count);
  }
}
