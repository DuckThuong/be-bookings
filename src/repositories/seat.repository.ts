import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbSeat } from '../entities/seat.entity';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(TbSeat)
    private readonly repo: Repository<TbSeat>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByVehicle(vehicleId: number) {
    return this.repo.find({ where: { vehicleId }, order: { id: 'ASC' } });
  }

  save(data: Partial<TbSeat>) {
    return this.repo.save(this.repo.create(data));
  }

  saveMany(data: Partial<TbSeat>[]) {
    return this.repo.save(data.map((item) => this.repo.create(item)));
  }

  update(id: number, data: Partial<TbSeat>) {
    return this.repo.update({ id }, data);
  }

  async countByVehicleIds(vehicleIds: number[]) {
    if (vehicleIds.length === 0) {
      return 0;
    }
    return this.repo
      .createQueryBuilder('seat')
      .where('seat.vehicleId IN (:...ids)', { ids: vehicleIds })
      .getCount();
  }
}
