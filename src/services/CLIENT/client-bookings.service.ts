/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CLIENT_BOOKING_CATALOG,
  CLIENT_BOOKING_ENUMS,
  CLIENT_BOOKING_FLOW,
  CLIENT_BOOKING_META,
  PAYMENT_METHOD_LABELS,
} from '../../assets/config/client-booking.config';
import { CODE_PREFIX } from '../../assets/constants/company.constants';
import {
  BookingStatus,
  PaymentStatus,
  SALES_CODE_PREFIX,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { CompanyErrorMessage } from '../../assets/messages/company.message';
import { SalesErrorMessage } from '../../assets/messages/sales.message';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbBasicUser } from '../../entities/user/basic-user.entity';
import { TbInfoUser } from '../../entities/user/info-user.entity';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { TicketRepository } from '../../repositories/ticket.repository';
import { CompanyAccessService } from '../company-access.service';
import { ClientBookingPricingService } from './client-booking-pricing.service';
import { ClientBookingSeatMapService } from './client-booking-seat-map.service';
import { ClientBookingTripResolverService } from './client-booking-trip-resolver.service';
import {
  CreateHoldDto,
  PassengerDto,
  ValidatePromoDto,
} from '../../dtos/CLIENT/bookings.dto';
import { ConfirmPaymentDto } from '../../dtos/sales/sales.dto';

@Injectable()
export class ClientBookingsService {
  constructor(
    private readonly tripResolver: ClientBookingTripResolverService,
    private readonly seatMapService: ClientBookingSeatMapService,
    private readonly pricingService: ClientBookingPricingService,
    private readonly bookingRepository: BookingRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly companyAccess: CompanyAccessService,
    private readonly companyTripRepository: CompanyTripRepository,
    @InjectRepository(TbBasicUser)
    private readonly basicUserRepo: Repository<TbBasicUser>,
    @InjectRepository(TbInfoUser)
    private readonly infoUserRepo: Repository<TbInfoUser>,
  ) {}

  getConfig() {
    return {
      meta: CLIENT_BOOKING_META,
      flow: CLIENT_BOOKING_FLOW,
      enums: CLIENT_BOOKING_ENUMS,
      catalog: CLIENT_BOOKING_CATALOG,
    };
  }

  async getTripContext(user: UserDecoratorDtoResponse, tripId: string) {
    const ctx = await this.tripResolver.resolve(tripId);
    const profile = await this.loadUserProfile(user);
    const trip = this.tripResolver.buildTripDto(ctx);

    return {
      user: profile,
      trip,
      passengerDefaults: {
        fullName: profile.userName,
        phone: profile.phone,
        pickupPoint: CLIENT_BOOKING_CATALOG.pickupPoints[0]?.value ?? '',
        dropoffPoint: CLIENT_BOOKING_CATALOG.dropoffPoints[0]?.value ?? '',
      },
      catalog: this.tripResolver.getCatalogSlice(),
    };
  }

  async getSeatMap(tripId: string, vehicleType: string, floor = 1) {
    const ctx = await this.tripResolver.resolve(tripId);
    const map = await this.seatMapService.buildSeatMap(ctx, vehicleType, floor);
    return {
      tripId: map.tripId,
      vehicleType: map.vehicleType,
      floor: map.floor,
      rows: map.rows,
    };
  }

  validatePromo(payload: ValidatePromoDto) {
    return this.pricingService.validatePromo(
      payload.promoCode,
      payload.subTotal,
      payload.addonsTotal,
    );
  }

  async createHold(user: UserDecoratorDtoResponse, payload: CreateHoldDto) {
    const ctx = await this.tripResolver.resolve(payload.tripId);
    const customerId = this.resolveCustomerId(user, payload.customerId);
    const maxSeats = CLIENT_BOOKING_META.maxSeatsPerBooking;

    if (!payload.seatIds?.length) {
      throw new HttpException(
        ClientErrorMessage.SEAT_IDS_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.seatIds.length > maxSeats) {
      throw new HttpException(
        ClientErrorMessage.MAX_SEATS_EXCEEDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role !== UserRole.USER) {
      await this.companyAccess.assertCompanyAccess(
        user,
        ctx.companyTrip.companyId,
      );
    }

    const floor = payload.floor ?? 1;
    const seatMap = await this.seatMapService.buildSeatMap(
      ctx,
      payload.vehicleType,
      floor,
    );

    let numericSeatIds: number[];
    try {
      numericSeatIds = this.seatMapService.resolveSeatIds(
        payload.seatIds,
        seatMap.seatCodeToId,
      );
    } catch {
      throw new HttpException(
        ClientErrorMessage.SEAT_NOT_AVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const row of seatMap.rows) {
      for (const seat of row.seats) {
        if (!seat) continue;
        if (payload.seatIds.includes(seat.id) && seat.status === 'vip') {
          throw new HttpException(
            ClientErrorMessage.VIP_SEAT_NOT_SELECTABLE,
            HttpStatus.BAD_REQUEST,
          );
        }
        if (payload.seatIds.includes(seat.id) && seat.status === 'booked') {
          throw new HttpException(
            ClientErrorMessage.SEAT_NOT_AVAILABLE,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const remaining =
      ctx.companyTrip.totalSeat - ctx.companyTrip.totalSeatBooked;
    if (payload.seatIds.length > remaining) {
      throw new HttpException(
        ClientErrorMessage.NOT_ENOUGH_SEATS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedAddons = this.pricingService.normalizeAddons(
      payload.addons ?? [],
    );
    const pricing = this.pricingService.calcPricing({
      seatCount: payload.seatIds.length,
      unitPrice: ctx.unitPrice,
      addons: normalizedAddons,
      promoCode: payload.promoCode,
    });

    const holdSeconds =
      payload.holdSeconds ?? CLIENT_BOOKING_META.holdSecondsDefault;
    const holdExpiresAt = new Date(Date.now() + holdSeconds * 1000);

    const booking = await this.bookingRepository.save({
      code: generateEntityCode(SALES_CODE_PREFIX.BOOKING),
      companyId: ctx.companyTrip.companyId,
      companyTripId: ctx.companyTrip.id,
      tripId: ctx.trip.id,
      customerId,
      seatIds: numericSeatIds,
      totalSeat: payload.seatIds.length,
      pricePerSeat: ctx.unitPrice,
      subtotal: pricing.subTotal,
      serviceFee: pricing.fee,
      addonsTotal: pricing.addonsTotal,
      discountAmount: pricing.promoDiscount,
      totalPrice: pricing.total,
      promoCode: pricing.promoCode ?? undefined,
      addons: normalizedAddons,
      passenger: payload.passenger ?? null,
      vehicleType: payload.vehicleType,
      floor,
      status: BookingStatus.HOLD,
      holdExpiresAt,
    });

    return {
      holdId: booking.code,
      holdSeconds,
      expiresAt: holdExpiresAt.toISOString(),
      pricing,
      bookingDraft: await this.toBookingDraft(booking, ctx),
    };
  }

  async updatePassenger(
    user: UserDecoratorDtoResponse,
    holdId: string,
    passenger: PassengerDto,
  ) {
    const booking = await this.getHoldBooking(holdId);
    await this.assertBookingOwner(user, booking);
    await this.bookingRepository.update(booking.id, { passenger });
    const updated = await this.bookingRepository.findById(booking.id);
    const ctx = await this.tripResolver.resolve(String(booking.companyTripId));
    return this.toBookingDraft(updated!, ctx);
  }

  async confirmPayment(
    user: UserDecoratorDtoResponse,
    holdId: string,
    payload: ConfirmPaymentDto,
  ) {
    if (
      !CLIENT_BOOKING_ENUMS.paymentMethodId.includes(payload.paymentMethodId)
    ) {
      throw new HttpException(
        ClientErrorMessage.PAYMENT_METHOD_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }

    let booking = await this.getHoldBooking(holdId);
    await this.assertBookingOwner(user, booking);

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new HttpException(
        SalesErrorMessage.PAYMENT_ALREADY_SUCCESS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!booking.passenger?.fullName?.trim()) {
      throw new HttpException(
        ClientErrorMessage.PASSENGER_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Date() > new Date(booking.holdExpiresAt)) {
      await this.bookingRepository.update(booking.id, {
        status: BookingStatus.EXPIRED,
      });
      throw new HttpException(
        SalesErrorMessage.BOOKING_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ctx = await this.tripResolver.resolve(String(booking.companyTripId));

    let ticket = booking.ticketId
      ? await this.ticketRepository.findById(booking.ticketId)
      : null;

    if (!ticket) {
      ticket = await this.issueTicket(booking);
      booking = (await this.bookingRepository.findById(booking.id))!;
    }

    if (!ticket) {
      throw new NotFoundException(CompanyErrorMessage.TICKET_NOT_FOUND);
    }

    let payment = (await this.paymentRepository.findByTicketId(ticket.id)).find(
      (p) => p.status === PaymentStatus.PENDING,
    );

    if (!payment) {
      const rawMethod = payload.paymentMethodId ?? '';
      const methodStr = String(rawMethod);
      const method = methodStr
        ? methodStr.charAt(0).toUpperCase() + methodStr.slice(1)
        : methodStr;

      payment = await this.paymentRepository.save({
        code: generateEntityCode(SALES_CODE_PREFIX.PAYMENT),
        ticketId: ticket.id,
        companyTripId: booking.companyTripId,
        companyId: booking.companyId,
        customerId: booking.customerId,
        amount: booking.totalPrice,
        method,
        status: PaymentStatus.PENDING,
        transactionRef: payload.transactionRef,
      });
    }

    const paidAt = new Date();
    await this.paymentRepository.update(payment.id, {
      status: PaymentStatus.SUCCESS,
      paidAt,
      transactionRef: payload.transactionRef ?? payment.transactionRef,
    });

    await this.ticketRepository.update(ticket.id, {
      status: TicketStatus.PAID,
    });

    await this.bookingRepository.update(booking.id, {
      status: BookingStatus.CONFIRMED,
      paymentMethodId: payload.paymentMethodId,
      ticketId: ticket.id,
    });

    const freshTrip = await this.companyTripRepository.findById(
      booking.companyTripId,
    );
    if (freshTrip) {
      await this.companyTripRepository.update(freshTrip.id, {
        totalSeatBooked: freshTrip.totalSeatBooked + ticket.totalSeat,
        totalPrice: Number(freshTrip.totalPrice) + Number(ticket.totalPrice),
      });
    }

    const updatedBooking = await this.bookingRepository.findById(booking.id);
    const updatedPayment = await this.paymentRepository.findById(payment.id);

    return this.buildBookingResult(
      updatedBooking!,
      ticket,
      updatedPayment,
      ctx,
      payload.paymentMethodId,
    );
  }

  async getBookingResult(user: UserDecoratorDtoResponse, bookingId: string) {
    const booking =
      (await this.bookingRepository.findByCode(bookingId)) ??
      (await this.findBookingByNumericId(bookingId));

    if (!booking) {
      throw new NotFoundException(ClientErrorMessage.BOOKING_NOT_FOUND);
    }

    await this.assertBookingOwner(user, booking);

    const ticket = booking.ticketId
      ? await this.ticketRepository.findById(booking.ticketId)
      : null;

    const payments = ticket
      ? await this.paymentRepository.findByTicketId(ticket.id)
      : [];

    const payment =
      payments.find((p) => p.status === PaymentStatus.SUCCESS) ??
      payments[0] ??
      null;

    const ctx = await this.tripResolver.resolve(String(booking.companyTripId));

    return this.buildBookingResult(
      booking,
      ticket,
      payment,
      ctx,
      booking.paymentMethodId ?? 'card',
    );
  }

  private async issueTicket(booking: TbBooking): Promise<TbTicket> {
    if (booking.status === BookingStatus.CONVERTED && booking.ticketId) {
      const existing = await this.ticketRepository.findById(booking.ticketId);
      if (existing) return existing;
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

    await this.bookingRepository.update(booking.id, {
      status: BookingStatus.CONVERTED,
      ticketId: ticket.id,
    });

    return ticket;
  }

  private async buildBookingResult(
    booking: TbBooking,
    ticket: TbTicket | null,
    payment: TbPayment | null,
    ctx: Awaited<ReturnType<ClientBookingTripResolverService['resolve']>>,
    paymentMethodId: string,
  ) {
    const trip = this.tripResolver.buildTripDto(ctx);
    const seats = await this.mapBookingSeats(booking, ctx);
    const pricing = this.buildPricingFromBooking(booking);
    const pickup = CLIENT_BOOKING_CATALOG.pickupPoints.find(
      (p) => p.value === booking.passenger?.pickupPoint,
    );
    const dropoff = CLIENT_BOOKING_CATALOG.dropoffPoints.find(
      (p) => p.value === booking.passenger?.dropoffPoint,
    );
    const vehicle = CLIENT_BOOKING_CATALOG.vehicles.find(
      (v) => v.type === booking.vehicleType,
    );
    const hasInsurance = (booking.addons ?? []).some(
      (a) => a.id === 'insurance',
    );

    const status =
      booking.status === BookingStatus.CONFIRMED ||
      ticket?.status === TicketStatus.PAID
        ? 'CONFIRMED'
        : booking.status;

    return {
      bookingId: ticket?.code ?? booking.code,
      status,
      holdId: booking.code,
      trip,
      passenger: booking.passenger,
      seats,
      addons: booking.addons ?? [],
      pricing,
      payment: {
        methodId: paymentMethodId,
        label: PAYMENT_METHOD_LABELS[paymentMethodId] ?? paymentMethodId,
        last4: payment?.transactionRef?.slice(-4),
      },
      ticket: {
        operatorShortName: ctx.company.code,
        busType: vehicle?.label ?? booking.vehicleType ?? '',
        rating: 4.8,
        hasInsurance,
        departStation: pickup?.label ?? trip.from,
        arriveStation: dropoff?.label ?? trip.to,
        stopsLabel: 'Thẳng, không dừng',
        boardAt: trip.departTime,
        alightAt: trip.arriveTime,
        qrCode: `QR${ticket?.code ?? booking.code}`,
      },
      notifications: this.buildNotifications(booking, ticket),
    };
  }

  private buildNotifications(booking: TbBooking, ticket: TbTicket | null) {
    const id = ticket?.code ?? booking.code;
    return [
      {
        id: `notif-${id}-1`,
        title: 'Vé đã gửi',
        desc: 'Vé điện tử đã gửi email',
        color: 'green' as const,
      },
      {
        id: `notif-${id}-2`,
        title: 'Xác nhận SMS',
        desc: 'Mã xác nhận đã gửi SĐT',
        color: 'amber' as const,
      },
    ];
  }

  private async mapBookingSeats(
    booking: TbBooking,
    ctx: Awaited<ReturnType<ClientBookingTripResolverService['resolve']>>,
  ) {
    const map = await this.seatMapService.buildSeatMap(
      ctx,
      booking.vehicleType ?? '16',
      booking.floor ?? 1,
    );
    const codeById = new Map<number, string>();
    map.seatCodeToId.forEach((id, code) => {
      if (!codeById.has(id)) codeById.set(id, code);
    });

    return (booking.seatIds ?? []).map((id) => ({
      id: codeById.get(id) ?? String(id),
      label: codeById.get(id) ?? String(id),
      status: 'booked' as const,
    }));
  }

  private buildPricingFromBooking(booking: TbBooking) {
    return {
      subTotal: Number(booking.subtotal),
      addonsTotal: Number(booking.addonsTotal ?? 0),
      fee: Number(booking.serviceFee ?? 0),
      promoCode: booking.promoCode ?? null,
      promoDiscount: Number(booking.discountAmount ?? 0),
      total: Number(booking.totalPrice),
    };
  }

  private async toBookingDraft(
    booking: TbBooking,
    ctx: Awaited<ReturnType<ClientBookingTripResolverService['resolve']>>,
  ) {
    const trip = this.tripResolver.buildTripDto(ctx);
    const seats = await this.mapBookingSeats(booking, ctx);
    const holdSeconds = Math.max(
      0,
      Math.floor(
        (new Date(booking.holdExpiresAt).getTime() - Date.now()) / 1000,
      ),
    );

    return {
      holdId: booking.code,
      tripId: trip.tripId,
      vehicleType: booking.vehicleType,
      floor: booking.floor ?? 1,
      seatIds: seats.map((s) => s.id),
      addons: booking.addons ?? [],
      promoCode: booking.promoCode ?? null,
      passenger: booking.passenger,
      pricing: this.buildPricingFromBooking(booking),
      holdSeconds,
    };
  }

  private async getHoldBooking(holdId: string): Promise<TbBooking> {
    const booking = await this.bookingRepository.findByCode(holdId);
    if (!booking) {
      throw new NotFoundException(ClientErrorMessage.HOLD_NOT_FOUND);
    }
    if (
      booking.status !== BookingStatus.HOLD &&
      booking.status !== BookingStatus.CONVERTED
    ) {
      throw new HttpException(
        SalesErrorMessage.BOOKING_NOT_HOLD,
        HttpStatus.BAD_REQUEST,
      );
    }
    return booking;
  }

  private async findBookingByNumericId(id: string) {
    const num = Number(id);
    if (Number.isNaN(num)) return null;
    return this.bookingRepository.findById(num);
  }

  private async loadUserProfile(user: UserDecoratorDtoResponse) {
    const [basic, info] = await Promise.all([
      this.basicUserRepo.findOne({ where: { userCode: user.userCode } }),
      this.infoUserRepo.findOne({ where: { userCode: user.userCode } }),
    ]);
    return {
      userName: info?.userName ?? user.userCode,
      phone: basic?.phone ?? '',
      notifCount: 0,
    };
  }

  private resolveCustomerId(
    user: UserDecoratorDtoResponse,
    customerIdQuery?: string,
  ): string {
    if (user.role === UserRole.USER) return user.userCode;
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

  private async assertBookingOwner(
    user: UserDecoratorDtoResponse,
    booking: TbBooking,
  ) {
    if (user.role === UserRole.USER) {
      if (booking.customerId !== user.userCode) {
        throw new ForbiddenException(SalesErrorMessage.CUSTOMER_MISMATCH);
      }
      return;
    }
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.OWNER) {
      await this.companyAccess.assertCompanyAccess(user, booking.companyId);
      return;
    }
    throw new ForbiddenException(ClientErrorMessage.FORBIDDEN);
  }
}
