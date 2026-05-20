import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbPromotionUsage } from '../../entities/sales/promotion-usage.entity';

@Injectable()
export class PromotionUsageRepository {
  constructor(
    @InjectRepository(TbPromotionUsage)
    private readonly repo: Repository<TbPromotionUsage>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByFilter(filter: {
    companyId?: number;
    promoCode?: string;
    ticketId?: number;
    bookingId?: number;
  }) {
    return this.repo.find({
      where: {
        ...(filter.companyId !== undefined && { companyId: filter.companyId }),
        ...(filter.promoCode && { promoCode: filter.promoCode }),
        ...(filter.ticketId !== undefined && { ticketId: filter.ticketId }),
        ...(filter.bookingId !== undefined && { bookingId: filter.bookingId }),
      },
      order: { id: 'DESC' },
    });
  }

  save(data: Partial<TbPromotionUsage>) {
    return this.repo.save(this.repo.create(data));
  }
}
