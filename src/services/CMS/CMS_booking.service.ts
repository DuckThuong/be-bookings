import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { resolveCmsBookingUiStatus } from '../../common/cms/booking-ui-status';
import { CLIENT_BOOKING_CATALOG } from '../../assets/config/client-booking.config';
import {
  CmsBookingListItemDto,
  CmsBookingListQueryDto,
  CmsBookingListResponseDto,
  CmsBookingVehicleSidebarDto,
} from '../../dtos/CMS/CMS_booking.dto';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbSeat } from '../../entities/seat.entity';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { CompanyAccessService } from '../company-access.service';
import { PaymentService } from '../sales/payment.service';
import { ConfirmPaymentDto } from '../../dtos/sales/sales.dto';

const PICKUP_LABELS = Object.fromEntries(
  CLIENT_BOOKING_CATALOG.pickupPoints.map((p) => [p.value, p.label]),
);
const DROPOFF_LABELS = Object.fromEntries(
  CLIENT_BOOKING_CATALOG.dropoffPoints.map((p) => [p.value, p.label]),
);

@Injectable()
export class CMSBookingService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly companyAccess: CompanyAccessService,
    private readonly paymentService: PaymentService,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
    @InjectRepository(TbSeat)
    private readonly seatRepo: Repository<TbSeat>,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
  ) {}

  async list(
    user: UserDecoratorDtoResponse,
    query: CmsBookingListQueryDto,
  ): Promise<CmsBookingListResponseDto> {
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);

    const payments = await this.paymentRepository.findByFilter({
      companyId,
    });

    const items = await this.mapPaymentsToListItems(payments);
    const filtered = this.applyListFilters(items, query);
    const vehicles = await this.buildVehicleSidebar(companyId, items);

    return {
      items: filtered,
      total: filtered.length,
      vehicles,
    };
  }

  async getDetail(user: UserDecoratorDtoResponse, paymentId: number) {
    const payment = await this.paymentService.findOne(user, paymentId);
    const items = await this.mapPaymentsToListItems([payment]);
    return items[0] ?? null;
  }

  async confirm(
    user: UserDecoratorDtoResponse,
    paymentId: number,
    payload: ConfirmPaymentDto,
  ) {
    return this.paymentService.confirm(user, paymentId, payload);
  }

  async reject(
    user: UserDecoratorDtoResponse,
    paymentId: number,
    _reason?: string,
  ) {
    return this.paymentService.rejectApproval(user, paymentId);
  }

  private async mapPaymentsToListItems(
    payments: TbPayment[],
  ): Promise<CmsBookingListItemDto[]> {
    if (payments.length === 0) return [];

    const ticketIds = [...new Set(payments.map((p) => p.ticketId))];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const bookingIds = [
      ...new Set(
        [...ticketMap.values()]
          .map((t) => t.bookingId)
          .filter((id): id is number => id != null),
      ),
    ];
    const bookings =
      bookingIds.length > 0
        ? (
            await Promise.all(
              bookingIds.map((id) => this.bookingRepository.findById(id)),
            )
          ).filter((b): b is TbBooking => b != null)
        : [];
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));

    const tripIds = [...new Set(payments.map((p) => p.tripId))];
    const trips =
      tripIds.length > 0
        ? await this.tripRepo.find({ where: { id: In(tripIds) } })
        : [];
    const tripMap = new Map(trips.map((t) => [t.id, t]));

    const roadIds = [...new Set(trips.map((t) => t.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((r) => [r.id, r]));

    const vehicleIds = [...new Set(trips.map((t) => t.vehicleId))];
    const vehicles =
      vehicleIds.length > 0
        ? await this.vehicleRepo.find({ where: { id: In(vehicleIds) } })
        : [];
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    const allSeatIds = new Set<number>();
    for (const ticket of ticketMap.values()) {
      (ticket.seatIds ?? []).forEach((id) => allSeatIds.add(id));
    }
    const seats =
      allSeatIds.size > 0
        ? await this.seatRepo.find({
            where: { id: In([...allSeatIds]) },
          })
        : [];
    const seatMap = new Map(seats.map((s) => [s.id, s]));

    return payments.map((payment) => {
      const ticket = ticketMap.get(payment.ticketId) ?? null;
      const booking = ticket?.bookingId
        ? (bookingMap.get(ticket.bookingId) ?? null)
        : null;
      const trip = tripMap.get(payment.tripId) ?? null;
      const road = trip ? (roadMap.get(trip.roadId) ?? null) : null;
      const vehicle = trip ? (vehicleMap.get(trip.vehicleId) ?? null) : null;

      const seatLabels = (ticket?.seatIds ?? [])
        .map((id) => seatMap.get(id)?.name ?? seatMap.get(id)?.code)
        .filter((label): label is string => Boolean(label));

      const passenger = booking?.passenger;
      const route =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip?.name ?? '—');

      return {
        key: String(payment.id),
        id: ticket?.code
          ? `#${ticket.code}`
          : booking?.code
            ? `#${booking.code}`
            : `#PAY-${payment.id}`,
        paymentId: payment.id,
        bookingId: booking?.id,
        ticketId: ticket?.id,
        vehicleId: vehicle ? String(vehicle.id) : 'unknown',
        customer: passenger?.fullName ?? payment.customerId,
        phone: passenger?.phone ?? '—',
        route,
        departure: trip?.departure ?? '—',
        arrival: trip?.arrival ?? '—',
        seats: seatLabels,
        seatCount: ticket?.totalSeat ?? seatLabels.length,
        amount: Number(payment.amount),
        status: resolveCmsBookingUiStatus(payment, ticket, booking),
        bookedAt: this.formatDateTime(payment.createdAt),
        note: '',
        pickup: passenger?.pickupPoint ?? '—',
        dropoff: passenger?.dropoffPoint ?? '—',
        paymentMethod: booking?.paymentMethodId ?? payment.method,
      };
    });
  }

  private applyListFilters(
    items: CmsBookingListItemDto[],
    query: CmsBookingListQueryDto,
  ) {
    let result = items;

    if (query.status && query.status !== 'all') {
      result = result.filter((item) => item.status === query.status);
    }

    if (query.vehicleId && query.vehicleId !== 'all') {
      result = result.filter((item) => item.vehicleId === query.vehicleId);
    }

    const keyword = query.search?.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(keyword) ||
          item.customer.toLowerCase().includes(keyword) ||
          item.phone.includes(keyword) ||
          item.route.toLowerCase().includes(keyword),
      );
    }

    return result;
  }

  private async buildVehicleSidebar(
    companyId: number,
    items: CmsBookingListItemDto[],
  ): Promise<CmsBookingVehicleSidebarDto[]> {
    const vehicles = await this.vehicleRepo.find({
      where: { companyId },
      order: { id: 'ASC' },
    });

    const countByVehicle = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.vehicleId] = (acc[item.vehicleId] ?? 0) + 1;
      return acc;
    }, {});

    const sidebar: CmsBookingVehicleSidebarDto[] = [
      {
        id: 'all',
        label: 'Tất cả xe',
        icon: '🚌',
        count: items.length,
      },
    ];

    for (const vehicle of vehicles) {
      const id = String(vehicle.id);
      sidebar.push({
        id,
        label: vehicle.code,
        icon: '🚌',
        type: vehicle.type,
        count: countByVehicle[id] ?? 0,
        status: vehicle.status,
      });
    }

    return sidebar;
  }

  private formatDateTime(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
