import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbTripStat } from '../../entities/sales/trip-stat.entity';

@Injectable()
export class TripStatRepository {
  constructor(
    @InjectRepository(TbTripStat)
    private readonly repo: Repository<TbTripStat>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByTripAndDate(tripId: number, statDate: string) {
    return this.repo.findOne({ where: { tripId, statDate } });
  }

  findByCompany(companyId: number) {
    return this.repo.find({
      where: { companyId },
      order: { statDate: 'DESC' },
    });
  }

  findByTrip(tripId: number) {
    return this.repo.find({
      where: { tripId },
      order: { statDate: 'DESC' },
    });
  }

  save(data: Partial<TbTripStat>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbTripStat>) {
    return this.repo.update({ id }, data);
  }
}
