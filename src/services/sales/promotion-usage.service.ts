import { Injectable, NotFoundException } from '@nestjs/common';
import { PromotionUsageRepository } from '../../repositories/sales/promotion-usage.repository';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CreatePromotionUsageDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class PromotionUsageService {
  constructor(
    private readonly promotionUsageRepository: PromotionUsageRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreatePromotionUsageDto,
  ) {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    return this.promotionUsageRepository.save(payload);
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    filter: {
      companyId?: number;
      promoCode?: string;
      ticketId?: number;
      bookingId?: number;
    },
  ) {
    if (filter.companyId !== undefined) {
      await this.companyAccess.assertCompanyAccess(user, filter.companyId);
    }
    return this.promotionUsageRepository.findByFilter(filter);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const usage = await this.promotionUsageRepository.findById(id);
    if (!usage) {
      throw new NotFoundException(SalesErrorMessage.PROMOTION_USAGE_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, usage.companyId);
    return usage;
  }
}
