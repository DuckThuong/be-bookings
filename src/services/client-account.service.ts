import {
  ForbiddenException,
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
} from '../dtos/CLIENT/client.dto';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { parsePageLimit } from '../common/helpers/pagination.helper';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyAccessService } from './company-access.service';
import { TbTicket } from '../entities/ticket.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbBooking } from '../entities/sales/booking.entity';

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
