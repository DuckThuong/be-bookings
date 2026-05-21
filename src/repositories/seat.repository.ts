import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbSeat } from '../entities/seat.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(TbSeat)
    private readonly repo: Repository<TbSeat>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByVehicle(verhicalId: number) {
    return this.repo.find({ where: { verhicalId }, order: { id: 'ASC' } });
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

  deactivateByVehicleId(verhicalId: number) {
    return this.repo.update(
      { verhicalId },
      { status: EntityStatus.INACTIVE },
    );
  }

  async countByVehicleIds(vehicleIds: number[]) {
    if (vehicleIds.length === 0) {
      return 0;
    }
    return this.repo
      .createQueryBuilder('seat')
      .where('seat.verhicalId IN (:...ids)', { ids: vehicleIds })
      .getCount();
  }
}
