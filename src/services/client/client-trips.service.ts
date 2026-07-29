import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CLIENT_TRIP_AMENITIES_BY_VEHICLE,
  CLIENT_TRIP_OPERATOR_COLORS,
  CLIENT_TRIP_SEAT_TYPE_MAP,
  CLIENT_TRIP_TIME_SLOTS,
  CLIENT_TRIP_VEHICLE_LABELS,
  ClientTripAmenity,
  ClientTripBadge,
  ClientTripFilterKey,
  ClientTripSeatType,
  ClientTripSortKey,
} from '../../assets/config/client-trip-search.config';
const MASTER_DATA_TYPE_OPERATOR = 'OPERATOR';
import { TbMasterData } from '../../entities/master-data.entity';
import { TbCompany } from '../../entities/company/company.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TripRepository } from '../../repositories/trip.repository';
import { ClientEnrichmentService } from '../client-enrichment.service';
import {
  ClientSearchTripsQueryDto,
  ClientSearchTripsResponseDto,
  ClientTripItemDto,
} from '../../dtos/client/trips.dto';
import { ClientBookingTripResolverService } from './client-booking-trip-resolver.service';

interface OperatorMeta {
  rating: number;
  reviewCount: string;
  logoColor?: string;
}

interface EnrichedTrip {
  id: number;
  pricePerSeat: number;
  totalSeat: number;
  totalSeatBooked: number;
  availableSeats: number;
  company: TbCompany | null;
  trip: TbTrip | null;
  road: TbRoad | null;
  vehicle: TbVehicle | null;
}

@Injectable()
export class ClientTripsService {
  private operatorMetaCache: Map<string, OperatorMeta> | null = null;

  constructor(
    private readonly tripRepository: TripRepository,
    private readonly enrichmentService: ClientEnrichmentService,
    private readonly tripResolver: ClientBookingTripResolverService,
    @InjectRepository(TbMasterData)
    private readonly masterDataRepo: Repository<TbMasterData>,
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
  ) {}

  async searchTrips(
    query: ClientSearchTripsQueryDto,
  ): Promise<ClientSearchTripsResponseDto> {
    await this.ensureOperatorMetaLoaded();

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortKey: ClientTripSortKey = query.sortKey ?? 'price';
    const passengers = query.passengers ?? 1;
    const seatType: ClientTripSeatType = query.seatType ?? 'all';
    const filters = this.normalizeFilters(query.filters);
    const date = query.date?.trim() || this.formatDate(new Date());
    const hhmm = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const sourceTrips = await this.tripRepository.searchActiveForClient({
      fromCity: query.fromCity,
      toCity: query.toCity,
      companyId: query.companyId,
      time: date === this.formatDate(new Date()) ? hhmm : undefined,
    });

    let companyName: string | undefined;
    if (query.companyId !== undefined) {
      const company = await this.companyRepo.findOne({
        where: { id: query.companyId },
      });
      companyName = company?.companyName;
    }

    const enriched = (await this.enrichmentService.enrichTripsForClient(
      sourceTrips,
    )) as EnrichedTrip[];

    const mapped = enriched
      .filter((row) => this.isBookable(row, passengers))
      .filter((row) => this.matchesSeatType(row, seatType))
      .filter((row) => this.matchesTimeFilters(row, filters))
      .map((row) =>
        this.toTripItem(row, {
          fromCity: query.fromCity,
          toCity: query.toCity,
        }),
      )
      .filter((row) => this.matchesAmenityFilters(row, filters));

    const sorted = this.sortTrips(mapped, sortKey);
    const resultCount = sorted.length;
    const start = (page - 1) * pageSize;
    const trips = sorted.slice(start, start + pageSize);

    return {
      search: {
        from: query.fromCity?.trim() || '',
        to: query.toCity?.trim() || '',
        date,
        passengers,
        seatType,
        companyId: query.companyId,
        companyName,
      },
      meta: {
        resultCount,
        page,
        pageSize,
        hasMore: start + pageSize < resultCount,
        sortKey,
        filters,
      },
      trips,
    };
  }

  private normalizeFilters(
    filters?: ClientTripFilterKey[],
  ): ClientTripFilterKey[] {
    if (!filters?.length) {
      return ['all'];
    }
    if (filters.includes('all')) {
      return ['all'];
    }
    return Array.from(new Set(filters));
  }

  private isBookable(row: EnrichedTrip, passengers: number): boolean {
    if (!row.trip || !row.road || !row.company || !row.vehicle) {
      return false;
    }
    return row.availableSeats >= passengers;
  }

  private matchesSeatType(
    row: EnrichedTrip,
    seatType: ClientTripSeatType,
  ): boolean {
    if (seatType === 'all' || !row.vehicle) {
      return true;
    }
    const vehicleTypeKey = this.tripResolver.inferVehicleType(
      row.vehicle.seatCount,
      row.vehicle.type,
    );
    return CLIENT_TRIP_SEAT_TYPE_MAP[seatType].includes(vehicleTypeKey);
  }

  private matchesTimeFilters(
    row: EnrichedTrip,
    filters: ClientTripFilterKey[],
  ): boolean {
    if (filters.includes('all')) {
      return true;
    }

    const timeFilters = filters.filter(
      (f): f is 'morning' | 'daytime' | 'night' =>
        f === 'morning' || f === 'daytime' || f === 'night',
    );

    if (timeFilters.length === 0) {
      return true;
    }

    const hour = this.parseDepartureHour(row.trip?.departure);
    if (hour == null) {
      return false;
    }

    return timeFilters.some((filter) =>
      this.isHourInSlot(hour, CLIENT_TRIP_TIME_SLOTS[filter]),
    );
  }

  private matchesAmenityFilters(
    trip: ClientTripItemDto,
    filters: ClientTripFilterKey[],
  ): boolean {
    if (filters.includes('all')) {
      return true;
    }

    const labels = trip.amenities.map((a) => a.label.toLowerCase()).join(' ');

    if (filters.includes('wifi') && !labels.includes('wifi')) {
      return false;
    }

    if (
      filters.includes('ac') &&
      !labels.includes('điều hoà') &&
      !labels.includes('dieu hoa')
    ) {
      return false;
    }

    return true;
  }

  private sortTrips(
    trips: ClientTripItemDto[],
    sortKey: ClientTripSortKey,
  ): ClientTripItemDto[] {
    const copy = [...trips];

    copy.sort((a, b) => {
      if (sortKey === 'price') {
        return a.price - b.price;
      }
      if (sortKey === 'rating') {
        return b.operator.rating - a.operator.rating;
      }
      if (sortKey === 'departure') {
        return a.departure.time.localeCompare(b.departure.time);
      }
      if (sortKey === 'duration') {
        return a.duration.localeCompare(b.duration);
      }
      return 0;
    });

    return copy;
  }

  private toTripItem(
    row: EnrichedTrip,
    ctx: { fromCity?: string; toCity?: string },
  ): ClientTripItemDto {
    const trip = row.trip!;
    const road = row.road!;
    const company = row.company!;
    const vehicle = row.vehicle!;
    const vehicleTypeKey = this.tripResolver.inferVehicleType(
      vehicle.seatCount,
      vehicle.type,
    );
    const operatorMeta = this.resolveOperatorMeta(company);
    const amenities = this.resolveAmenities(vehicleTypeKey);
    const seatsLeft = row.availableSeats;
    const price = Number(row.pricePerSeat);
    const rating = operatorMeta.rating;

    return {
      id: String(row.id),
      featured: true,
      operator: {
        code: company.code.slice(0, 2).toUpperCase(),
        logoColor:
          operatorMeta.logoColor ??
          this.pickLogoColor(company.id, company.code),
        name: company.companyName,
        vehicleType: this.buildVehicleTypeLabel(vehicle, vehicleTypeKey),
        rating,
        reviewCount: operatorMeta.reviewCount,
      },
      departure: {
        time: trip.departure || '',
        city: ctx.fromCity?.trim() || this.extractCity(road.startPoint),
        station: road.pickUpPoint,
      },
      arrival: {
        time: trip.arrival || '',
        city: ctx.toCity?.trim() || this.extractCity(road.endPoint),
        station: road.dropOffPoint,
      },
      duration: road.standardDuration
        ? `~${road.standardDuration}`
        : this.estimateDuration(trip.departure, trip.arrival),
      stopLabel: road.note?.trim() || 'Thẳng, không dừng',
      price,
      seatsLeft,
      badges: this.buildBadges(vehicleTypeKey, seatsLeft),
      amenities,
    };
  }

  private resolveOperatorMeta(company: TbCompany): OperatorMeta {
    const cache = this.getOperatorMetaCache();
    const normalizedName = company.companyName.trim().toLowerCase();

    const match = Array.from(cache.entries()).find(
      ([name]) =>
        normalizedName.includes(name) || name.includes(normalizedName),
    );
    if (match) {
      return match[1];
    }

    const fallbackRating = 4.5 + (company.id % 5) * 0.1;
    return {
      rating: Math.round(fallbackRating * 10) / 10,
      reviewCount: this.formatReviewCount(500 + company.id * 137),
    };
  }

  private getOperatorMetaCache(): Map<string, OperatorMeta> {
    if (this.operatorMetaCache) {
      return this.operatorMetaCache;
    }

    this.operatorMetaCache = new Map();
    return this.operatorMetaCache;
  }

  private async ensureOperatorMetaLoaded(): Promise<void> {
    if (this.operatorMetaCache) {
      return;
    }

    const rows = await this.masterDataRepo.find({
      where: { type: MASTER_DATA_TYPE_OPERATOR },
    });

    const cache = new Map<string, OperatorMeta>();
    for (const row of rows) {
      const parsed = this.parseOperatorRule(row.rule);
      if (!parsed) continue;
      cache.set(row.name.trim().toLowerCase(), parsed);
    }
    this.operatorMetaCache = cache;
  }

  private parseOperatorRule(rule?: string | null): OperatorMeta | null {
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

  private resolveAmenities(vehicleTypeKey: string): ClientTripAmenity[] {
    return (
      CLIENT_TRIP_AMENITIES_BY_VEHICLE[vehicleTypeKey] ??
      CLIENT_TRIP_AMENITIES_BY_VEHICLE['45']
    );
  }

  private buildVehicleTypeLabel(
    vehicle: TbVehicle,
    vehicleTypeKey: string,
  ): string {
    const base = CLIENT_TRIP_VEHICLE_LABELS[vehicleTypeKey] ?? vehicle.type;
    if (vehicle.seatCount > 0) {
      return `${base} ${vehicle.seatCount} chỗ`;
    }
    return vehicle.name?.trim() || base;
  }

  private buildBadges(
    vehicleTypeKey: string,
    seatsLeft: number,
  ): ClientTripBadge[] {
    const badges: ClientTripBadge[] = [];

    if (seatsLeft > 0) {
      badges.push({ type: 'green', label: '✓ Còn vé' });
    } else {
      badges.push({ type: 'red', label: 'Hết vé' });
    }

    if (vehicleTypeKey === '16') {
      badges.push({ type: 'blue', label: '⭐ Limousine' });
    } else if (vehicleTypeKey === '36') {
      badges.push({ type: 'amber', label: '🪑 Giường VIP' });
    } else {
      badges.push({ type: 'gray', label: '🛋 Ghế ngồi' });
    }

    if (seatsLeft > 0 && seatsLeft <= 4) {
      badges.push({ type: 'amber', label: '🔥 Sắp hết chỗ' });
    }

    return badges;
  }

  private pickLogoColor(companyId: number, companyCode: string): string {
    const palette = CLIENT_TRIP_OPERATOR_COLORS;
    const seed = companyCode
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), companyId);
    return palette[seed % palette.length];
  }

  private parseDepartureHour(departure?: string): number | null {
    if (!departure?.trim()) return null;
    const match = departure.trim().match(/^(\d{1,2})/);
    if (!match) return null;
    const hour = Number(match[1]);
    return Number.isNaN(hour) ? null : hour;
  }

  private isHourInSlot(
    hour: number,
    slot: { from: number; to: number },
  ): boolean {
    if (slot.from <= slot.to) {
      return hour >= slot.from && hour <= slot.to;
    }
    return hour >= slot.from || hour <= slot.to;
  }

  private extractCity(point: string): string {
    const trimmed = point.trim();
    if (!trimmed) return '';
    if (trimmed.toLowerCase().includes('hà nội')) return 'Hà Nội';
    if (
      trimmed.toLowerCase().includes('hồ chí minh') ||
      trimmed.toLowerCase().includes('tp.')
    ) {
      return 'TP. Hồ Chí Minh';
    }
    if (trimmed.toLowerCase().includes('đà nẵng')) return 'Đà Nẵng';
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

  private formatReviewCount(count: number): string {
    if (count >= 1000) {
      const rounded = Math.round((count / 1000) * 10) / 10;
      return `${rounded}k`;
    }
    return String(count);
  }

  private formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}
