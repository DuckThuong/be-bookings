import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbBooking } from '../../entities/sales/booking.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(TbBooking)
    private readonly repo: Repository<TbBooking>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  findByFilter(filter: {
    companyId?: number;
    companyTripId?: number;
    customerId?: string;
    status?: string;
  }) {
    return this.repo.find({
      where: {
        ...(filter.companyId !== undefined && { companyId: filter.companyId }),
        ...(filter.companyTripId !== undefined && {
          companyTripId: filter.companyTripId,
        }),
        ...(filter.customerId && { customerId: filter.customerId }),
        ...(filter.status && { status: filter.status }),
      },
      order: { id: 'DESC' },
    });
  }

  save(data: Partial<TbBooking>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbBooking>) {
    return this.repo.update({ id }, data);
  }
}
