import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class CompanyTripRepository {
  constructor(
    @InjectRepository(TbCompanyTrip)
    private readonly repo: Repository<TbCompanyTrip>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
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

  findByTripId(tripId: number) {
    return this.repo.find({ where: { tripId }, order: { id: 'DESC' } });
  }

  findActiveByTripId(tripId: number) {
    return this.repo.find({
      where: { tripId, status: EntityStatus.ACTIVE },
      order: { id: 'DESC' },
    });
  }

  deactivateByVehicleId(vehicleId: number) {
    return this.repo.update({ vehicleId }, { status: EntityStatus.INACTIVE });
  }

  save(data: Partial<TbCompanyTrip>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbCompanyTrip>) {
    return this.repo.update({ id }, data);
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  searchActiveForClient(params: {
    fromCity?: string;
    fromStation?: string;
    toCity?: string;
    toStation?: string;
  }) {
    const qb = this.repo
      .createQueryBuilder('ct')
      .innerJoin('tb_trip', 'trip', 'trip.id = ct.tripId')
      .innerJoin('tb_road', 'road', 'road.id = trip.roadId')
      .where('ct.status = :active', { active: EntityStatus.ACTIVE })
      .andWhere('trip.status = :active', { active: EntityStatus.ACTIVE })
      .andWhere('road.status = :active', { active: EntityStatus.ACTIVE });

    const fromCity = params.fromCity?.trim();
    const fromStation = params.fromStation?.trim();
    const toCity = params.toCity?.trim();
    const toStation = params.toStation?.trim();

    if (fromCity) {
      qb.andWhere(
        '(road.startPoint LIKE :fromCity OR road.name LIKE :fromCity)',
        { fromCity: `%${fromCity}%` },
      );
    }

    if (fromStation) {
      qb.andWhere('road.startPoint LIKE :fromStation', {
        fromStation: `%${fromStation}%`,
      });
    }

    if (toCity) {
      qb.andWhere('(road.endPoint LIKE :toCity OR road.name LIKE :toCity)', {
        toCity: `%${toCity}%`,
      });
    }

    if (toStation) {
      qb.andWhere('road.endPoint LIKE :toStation', {
        toStation: `%${toStation}%`,
      });
    }

    return qb.orderBy('ct.id', 'DESC').getMany();
  }
}
