import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbTrip } from '../entities/trip.entity';
import { EntityStatus } from '../assets/constants/company.constants';

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
      .andWhere('trip.status = :status', { status: EntityStatus.ACTIVE })
      .getCount();
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
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
      .where('trip.status = :active', { active: EntityStatus.ACTIVE })
      .andWhere('road.status = :active', { active: EntityStatus.ACTIVE });

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
