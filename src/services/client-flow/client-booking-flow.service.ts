import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { CompanyRepository } from '../../repositories/company.repository';
import { ClientCatalogRepository } from '../../repositories/client-catalog.repository';
import { ClientEnrichmentService } from '../client-enrichment.service';
import { ClientSeatFlowService } from './client-seat-flow.service';
import { ClientHoldBookingDto } from '../../dtos/client/booking-flow.dto';
import {
  BookingStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { CODE_PREFIX, EntityStatus } from '../../assets/constants/company.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../../dtos/user/common.dto';
import { CompanyAccessService } from '../company-access.service';

const DEFAULT_HOLD_MINUTES = 15;

@Injectable()
export class ClientBookingFlowService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly catalogRepository: ClientCatalogRepository,
    private readonly enrichment: ClientEnrichmentService,
    private readonly seatFlow: ClientSeatFlowService,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  /** Bước 1: Giữ chỗ */
  async hold(user: UserDecoratorDtoResponse, payload: ClientHoldBookingDto) {
    const customerId = this.resolveCustomerId(user, payload.customerId);
    const companyTrip = await this.validateAndPrepareHold(
      user,
      payload,
      customerId,
    );

    const holdMinutes = payload.holdMinutes ?? DEFAULT_HOLD_MINUTES;
    const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
    const pricePerSeat = Number(companyTrip.pricePerSeat);
    const totalSeat = payload.seatIds.length;
    const discount = payload.discountAmount ?? 0;
    const subtotal = pricePerSeat * totalSeat;

    const booking = await this.bookingRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.BOOKING),
      companyId: payload.companyId,
      companyTripId: payload.companyTripId,
      tripId: payload.tripId,
      customerId,
      seatIds: payload.seatIds,
      totalSeat,
      pricePerSeat,
      subtotal,
      discountAmount: discount,
      totalPrice: subtotal - discount,
      promoCode: payload.promoCode ?? undefined,
      status: BookingStatus.HOLD,
      holdExpiresAt,
    });

    return this.enrichment.enrichBookingDetail(booking);
  }

  /** Bước 2: Chuyển giữ chỗ → vé (PENDING) */
  async convertToTicket(user: UserDecoratorDtoResponse, bookingId: number) {
    const booking = await this.getBookingOrThrow(bookingId);
    await this.assertBookingOwner(user, booking);

    if (booking.status !== BookingStatus.HOLD) {
      throw new HttpException(
        SalesErrorMessage.BOOKING_NOT_HOLD,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (new Date() > new Date(booking.holdExpiresAt)) {
      await this.bookingRepository.update(bookingId, {
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

    await this.bookingRepository.update(bookingId, {
      status: BookingStatus.CONVERTED,
      ticketId: ticket.id,
    });

    const updatedBooking = await this.bookingRepository.findById(bookingId);
    return {
      booking: updatedBooking
        ? await this.enrichment.enrichBookingDetail(updatedBooking)
        : null,
      ticket: await this.enrichment.enrichTicketDetail(ticket),
    };
  }

  /** Hủy giữ chỗ */
  async cancel(user: UserDecoratorDtoResponse, bookingId: number) {
    const booking = await this.getBookingOrThrow(bookingId);
    await this.assertBookingOwner(user, booking);

    if (booking.status === BookingStatus.CONVERTED) {
      throw new HttpException(
        SalesErrorMessage.BOOKING_ALREADY_CONVERTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });
    const updated = await this.bookingRepository.findById(bookingId);
    return {
      message: 'Đã hủy đặt chỗ',
      booking: updated
        ? await this.enrichment.enrichBookingDetail(updated)
        : null,
    };
  }

  async getDetail(user: UserDecoratorDtoResponse, bookingId: number) {
    const booking = await this.getBookingOrThrow(bookingId);
    await this.assertBookingOwner(user, booking);
    return this.enrichment.enrichBookingDetail(booking);
  }

  private async validateAndPrepareHold(
    user: UserDecoratorDtoResponse,
    payload: ClientHoldBookingDto,
    customerId: string,
  ) {
    if (!payload.seatIds?.length) {
      throw new HttpException(
        ClientErrorMessage.SEAT_IDS_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const company = await this.companyRepository.findCompanyById(
      payload.companyId,
    );
    if (!company || company.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_NOT_FOUND);
    }

    const companyTrip = await this.companyTripRepository.findById(
      payload.companyTripId,
    );
    if (
      !companyTrip ||
      companyTrip.companyId !== payload.companyId ||
      companyTrip.status !== EntityStatus.ACTIVE
    ) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }

    if (companyTrip.tripId !== payload.tripId) {
      throw new HttpException(
        ClientErrorMessage.TRIP_MISMATCH,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role !== UserRole.USER) {
      await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    }

    const availability = await this.seatFlow.getAvailability(
      payload.companyTripId,
    );
    const availableIds = new Set(
      availability.seats
        .filter((s) => s.isAvailable)
        .map((s) => s.id),
    );

    for (const seatId of payload.seatIds) {
      if (!availableIds.has(seatId)) {
        throw new HttpException(
          ClientErrorMessage.SEAT_NOT_AVAILABLE,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const remaining = companyTrip.totalSeat - companyTrip.totalSeatBooked;
    if (payload.seatIds.length > remaining) {
      throw new HttpException(
        ClientErrorMessage.NOT_ENOUGH_SEATS,
        HttpStatus.BAD_REQUEST,
      );
    }

    return companyTrip;
  }

  private resolveCustomerId(
    user: UserDecoratorDtoResponse,
    customerIdQuery?: string,
  ): string {
    if (user.role === UserRole.USER) {
      return user.userCode;
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
      if (!customerIdQuery?.trim()) {
        throw new HttpException(
          ClientErrorMessage.CUSTOMER_ID_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }
      return customerIdQuery.trim();
    }
    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }

  private async getBookingOrThrow(id: number) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(SalesErrorMessage.BOOKING_NOT_FOUND);
    }
    return booking;
  }

  private async assertBookingOwner(
    user: UserDecoratorDtoResponse,
    booking: { customerId: string; companyId: number },
  ) {
    if (user.role === UserRole.USER) {
      if (booking.customerId !== user.userCode) {
        throw new ForbiddenException(SalesErrorMessage.CUSTOMER_MISMATCH);
      }
      return;
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role === UserRole.OWNER) {
      await this.companyAccess.assertCompanyAccess(user, booking.companyId);
      return;
    }
    throw new ForbiddenException(SalesErrorMessage.CUSTOMER_MISMATCH);
  }
}
