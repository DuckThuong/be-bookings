import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbRefund } from '../../entities/sales/refund.entity';
import { RefundRepository } from '../../repositories/sales/refund.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import {
  PaymentStatus,
  RefundStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CompanyErrorMessage } from '../../assets/messages/company.message';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { CreateRefundDto } from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class RefundService {
  constructor(
    private readonly refundRepository: RefundRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateRefundDto,
  ): Promise<TbRefund> {
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

    if (payload.amount <= 0 || payload.amount > Number(payment.amount)) {
      throw new HttpException(
        SalesErrorMessage.INVALID_AMOUNT,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.refundRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.REFUND),
      paymentId: payment.id,
      ticketId: payment.ticketId,
      companyTripId: payment.companyTripId,
      companyId: payment.companyId,
      amount: payload.amount,
      reason: payload.reason ?? undefined,
      status: RefundStatus.PENDING,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    filter: { companyId?: number; paymentId?: number; ticketId?: number },
  ) {
    if (filter.companyId !== undefined) {
      await this.companyAccess.assertCompanyAccess(user, filter.companyId);
    }
    return this.refundRepository.findByFilter(filter);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const refund = await this.getRefundOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, refund.companyId);
    return refund;
  }

  async confirm(user: UserDecoratorDtoResponse, id: number) {
    const refund = await this.getRefundOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, refund.companyId);

    if (refund.status !== RefundStatus.PENDING) {
      throw new HttpException(
        SalesErrorMessage.REFUND_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ticket = await this.ticketRepository.findById(refund.ticketId);
    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }

    await this.refundRepository.update(id, {
      status: RefundStatus.SUCCESS,
      refundedAt: new Date(),
    });

    await this.ticketRepository.update(ticket.id, {
      status: TicketStatus.REFUNDED,
    });

    const companyTrip = await this.companyTripRepository.findById(
      refund.companyTripId,
    );
    if (companyTrip) {
      await this.companyTripRepository.update(companyTrip.id, {
        totalSeatBooked: Math.max(
          0,
          companyTrip.totalSeatBooked - ticket.totalSeat,
        ),
        totalPrice: Math.max(
          0,
          Number(companyTrip.totalPrice) - Number(refund.amount),
        ),
      });
    }

    return this.refundRepository.findById(id);
  }

  async reject(user: UserDecoratorDtoResponse, id: number) {
    const refund = await this.getRefundOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, refund.companyId);
    await this.refundRepository.update(id, { status: RefundStatus.REJECTED });
    return this.refundRepository.findById(id);
  }

  private async getRefundOrThrow(id: number) {
    const refund = await this.refundRepository.findById(id);
    if (!refund) {
      throw new NotFoundException(SalesErrorMessage.REFUND_NOT_FOUND);
    }
    return refund;
  }
}
