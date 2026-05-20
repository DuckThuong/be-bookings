import { Injectable, NotFoundException } from '@nestjs/common';
import { TbSettlement } from '../../entities/sales/settlement.entity';
import { SettlementRepository } from '../../repositories/sales/settlement.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { RefundRepository } from '../../repositories/sales/refund.repository';
import { CommissionRepository } from '../../repositories/sales/commission.repository';
import {
  SALES_CODE_PREFIX,
  SettlementStatus,
} from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { generateEntityCode } from '../../common/helpers/common.helper';
import {
  CreateSettlementDto,
  UpdateSettlementDto,
} from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class SettlementService {
  constructor(
    private readonly settlementRepository: SettlementRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly refundRepository: RefundRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateSettlementDto,
  ): Promise<TbSettlement> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    return this.settlementRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.SETTLEMENT),
      ...payload,
      status: payload.status ?? SettlementStatus.DRAFT,
    });
  }

  async generateDraft(
    user: UserDecoratorDtoResponse,
    companyId: number,
    periodFrom: string,
    periodTo: string,
  ) {
    await this.companyAccess.assertCompanyAccess(user, companyId);

    const totalSales = await this.paymentRepository.sumSuccessByCompany(
      companyId,
    );
    const refundTotal = await this.refundRepository.sumSuccessByCompany(
      companyId,
    );
    const commissions = await this.commissionRepository.findByCompany(
      companyId,
    );
    const totalCommission = commissions.reduce(
      (sum, c) => sum + Number(c.commissionAmount),
      0,
    );
    const netSales = totalSales - refundTotal;
    const payoutAmount = netSales - totalCommission;

    return this.settlementRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.SETTLEMENT),
      companyId,
      periodFrom,
      periodTo,
      totalSales: netSales,
      totalCommission,
      payoutAmount,
      status: SettlementStatus.DRAFT,
    });
  }

  async findByCompany(user: UserDecoratorDtoResponse, companyId: number) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.settlementRepository.findByCompany(companyId);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const settlement = await this.settlementRepository.findById(id);
    if (!settlement) {
      throw new NotFoundException(SalesErrorMessage.SETTLEMENT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, settlement.companyId);
    return settlement;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateSettlementDto,
  ) {
    await this.findOne(user, id);
    await this.settlementRepository.update(id, payload);
    return this.settlementRepository.findById(id);
  }

  async markPaid(user: UserDecoratorDtoResponse, id: number) {
    await this.findOne(user, id);
    await this.settlementRepository.update(id, {
      status: SettlementStatus.PAID,
      paidAt: new Date(),
    });
    return this.settlementRepository.findById(id);
  }
}
