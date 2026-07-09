import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TbTrip } from '../entities/trip.entity';
import { TripStatus } from '../assets/constants/company.constants';

const ACTIVE_TRIP_STATUSES = [
  TripStatus.SCHEDULED,
  TripStatus.PREPARING,
  TripStatus.BOARDING,
  TripStatus.DEPARTED,
  TripStatus.APPROACHING,
  TripStatus.MOVING,
  TripStatus.ARRIVED,
  TripStatus.DELAYED,
];

@Injectable()
export class TripRepository {
  constructor(
    @InjectRepository(TbTrip)
    private readonly repo: Repository<TbTrip>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  findByRoadIds(roadIds: number[]) {
    if (roadIds.length === 0) {
      return [];
    }
    return this.repo
      .createQueryBuilder('trip')
      .where('trip.roadId IN (:...roadIds)', { roadIds })
      .orderBy('trip.id', 'DESC')
      .getMany();
  }

  findByRoadId(roadId: number) {
    return this.repo.find({ where: { roadId }, order: { id: 'DESC' } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  findByVehicleId(vehicleId: number) {
    return this.repo.find({ where: { vehicleId }, order: { id: 'DESC' } });
  }

  findByDriverId(driverId: number) {
    return this.repo.find({ where: { driverId }, order: { id: 'DESC' } });
  }

  save(data: Partial<TbTrip>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbTrip>) {
    return this.repo.update({ id }, data);
  }

  countActiveByRoadIds(roadIds: number[]) {
    if (roadIds.length === 0) {
      return 0;
    }
    return this.repo
      .createQueryBuilder('trip')
      .where('trip.roadId IN (:...roadIds)', { roadIds })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: ACTIVE_TRIP_STATUSES,
      })
      .getCount();
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: In(ACTIVE_TRIP_STATUSES) },
    });
  }

  searchActiveForClient(params: {
    fromCity?: string;
    toCity?: string;
    companyId?: number;
  }) {
    const qb = this.repo
      .createQueryBuilder('trip')
      .innerJoin('tb_road', 'road', 'road.id = trip.roadId')
      .where('trip.status IN (:...tripStatuses)', {
        tripStatuses: ACTIVE_TRIP_STATUSES,
      })
      .andWhere('road.status = :roadStatus', { roadStatus: 'ACTIVE' });

    const fromCity = params.fromCity?.trim();
    const toCity = params.toCity?.trim();

    if (fromCity) {
      qb.andWhere('road.startPoint LIKE :fromCity', {
        fromCity: `%${fromCity}%`,
      });
    }

    if (toCity) {
      qb.andWhere('road.endPoint LIKE :toCity', {
        toCity: `%${toCity}%`,
      });
    }

    if (params.companyId !== undefined) {
      qb.andWhere('trip.companyId = :companyId', {
        companyId: params.companyId,
      });
    }

    return qb.orderBy('trip.id', 'DESC').getMany();
  }

  incrementBookedSeats(id: number, seatCount: number) {
    return this.repo.increment({ id }, 'bookedSeats', seatCount);
  }

  decrementBookedSeats(id: number, seatCount: number) {
    return this.repo.decrement({ id }, 'bookedSeats', seatCount);
  }
}
