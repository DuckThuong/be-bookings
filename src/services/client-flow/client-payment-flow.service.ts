import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbCommission } from '../../entities/sales/commission.entity';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { CommissionRepository } from '../../repositories/sales/commission.repository';
import { ClientEnrichmentService } from '../client-enrichment.service';
import {
  ClientConfirmPaymentDto,
  ClientCreatePaymentDto,
} from '../../dtos/client/payment-flow.dto';
import {
  PaymentStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CompanyErrorMessage } from '../../assets/messages/company.message';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class ClientPaymentFlowService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly enrichment: ClientEnrichmentService,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  /** Bước 1: Tạo hóa đơn thanh toán (PENDING) cho vé */
  async create(user: UserDecoratorDtoResponse, payload: ClientCreatePaymentDto) {
    const ticket = await this.ticketRepository.findById(payload.ticketId);
    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }
    await this.assertTicketAccess(user, ticket);

    if (ticket.status !== TicketStatus.PENDING) {
      throw new HttpException(
        SalesErrorMessage.TICKET_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.paymentRepository.findByTicketId(ticket.id);
    const pending = existing.find((p) => p.status === PaymentStatus.PENDING);
    if (pending) {
      return this.enrichment.enrichInvoiceDetail(pending);
    }

    const payment = await this.paymentRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.PAYMENT),
      ticketId: ticket.id,
      companyTripId: ticket.companyTripId,
      companyId: ticket.companyId,
      customerId: ticket.customerId,
      amount: ticket.totalPrice,
      method: payload.method,
      status: PaymentStatus.PENDING,
      transactionRef: payload.transactionRef ?? undefined,
    });

    return this.enrichment.enrichInvoiceDetail(payment);
  }

  /** Bước 2: Xác nhận thanh toán → vé PAID */
  async confirm(
    user: UserDecoratorDtoResponse,
    paymentId: number,
    payload: ClientConfirmPaymentDto,
  ) {
    const payment = await this.getPaymentOrThrow(paymentId);
    await this.assertPaymentAccess(user, payment);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new HttpException(
        SalesErrorMessage.PAYMENT_ALREADY_SUCCESS,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new HttpException(
        SalesErrorMessage.PAYMENT_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ticket = await this.ticketRepository.findById(payment.ticketId);
    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }

    const paidAt = new Date();
    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.SUCCESS,
      paidAt,
      transactionRef: payload.transactionRef ?? payment.transactionRef,
    });

    await this.ticketRepository.update(ticket.id, {
      status: TicketStatus.PAID,
    });

    const companyTrip = await this.companyTripRepository.findById(
      payment.companyTripId,
    );
    if (companyTrip) {
      await this.companyTripRepository.update(companyTrip.id, {
        totalSeatBooked: companyTrip.totalSeatBooked + ticket.totalSeat,
        totalPrice: Number(companyTrip.totalPrice) + Number(ticket.totalPrice),
      });
    }

    let commission: TbCommission | null = null;
    if (
      user.role !== UserRole.USER &&
      payload.commissionRate !== undefined &&
      payload.commissionRate > 0
    ) {
      const ticketAmount = Number(payment.amount);
      const commissionAmount =
        (ticketAmount * payload.commissionRate) / 100;
      commission = await this.commissionRepository.save({
        paymentId,
        companyId: payment.companyId,
        ticketAmount,
        commissionRate: payload.commissionRate,
        commissionAmount,
        companyAmount: ticketAmount - commissionAmount,
      });
    }

    const updated = await this.paymentRepository.findById(paymentId);
    return {
      payment: updated
        ? await this.enrichment.enrichInvoiceDetail(updated)
        : null,
      commission,
    };
  }

  /** Bước 3: Thanh toán thất bại */
  async fail(user: UserDecoratorDtoResponse, paymentId: number) {
    const payment = await this.getPaymentOrThrow(paymentId);
    await this.assertPaymentAccess(user, payment);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new HttpException(
        SalesErrorMessage.PAYMENT_ALREADY_SUCCESS,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.paymentRepository.update(paymentId, {
      status: PaymentStatus.FAILED,
    });
    const updated = await this.paymentRepository.findById(paymentId);
    return updated
      ? this.enrichment.enrichInvoiceDetail(updated)
      : null;
  }

  async getDetail(user: UserDecoratorDtoResponse, paymentId: number) {
    const payment = await this.getPaymentOrThrow(paymentId);
    await this.assertPaymentAccess(user, payment);
    return this.enrichment.enrichInvoiceDetail(payment);
  }

  private async getPaymentOrThrow(id: number) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(SalesErrorMessage.PAYMENT_NOT_FOUND);
    }
    return payment;
  }

  private async assertTicketAccess(
    user: UserDecoratorDtoResponse,
    ticket: { customerId: string; companyId: number },
  ) {
    if (user.role === UserRole.USER) {
      if (ticket.customerId !== user.userCode) {
        throw new ForbiddenException(ClientErrorMessage.TICKET_NOT_OWNED);
      }
      return;
    }
    if (user.role === UserRole.OWNER) {
      await this.companyAccess.assertCompanyAccess(user, ticket.companyId);
      return;
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }

  private async assertPaymentAccess(
    user: UserDecoratorDtoResponse,
    payment: { customerId: string; companyId: number },
  ) {
    if (user.role === UserRole.USER) {
      if (payment.customerId !== user.userCode) {
        throw new ForbiddenException(ClientErrorMessage.PAYMENT_NOT_OWNED);
      }
      return;
    }
    if (user.role === UserRole.OWNER) {
      await this.companyAccess.assertCompanyAccess(user, payment.companyId);
      return;
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }
}
