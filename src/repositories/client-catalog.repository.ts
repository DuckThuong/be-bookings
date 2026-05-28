import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { EntityStatus } from '../assets/constants/company.constants';
import { BookingStatus } from '../assets/constants/sales.constants';
import { TicketStatus } from '../assets/constants/ticket.constants';

export interface CatalogCompanyFilter {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface CatalogRoadFilter {
  companyId?: number;
  search?: string;
  startPoint?: string;
  endPoint?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface CatalogTripFilter {
  companyId?: number;
  roadId?: number;
  search?: string;
  status?: string;
  startPoint?: string;
  endPoint?: string;
  page: number;
  limit: number;
}

export interface CatalogCompanyTripFilter {
  companyId?: number;
  tripId?: number;
  roadId?: number;
  status?: string;
  startPoint?: string;
  endPoint?: string;
  minAvailableSeats?: number;
  page: number;
  limit: number;
}

@Injectable()
export class ClientCatalogRepository {
  constructor(
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbCompanyTrip)
    private readonly companyTripRepo: Repository<TbCompanyTrip>,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
  ) {}

  findCompanies(filter: CatalogCompanyFilter) {
    const qb = this.companyRepo.createQueryBuilder('c').orderBy('c.id', 'DESC');
    if (filter.status) {
      qb.andWhere('c.status = :status', { status: filter.status });
    } else {
      qb.andWhere('c.status = :status', { status: EntityStatus.ACTIVE });
    }
    if (filter.search?.trim()) {
      const q = `%${filter.search.trim()}%`;
      qb.andWhere(
        '(c.companyName LIKE :q OR c.code LIKE :q OR c.description LIKE :q)',
        { q },
      );
    }
    return this.paginate(qb, filter.page, filter.limit);
  }

  findCompanyById(id: number) {
    return this.companyRepo.findOne({ where: { id } });
  }

  findRoads(filter: CatalogRoadFilter) {
    const qb = this.roadRepo.createQueryBuilder('r').orderBy('r.id', 'DESC');
    if (filter.companyId !== undefined) {
      qb.andWhere('r.companyId = :companyId', { companyId: filter.companyId });
    }
    if (filter.status) {
      qb.andWhere('r.status = :status', { status: filter.status });
    } else {
      qb.andWhere('r.status = :status', { status: EntityStatus.ACTIVE });
    }
    if (filter.startPoint?.trim()) {
      qb.andWhere('r.startPoint LIKE :sp', {
        sp: `%${filter.startPoint.trim()}%`,
      });
    }
    if (filter.endPoint?.trim()) {
      qb.andWhere('r.endPoint LIKE :ep', {
        ep: `%${filter.endPoint.trim()}%`,
      });
    }
    if (filter.search?.trim()) {
      const q = `%${filter.search.trim()}%`;
      qb.andWhere(
        '(r.name LIKE :q OR r.code LIKE :q OR r.startPoint LIKE :q OR r.endPoint LIKE :q)',
        { q },
      );
    }
    return this.paginate(qb, filter.page, filter.limit);
  }

  findRoadById(id: number) {
    return this.roadRepo.findOne({ where: { id } });
  }

  findRoadsByCompany(companyId: number) {
    return this.roadRepo.find({
      where: { companyId, status: EntityStatus.ACTIVE },
      order: { id: 'DESC' },
    });
  }

  async findTrips(filter: CatalogTripFilter) {
    const qb = this.tripRepo.createQueryBuilder('t').orderBy('t.id', 'DESC');
    if (filter.startPoint?.trim() && filter.endPoint?.trim()) {
      const roadId = await this.findRoadId(
        filter.startPoint,
        filter.endPoint
      );
      if (!roadId) {
        return { items: [], total: 0 };
      }
      qb.andWhere('t.roadId = :roadId', { roadId });
    }
    if (filter.status) {
      qb.andWhere('t.status = :status', { status: filter.status });
    } else {
      qb.andWhere('t.status = :status', { status: EntityStatus.ACTIVE });
    }
    if (filter.search?.trim()) {
      const q = `%${filter.search.trim()}%`;
      qb.andWhere('(t.name LIKE :q OR t.code LIKE :q)', { q });
    }
    return this.paginate(qb, filter.page, filter.limit);
  }

  findTripById(id: number) {
    return this.tripRepo.findOne({ where: { id } });
  }

  findTripsByRoadId(roadId: number) {
    return this.tripRepo.find({
      where: { roadId, status: EntityStatus.ACTIVE },
      order: { id: 'DESC' },
    });
  }

  async findCompanyTrips(filter: CatalogCompanyTripFilter) {
    const qb = this.companyTripRepo
      .createQueryBuilder('ct')
      .orderBy('ct.id', 'DESC');
    if (filter.companyId !== undefined) {
      qb.andWhere('ct.companyId = :companyId', {
        companyId: filter.companyId,
      });
    }
    if (filter.tripId !== undefined) {
      qb.andWhere('ct.tripId = :tripId', { tripId: filter.tripId });
    }
    if (filter.status) {
      qb.andWhere('ct.status = :status', { status: filter.status });
    } else {
      qb.andWhere('ct.status = :status', { status: EntityStatus.ACTIVE });
    }
    if (filter.roadId !== undefined) {
      const trips = await this.tripRepo.find({
        where: { roadId: filter.roadId },
        select: ['id'],
      });
      const tripIds = trips.map((t) => t.id);
      if (tripIds.length === 0) {
        return { items: [], total: 0 };
      }
      qb.andWhere('ct.tripId IN (:...tripIds)', { tripIds });
    }
    const { items, total } = await this.paginate(qb, filter.page, filter.limit);
    if (filter.minAvailableSeats === undefined) {
      return { items, total };
    }
    const filtered = items.filter((ct) => {
      const available = ct.totalSeat - ct.totalSeatBooked;
      return available >= filter.minAvailableSeats!;
    });
    return { items: filtered, total: filtered.length };
  }

  async findRoadId(startPoint: string, endPoint: string, companyId?: number) {
    const road = await this.roadRepo.findOne({
      where: { startPoint, endPoint, companyId },
    });
    return road?.id;
  }

  findCompanyTripById(id: number) {
    return this.companyTripRepo.findOne({ where: { id } });
  }

  async getOccupiedSeatIds(companyTripId: number): Promise<number[]> {
    const tickets = await this.ticketRepo.find({
      where: {
        companyTripId,
        status: In([TicketStatus.PENDING, TicketStatus.PAID]),
      },
    });
    const bookings = await this.bookingRepo
      .createQueryBuilder('b')
      .where('b.companyTripId = :companyTripId', { companyTripId })
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
    return [...ids];
  }

  countRoadsByCompany(companyId: number) {
    return this.roadRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  countCompanyTripsByCompany(companyId: number) {
    return this.companyTripRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  private async paginate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    page: number,
    limit: number,
  ): Promise<{ items: T[]; total: number }> {
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total };
  }
}
