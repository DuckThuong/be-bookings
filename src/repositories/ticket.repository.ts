import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TbTicket } from '../entities/ticket.entity';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(TbTicket)
    private readonly repo: Repository<TbTicket>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  findByFilter(filter: {
    companyId?: number;
    tripId?: number;
    customerId?: string;
  }) {
    const where: FindOptionsWhere<TbTicket> = {};
    if (filter.companyId !== undefined) {
      where.companyId = filter.companyId;
    }
    if (filter.tripId !== undefined) {
      where.tripId = filter.tripId;
    }
    if (filter.customerId) {
      where.customerId = filter.customerId;
    }
    return this.repo.find({ where, order: { id: 'DESC' } });
  }

  save(data: Partial<TbTicket>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbTicket>) {
    return this.repo.update({ id }, data);
  }
}
