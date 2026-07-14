import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientAccountRepository } from '../repositories/client-account.repository';
import { ClientEnrichmentService } from './client-enrichment.service';
import { ClientErrorMessage } from '../assets/messages/client.message';
import {
  ClientMyBookingQueryDto,
  ClientMyInvoiceQueryDto,
  ClientMyTicketQueryDto,
} from '../dtos/client/client.dto';
import { RequestRefundDto, RefundResponseDto } from '../dtos/client/account-refund.dto';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { parsePageLimit } from '../common/helpers/pagination.helper';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyAccessService } from './company-access.service';
import { TbTicket } from '../entities/ticket.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { RefundRepository } from '../repositories/sales/refund.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { PaymentRepository } from '../repositories/sales/payment.repository';
import { TripRepository } from '../repositories/trip.repository';
import {
  PaymentStatus,
  RefundStatus,
  SALES_CODE_PREFIX,
} from '../assets/constants/sales.constants';
import { TicketStatus } from '../assets/constants/ticket.constants';
import { generateEntityCode } from '../common/helpers/common.helper';
import { BookingErrorMessage } from '../assets/messages/booking.message';

interface AccountListScope {
  customerId?: string;
  companyIds?: number[];
  companyId?: number;
}

@Injectable()
export class ClientAccountService {
  constructor(
    private readonly accountRepository: ClientAccountRepository,
    private readonly enrichment: ClientEnrichmentService,
    private readonly companyRepository: CompanyRepository,
    private readonly companyAccess: CompanyAccessService,
    private readonly refundRepository: RefundRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly tripRepository: TripRepository,
  ) {}

  async listMyTickets(
    user: UserDecoratorDtoResponse,
    query: ClientMyTicketQueryDto,
  ) {
    const scope = await this.buildListScope(
      user,
      query.customerId,
      query.companyId,
    );
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.accountRepository.findTickets({
      ...scope,
      status: query.status,
      code: query.code,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichTickets(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getMyTicket(
    user: UserDecoratorDtoResponse,
    id: number,
    customerIdQuery?: string,
  ) {
    const ticket = await this.accountRepository.findTicketById(id);
    if (!ticket) {
      throw new NotFoundException(ClientErrorMessage.TICKET_NOT_FOUND);
    }
    await this.assertCanAccessRecord(user, ticket, customerIdQuery);
    return this.enrichment.enrichTicketDetail(ticket);
  }

  async listMyInvoices(
    user: UserDecoratorDtoResponse,
    query: ClientMyInvoiceQueryDto,
  ) {
    const scope = await this.buildListScope(
      user,
      query.customerId,
      query.companyId,
    );
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.accountRepository.findInvoices({
      ...scope,
      status: query.status,
      method: query.method,
      search: query.search,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichInvoices(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getMyInvoice(
    user: UserDecoratorDtoResponse,
    id: number,
    customerIdQuery?: string,
  ) {
    const payment = await this.accountRepository.findInvoiceById(id);
    if (!payment) {
      throw new NotFoundException(ClientErrorMessage.INVOICE_NOT_FOUND);
    }
    await this.assertCanAccessRecord(user, payment, customerIdQuery);
    return this.enrichment.enrichInvoiceDetail(payment);
  }

  async listMyBookings(
    user: UserDecoratorDtoResponse,
    query: ClientMyBookingQueryDto,
  ) {
    const scope = await this.buildListScope(
      user,
      query.customerId,
      query.companyId,
    );
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.accountRepository.findBookings({
      ...scope,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichBookings(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getMyBooking(
    user: UserDecoratorDtoResponse,
    id: number,
    customerIdQuery?: string,
  ) {
    const booking = await this.accountRepository.findBookingById(id);
    if (!booking) {
      throw new NotFoundException(ClientErrorMessage.BOOKING_NOT_FOUND);
    }
    await this.assertCanAccessRecord(user, booking, customerIdQuery);
    return this.enrichment.enrichBookingDetail(booking);
  }

  async requestRefund(
    user: UserDecoratorDtoResponse,
    bookingId: number,
    body: RequestRefundDto,
  ): Promise<RefundResponseDto> {
    const booking = await this.accountRepository.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(ClientErrorMessage.BOOKING_NOT_FOUND);
    }
    await this.assertCanAccessRecord(user, booking);

    if (!booking.ticketId) {
      throw new HttpException(
        BookingErrorMessage.TICKET_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ticket = await this.ticketRepository.findById(booking.ticketId);
    if (!ticket) {
      throw new NotFoundException(BookingErrorMessage.TICKET_NOT_FOUND);
    }

    if (
      ticket.status !== TicketStatus.PAID &&
      ticket.status !== 'PENDING_REFUND'
    ) {
      throw new HttpException(
        BookingErrorMessage.TICKET_NOT_REFUNDABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (ticket.status === 'PENDING_REFUND') {
      throw new HttpException(
        BookingErrorMessage.REFUND_ALREADY_REQUESTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const payment = await this.paymentRepository.findById(ticket.id);
    if (!payment) {
      throw new NotFoundException(ClientErrorMessage.INVOICE_NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new HttpException(
        BookingErrorMessage.TICKET_NOT_PAID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const trip = await this.tripRepository.findById(ticket.tripId);
    if (!trip) {
      throw new NotFoundException(BookingErrorMessage.TRIP_NOT_FOUND);
    }

    const departureTime = trip.departure ? new Date(trip.departure) : null;
    const now = new Date();
    let hoursUntilDeparture = 999;

    if (departureTime) {
      hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    }

    let refundPercentage: number;
    if (hoursUntilDeparture >= 24) {
      refundPercentage = 80;
    } else if (hoursUntilDeparture >= 6) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    if (hoursUntilDeparture <= 0) {
      throw new HttpException(
        BookingErrorMessage.TRIP_ALREADY_DEPARTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const paidAmount = Number(ticket.totalPrice);
    const refundAmount = Math.floor(paidAmount * (refundPercentage / 100));

    await this.ticketRepository.update(ticket.id, {
      status: TicketStatus.PENDING_REFUND,
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const refund = await this.refundRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.REFUND),
      paymentId: payment.id,
      ticketId: ticket.id,
      tripId: ticket.tripId,
      companyId: ticket.companyId,
      customerId: booking.customerId,
      userId: user.id,
      amount: refundAmount,
      refundPercentage,
      reason: body.reason ?? undefined,
      status: RefundStatus.PENDING,
      expiresAt,
    });

    return {
      success: true,
      message: 'Yêu cầu hoàn tiền đã được gửi thành công!',
      refundCode: refund.code,
      refundPercentage,
      estimatedRefundAmount: refundAmount,
    };
  }

  private async buildListScope(
    user: UserDecoratorDtoResponse,
    customerIdQuery?: string,
    companyIdQuery?: number,
  ): Promise<AccountListScope> {
    if (user.role === UserRole.USER) {
      return { customerId: user.userCode, companyId: companyIdQuery };
    }

    if (user.role === UserRole.ADMIN) {
      if (companyIdQuery !== undefined) {
        await this.companyAccess.assertCompanyAccess(user, companyIdQuery);
      }
      return {
        customerId: customerIdQuery?.trim() || undefined,
        companyId: companyIdQuery,
      };
    }

    if (user.role === UserRole.OWNER) {
      const companies = await this.companyRepository.findCompaniesByUserLead(
        user.id.toString(),
      );
      const companyIds = companies.map((c) => c.id);
      if (companyIdQuery !== undefined) {
        await this.companyAccess.assertCompanyAccess(user, companyIdQuery);
        return {
          customerId: customerIdQuery?.trim() || undefined,
          companyId: companyIdQuery,
        };
      }
      return {
        customerId: customerIdQuery?.trim() || undefined,
        companyIds,
      };
    }

    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }

  private async assertCanAccessRecord(
    user: UserDecoratorDtoResponse,
    record: TbTicket | TbPayment | TbBooking,
    customerIdQuery?: string,
  ) {
    if (user.role === UserRole.USER) {
      if (record.customerId !== user.userCode) {
        throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
      }
      return;
    }

    if (user.role === UserRole.ADMIN) {
      if (
        customerIdQuery?.trim() &&
        record.customerId !== customerIdQuery.trim()
      ) {
        throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
      }
      return;
    }

    if (user.role === UserRole.OWNER) {
      await this.companyAccess.assertCompanyAccess(user, record.companyId);
      if (
        customerIdQuery?.trim() &&
        record.customerId !== customerIdQuery.trim()
      ) {
        throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
      }
      return;
    }

    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }
}
