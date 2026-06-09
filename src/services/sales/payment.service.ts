import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbCommission } from '../../entities/sales/commission.entity';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { TripRepository } from '../../repositories/trip.repository';
import { CommissionRepository } from '../../repositories/sales/commission.repository';
import {
  BookingStatus,
  PaymentStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CompanyErrorMessage } from '../../assets/messages/company.message';
import { generateEntityCode } from '../../common/helpers/common.helper';
import {
  ConfirmPaymentDto,
  CreatePaymentDto,
} from '../../dtos/sales/sales.dto';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly tripRepository: TripRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreatePaymentDto,
  ): Promise<TbPayment> {
    const ticket = await this.ticketRepository.findById(payload.ticketId);
    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, ticket.companyId);

    if (ticket.status !== TicketStatus.PENDING) {
      throw new HttpException(
        SalesErrorMessage.TICKET_NOT_PENDING,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.paymentRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.PAYMENT),
      ticketId: ticket.id,
      tripId: ticket.tripId,
      companyId: ticket.companyId,
      customerId: ticket.customerId,
      amount: ticket.totalPrice,
      method: payload.method,
      status: payload.status ?? PaymentStatus.PENDING,
      transactionRef: payload.transactionRef ?? undefined,
      paidAt: payload.status === PaymentStatus.SUCCESS ? new Date() : undefined,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    filter: {
      companyId?: number;
      tripId?: number;
      customerId?: string;
      status?: string;
    },
  ) {
    if (filter.companyId !== undefined) {
      await this.companyAccess.assertCompanyAccess(user, filter.companyId);
    } else if (user.role !== UserRole.ADMIN) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.paymentRepository.findByFilter(filter);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const payment = await this.getPaymentOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, payment.companyId);
    return payment;
  }

  async confirm(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: ConfirmPaymentDto,
  ) {
    const payment = await this.getPaymentOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, payment.companyId);

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
    await this.paymentRepository.update(id, {
      status: PaymentStatus.SUCCESS,
      paidAt,
      transactionRef: payload.transactionRef ?? payment.transactionRef,
    });

    await this.ticketRepository.update(ticket.id, {
      status: TicketStatus.PAID,
    });

    if (ticket.bookingId) {
      await this.bookingRepository.update(ticket.bookingId, {
        status: BookingStatus.CONFIRMED,
      });
    }

    await this.tripRepository.incrementBookedSeats(
      ticket.tripId,
      ticket.totalSeat,
    );

    let commission: TbCommission | null = null;
    if (payload.commissionRate !== undefined && payload.commissionRate > 0) {
      const ticketAmount = Number(payment.amount);
      const commissionAmount = (ticketAmount * payload.commissionRate) / 100;
      commission = await this.commissionRepository.save({
        paymentId: id,
        companyId: payment.companyId,
        ticketAmount,
        commissionRate: payload.commissionRate,
        commissionAmount,
        companyAmount: ticketAmount - commissionAmount,
      });
    }

    return {
      payment: await this.paymentRepository.findById(id),
      commission,
    };
  }

  async markFailed(user: UserDecoratorDtoResponse, id: number) {
    const payment = await this.getPaymentOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, payment.companyId);
    await this.paymentRepository.update(id, { status: PaymentStatus.FAILED });
    return this.paymentRepository.findById(id);
  }

  async rejectApproval(user: UserDecoratorDtoResponse, id: number) {
    const payment = await this.getPaymentOrThrow(id);
    await this.companyAccess.assertCompanyAccess(user, payment.companyId);

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new HttpException(
        SalesErrorMessage.PAYMENT_ALREADY_SUCCESS,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.paymentRepository.update(id, { status: PaymentStatus.FAILED });

    const ticket = await this.ticketRepository.findById(payment.ticketId);
    if (ticket) {
      await this.ticketRepository.update(ticket.id, {
        status: TicketStatus.CANCELLED,
      });
      if (ticket.bookingId) {
        await this.bookingRepository.update(ticket.bookingId, {
          status: BookingStatus.CANCELLED,
        });
      }
    }

    return {
      message: 'Đã từ chối đặt vé',
      payment: await this.paymentRepository.findById(id),
    };
  }

  private async getPaymentOrThrow(id: number) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(SalesErrorMessage.PAYMENT_NOT_FOUND);
    }
    return payment;
  }
}
