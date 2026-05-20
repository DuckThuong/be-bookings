import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommissionRepository } from '../../repositories/sales/commission.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { PaymentStatus } from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CreateCommissionDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class CommissionService {
  constructor(
    private readonly commissionRepository: CommissionRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(user: UserDecoratorDtoResponse, payload: CreateCommissionDto) {
    const payment = await this.paymentRepository.findById(payload.paymentId);
    if (!payment) {
      throw new NotFoundException(SalesErrorMessage.PAYMENT_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, payment.companyId);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new HttpException(
        SalesErrorMessage.TICKET_NOT_PAID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.commissionRepository.findByPaymentId(
      payload.paymentId,
    );
    if (existing) {
      return existing;
    }

    const ticketAmount = Number(payment.amount);
    const commissionAmount = (ticketAmount * payload.commissionRate) / 100;

    return this.commissionRepository.save({
      paymentId: payment.id,
      companyId: payment.companyId,
      ticketAmount,
      commissionRate: payload.commissionRate,
      commissionAmount,
      companyAmount: ticketAmount - commissionAmount,
    });
  }

  async findByCompany(user: UserDecoratorDtoResponse, companyId: number) {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.commissionRepository.findByCompany(companyId);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const commission = await this.commissionRepository.findById(id);
    if (!commission) {
      throw new NotFoundException(SalesErrorMessage.COMMISSION_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, commission.companyId);
    return commission;
  }
}
