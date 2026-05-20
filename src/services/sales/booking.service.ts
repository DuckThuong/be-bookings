import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbBooking } from '../../entities/sales/booking.entity';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import {
  BookingStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { CompanyErrorMessage } from '../../assets/messages/company.message';
import { CODE_PREFIX } from '../../assets/constants/company.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { CreateBookingDto } from '../../dtos/sales/sales.dto';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateBookingDto,
  ): Promise<TbBooking> {
    this.assertCustomerAccess(user, payload.customerId);
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertCompanyTripBelongsToCompany(
      payload.companyId,
      payload.companyTripId,
    );

    const discount = payload.discountAmount ?? 0;
    const subtotal = payload.pricePerSeat * payload.totalSeat;

    return this.bookingRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.BOOKING),
      companyId: payload.companyId,
      companyTripId: payload.companyTripId,
      tripId: payload.tripId,
      customerId: payload.customerId,
      seatIds: payload.seatIds,
      totalSeat: payload.totalSeat,
      pricePerSeat: payload.pricePerSeat,
      subtotal,
      discountAmount: discount,
      totalPrice: subtotal - discount,
      promoCode: payload.promoCode ?? undefined,
      status: BookingStatus.HOLD,
      holdExpiresAt: new Date(payload.holdExpiresAt),
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    filter: {
      companyId?: number;
      companyTripId?: number;
      customerId?: string;
      status?: string;
    },
  ) {
    if (filter.companyId !== undefined) {
      await this.companyAccess.assertCompanyAccess(user, filter.companyId);
    } else if (user.role === UserRole.USER) {
      filter.customerId = user.userCode;
    } else if (user.role !== UserRole.ADMIN) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.bookingRepository.findByFilter(filter);
  }

  async findOne(user: UserDecoratorDtoResponse, id: number) {
    const booking = await this.getBookingOrThrow(id);
    await this.assertBookingAccess(user, booking);
    return booking;
  }

  async convertToTicket(user: UserDecoratorDtoResponse, id: number) {
    const booking = await this.getBookingOrThrow(id);
    await this.assertBookingAccess(user, booking);

    if (booking.status !== BookingStatus.HOLD) {
      throw new HttpException(
        SalesErrorMessage.BOOKING_NOT_HOLD,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (new Date() > new Date(booking.holdExpiresAt)) {
      await this.bookingRepository.update(id, {
        status: BookingStatus.EXPIRED,
      });
      throw new HttpException(
        SalesErrorMessage.BOOKING_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ticket = await this.ticketRepository.save({
      code: generateEntityCode(CODE_PREFIX.TICKET),
      companyId: booking.companyId,
      companyTripId: booking.companyTripId,
      tripId: booking.tripId,
      customerId: booking.customerId,
      pricePerSeat: booking.pricePerSeat,
      subtotal: booking.subtotal,
      discountAmount: booking.discountAmount,
      totalPrice: booking.totalPrice,
      totalSeat: booking.totalSeat,
      seatIds: booking.seatIds,
      promoCode: booking.promoCode ?? undefined,
      bookingId: booking.id,
      status: TicketStatus.PENDING,
    });

    await this.bookingRepository.update(id, {
      status: BookingStatus.CONVERTED,
      ticketId: ticket.id,
    });

    return {
      booking: await this.bookingRepository.findById(id),
      ticket,
    };
  }

  async cancel(user: UserDecoratorDtoResponse, id: number) {
    const booking = await this.getBookingOrThrow(id);
    await this.assertBookingAccess(user, booking);

    if (booking.status === BookingStatus.CONVERTED) {
      throw new HttpException(
        SalesErrorMessage.BOOKING_ALREADY_CONVERTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.bookingRepository.update(id, { status: BookingStatus.CANCELLED });
    return { message: 'Đã hủy đặt chỗ' };
  }

  private async getBookingOrThrow(id: number) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(SalesErrorMessage.BOOKING_NOT_FOUND);
    }
    return booking;
  }

  private async assertBookingAccess(
    user: UserDecoratorDtoResponse,
    booking: TbBooking,
  ) {
    if (user.role === UserRole.USER) {
      if (booking.customerId !== user.userCode) {
        throw new ForbiddenException(SalesErrorMessage.CUSTOMER_MISMATCH);
      }
      return;
    }
    await this.companyAccess.assertCompanyAccess(user, booking.companyId);
  }

  private assertCustomerAccess(
    user: UserDecoratorDtoResponse,
    customerId: string,
  ) {
    if (user.role === UserRole.USER && customerId !== user.userCode) {
      throw new ForbiddenException(SalesErrorMessage.CUSTOMER_MISMATCH);
    }
  }
}
