import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { RefundRepository } from '../../repositories/sales/refund.repository';
import { ClientInvoiceQueryDto, ClientRefundQueryDto } from '../../dtos/client/invoice.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { PAYMENT_METHOD_DISPLAY } from '../../assets/constants/payment.constants';

export interface PaymentInvoiceResponse {
  id: number;
  code: string;
  amount: number;
  method: string;
  methodDisplay: string;
  status: string;
  paidAt: Date | null;
  transactionRef: string | null;
  createdAt: Date;
  trip?: {
    departure?: string;
    arrival?: string;
    name?: string;
    date?: string;
    time?: string;
  } | null;
  company?: {
    code: string;
    companyName: string;
  } | null;
  ticket?: {
    id: number;
    code: string;
    totalSeat: number;
  } | null;
}

export interface RefundInvoiceResponse {
  id: number;
  code: string;
  amount: number;
  reason: string | null;
  status: string;
  refundedAt: Date | null;
  createdAt: Date;
  trip?: {
    departure?: string;
    arrival?: string;
    name?: string;
    date?: string;
    time?: string;
  } | null;
  company?: {
    code: string;
    companyName: string;
  } | null;
  payment?: {
    code: string;
    amount: number;
    method: string;
    methodDisplay: string;
  } | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ClientInvoiceService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly refundRepository: RefundRepository,
  ) {}

  async getMyPayments(
    user: UserDecoratorDtoResponse,
    query: ClientInvoiceQueryDto,
  ): Promise<PaginatedResponse<PaymentInvoiceResponse>> {
    const customerId = user.userCode;

    const result = await this.paymentRepository.findByCustomerIdPaginated(customerId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
      method: query.method,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    return {
      items: result.items.map((p) => this.mapPaymentToResponse(p)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getMyRefunds(
    user: UserDecoratorDtoResponse,
    query: ClientRefundQueryDto,
  ): Promise<PaginatedResponse<RefundInvoiceResponse>> {
    const customerId = user.userCode;

    const result = await this.refundRepository.findByCustomerIdPaginated(customerId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    return {
      items: result.items.map((r) => this.mapRefundToResponse(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getPaymentSummary(user: UserDecoratorDtoResponse) {
    const customerId = user.userCode;
    const totalSpent = await this.paymentRepository.sumTotalByCustomer(customerId);

    const successPayments = await this.paymentRepository.findByCustomerIdPaginated(customerId, {
      limit: 1,
    });

    const pendingRefunds = await this.refundRepository.findByCustomerIdPaginated(customerId, {
      limit: 1,
    });

    return {
      totalSpent,
      totalPayments: successPayments.total,
      pendingRefunds: pendingRefunds.total,
    };
  }

  private mapPaymentToResponse(payment: any): PaymentInvoiceResponse {
    const methodDisplay =
      PAYMENT_METHOD_DISPLAY[payment.method as keyof typeof PAYMENT_METHOD_DISPLAY] ||
      payment.method;

    let tripInfo: PaymentInvoiceResponse['trip'] = null;
    if (payment.trip) {
      tripInfo = {
        departure: payment.trip.departure ?? payment.trip.road?.startPoint ?? undefined,
        arrival: payment.trip.arrival ?? payment.trip.road?.endPoint ?? undefined,
        name: payment.trip.name ?? undefined,
        date: undefined,
        time: undefined,
      };
    }

    let companyInfo: PaymentInvoiceResponse['company'] = null;
    if (payment.company) {
      companyInfo = {
        code: payment.company.code,
        companyName: payment.company.companyName,
      };
    }

    let ticketInfo: PaymentInvoiceResponse['ticket'] = null;
    if (payment.ticket) {
      ticketInfo = {
        id: payment.ticket.id,
        code: payment.ticket.code,
        totalSeat: payment.ticket.totalSeat,
      };
    }

    return {
      id: payment.id,
      code: payment.code,
      amount: Number(payment.amount),
      method: payment.method,
      methodDisplay: typeof methodDisplay === 'string' ? methodDisplay : payment.method,
      status: payment.status,
      paidAt: payment.paidAt,
      transactionRef: payment.transactionRef,
      createdAt: payment.createdAt,
      trip: tripInfo,
      company: companyInfo,
      ticket: ticketInfo,
    };
  }

  private mapRefundToResponse(refund: any): RefundInvoiceResponse {
    let tripInfo: RefundInvoiceResponse['trip'] = null;
    if (refund.trip) {
      tripInfo = {
        departure: refund.trip.departure ?? refund.trip.road?.startPoint ?? undefined,
        arrival: refund.trip.arrival ?? refund.trip.road?.endPoint ?? undefined,
        name: refund.trip.name ?? undefined,
        date: undefined,
        time: undefined,
      };
    }

    let companyInfo: RefundInvoiceResponse['company'] = null;
    if (refund.company) {
      companyInfo = {
        code: refund.company.code,
        companyName: refund.company.companyName,
      };
    }

    let paymentInfo: RefundInvoiceResponse['payment'] = null;
    if (refund.payment) {
      const methodDisplay =
        PAYMENT_METHOD_DISPLAY[refund.payment.method as keyof typeof PAYMENT_METHOD_DISPLAY] ||
        refund.payment.method;
      paymentInfo = {
        code: refund.payment.code,
        amount: Number(refund.payment.amount),
        method: refund.payment.method,
        methodDisplay: typeof methodDisplay === 'string' ? methodDisplay : refund.payment.method,
      };
    }

    return {
      id: refund.id,
      code: refund.code,
      amount: Number(refund.amount),
      reason: refund.reason,
      status: refund.status,
      refundedAt: refund.refundedAt,
      createdAt: refund.createdAt,
      trip: tripInfo,
      company: companyInfo,
      payment: paymentInfo,
    };
  }
}
