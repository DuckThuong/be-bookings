import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbTicket } from '../entities/ticket.entity';
import { TicketRepository } from '../repositories/ticket.repository';
import { CODE_PREFIX } from '../assets/constants/company.constants';
import { TicketStatus } from '../assets/constants/ticket.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { generateEntityCode } from '../common/helpers/common.helper';
import { CreateTicketDto, UpdateTicketDto } from '../dtos/transport/ticket.dto';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateTicketDto,
  ): Promise<TbTicket> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertCompanyTripBelongsToCompany(
      payload.companyId,
      payload.companyTripId,
    );
    await this.companyAccess.assertTripBelongsToCompany(
      payload.companyId,
      payload.tripId,
    );

    const discount = payload.discountAmount ?? 0;
    const subtotal = payload.pricePerSeat * payload.totalSeat;
    const totalPrice = subtotal - discount;

    return this.ticketRepository.save({
      code: generateEntityCode(CODE_PREFIX.TICKET),
      companyId: payload.companyId,
      companyTripId: payload.companyTripId,
      tripId: payload.tripId,
      customerId: payload.customerId,
      pricePerSeat: payload.pricePerSeat,
      subtotal,
      discountAmount: discount,
      totalPrice,
      totalSeat: payload.totalSeat,
      seatIds: payload.seatIds,
      promoCode: payload.promoCode ?? undefined,
      description: payload.description ?? undefined,
      status: payload.status ?? TicketStatus.PENDING,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    filter: {
      companyId?: number;
      companyTripId?: number;
      customerId?: string;
    },
  ): Promise<TbTicket[]> {
    if (filter.companyId !== undefined) {
      await this.companyAccess.assertCompanyAccess(user, filter.companyId);
    } else if (user.role !== UserRole.ADMIN) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.ticketRepository.findByFilter(filter);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbTicket> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, ticket.companyId);
    return ticket;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateTicketDto,
  ): Promise<TbTicket> {
    await this.findOne(user, id);
    await this.ticketRepository.update(id, payload);
    return this.findOne(user, id);
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.ticketRepository.update(id, {
      status: TicketStatus.CANCELLED,
    });
    return { message: 'Đã hủy vé' };
  }
}
