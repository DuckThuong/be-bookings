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
}
