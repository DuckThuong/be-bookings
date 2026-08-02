import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  BookingStatus,
  PaymentStatus,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import {
  CmsCustomerListItemDto,
  CmsCustomerListQueryDto,
  CmsCustomerListResponseDto,
  CmsCustomerStatus,
  CmsCustomerTier,
  CmsCustomerTripDto,
} from '../../dtos/CMS/CMS_customer.dto';
import { UserDecoratorDtoResponse, UserRole } from '../../dtos/user/common.dto';
import { UserInformationResponseDto } from '../../dtos/user/user.dto';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbTrip } from '../../entities/trip.entity';
import { CustomerRepository } from '../../repositories/customer.repository';
import { UserRepository } from '../../repositories/user.repository';
import { CompanyAccessService } from '../company-access.service';
import { CmsRoadValidationMessage } from '../../assets/messages/cms-road.message';

const MS_PER_DAY = 86_400_000;

@Injectable()
export class CMSCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly userRepository: UserRepository,
    private readonly companyAccess: CompanyAccessService,
    @InjectRepository(TbPayment)
    private readonly paymentRepo: Repository<TbPayment>,
    @InjectRepository(TbTicket)
    private readonly ticketRepo: Repository<TbTicket>,
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
  ) { }

  public async list(
    user: UserDecoratorDtoResponse,
    query: CmsCustomerListQueryDto,
  ): Promise<CmsCustomerListResponseDto> {
    if (Number(user.role) === Number(UserRole.ADMIN)) {
      return this.listAll(user, query);
    } else {
      return this.listCustomersForCompany(user, query);
    }
  }

  public async listCustomersForCompany(user: UserDecoratorDtoResponse,
    query: CmsCustomerListQueryDto,
  ): Promise<CmsCustomerListResponseDto> {
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);

    const customerIds =
      await this.customerRepository.findDistinctCustomerIdsByCompany(companyId);
    const profiles =
      await this.userRepository.findUsersByUserCodes(customerIds);

    const items = await Promise.all(
      profiles.map((profile) => this.buildCustomerItem(companyId, profile)),
    );

    const filtered = this.applyFilters(items, query);
    const summary = this.buildSummary(filtered);

    return {
      items: filtered,
      total: filtered.length,
      summary,
    };
  }

  public async listAll(
    user: UserDecoratorDtoResponse,
    query: CmsCustomerListQueryDto,
  ): Promise<CmsCustomerListResponseDto> {
    if (Number(user.role) !== Number(UserRole.ADMIN)) {
      throw new UnauthorizedException(CmsRoadValidationMessage.NO_PERMISSION);
    }
    const customer = await this.customerRepository.getAllCustomer();
    const profiles =
      await this.userRepository.findUsersByUserCodes(customer.map((c) => c.userCode));

    const items = await Promise.all(
      profiles.map((profile) => this.buildAdminCustomerItem(profile)),
    );

    console.log("items", items);

    const filtered = this.applyFilters(items, query);
    const summary = this.buildSummary(filtered);
    return {
      items: filtered,
      total: filtered.length,
      summary,
    };
  }

  async getDetail(
    user: UserDecoratorDtoResponse,
    userCode: string,
  ): Promise<CmsCustomerListItemDto | null> {
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);

    const customerIds =
      await this.customerRepository.findDistinctCustomerIdsByCompany(companyId);
    if (!customerIds.includes(userCode)) {
      return null;
    }

    const profile = await this.userRepository.findUserByUserCode(userCode);
    if (!profile) {
      return null;
    }

    return this.buildCustomerItem(companyId, profile);
  }

  private async buildCustomerItem(
    companyId: number,
    profile: UserInformationResponseDto,
  ): Promise<CmsCustomerListItemDto> {
    const activity = await this.customerRepository.getActivityByCompany(
      companyId,
      profile.userCode,
    );
    const recentTrips = await this.loadRecentTrips(companyId, profile.userCode);
    const preferredRoute = await this.resolvePreferredRoute(
      companyId,
      profile.userCode,
      recentTrips,
    );
    const rank = this.getRankInfo(activity.totalPaid);
    const tier = this.resolveTier(activity.bookingCount, activity.totalPaid);
    const status = this.resolveStatus(activity.lastActivityAt);
    const lastBooking = activity.lastActivityAt
      ? this.formatDateTime(activity.lastActivityAt)
      : '—';

    return {
      key: profile.userCode,
      id: profile.userCode,
      name: profile.userName || profile.userCode,
      phone: profile.userPhone || '—',
      email: profile.userEmail || '—',
      tier,
      rank,
      bookingCount: activity.bookingCount,
      totalSpent: activity.totalPaid,
      lastBooking,
      preferredRoute,
      status,
      note: this.buildNote(tier, status, preferredRoute),
      recentTrips,
    };
  }

  private async buildAdminCustomerItem(
    profile: UserInformationResponseDto,
  ): Promise<CmsCustomerListItemDto> {
    const activity = await this.customerRepository.getActivityByCompanyAdmin(
      profile.userCode
    );
    const recentTrips = await this.loadAdminRecentTrips(profile.userCode);
    const preferredRoute = await this.resolvePreferredRouteAdmin(
      profile.userCode,
      recentTrips,
    );
    const rank = this.getRankInfo(activity.totalPaid);
    const tier = this.resolveTier(activity.bookingCount, activity.totalPaid);
    const status = this.resolveStatus(activity.lastActivityAt);
    const lastBooking = activity.lastActivityAt
      ? this.formatDateTime(activity.lastActivityAt)
      : '—';

    return {
      key: profile.userCode,
      id: profile.userCode,
      name: profile.userName || profile.userCode,
      phone: profile.userPhone || '—',
      email: profile.userEmail || '—',
      tier,
      rank,
      bookingCount: activity.bookingCount,
      totalSpent: activity.totalPaid,
      lastBooking,
      preferredRoute,
      status,
      note: this.buildNote(tier, status, preferredRoute),
      recentTrips,
    };
  }

  private async loadAdminRecentTrips(
    customerId: string,
    limit = 5,
  ): Promise<CmsCustomerTripDto[]> {
    const payments = await this.paymentRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    if (payments.length === 0) {
      return [];
    }

    const ticketIds = [
      ...new Set(payments.map((p) => p.ticketId).filter(Boolean)),
    ];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const bookingIds = [
      ...new Set(
        tickets
          .map((t) => t.bookingId)
          .filter((id): id is number => id != null),
      ),
    ];
    const bookings =
      bookingIds.length > 0
        ? await this.bookingRepo.find({ where: { id: In(bookingIds) } })
        : [];
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));

    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
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

    return payments.map((payment) => {
      const ticket = ticketMap.get(payment.ticketId) ?? null;
      const booking = ticket?.bookingId
        ? (bookingMap.get(ticket.bookingId) ?? null)
        : null;
      const trip = ticket ? (tripMap.get(ticket.tripId) ?? null) : null;
      const road = trip ? (roadMap.get(trip.roadId) ?? null) : null;
      const route =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip?.name ?? '—');

      return {
        id: ticket?.code
          ? `#${ticket.code}`
          : booking?.code
            ? `#${booking.code}`
            : `#PAY-${payment.id}`,
        route,
        date: this.formatDate(payment.createdAt),
        amount: Number(payment.amount),
        status: this.resolveTripStatus(payment, ticket, booking),
      };
    });
  }

  private async resolvePreferredRouteAdmin(
    customerId: string,
    recentTrips: CmsCustomerTripDto[],
  ): Promise<string> {
    const tickets = await this.ticketRepo.find({
      where: { customerId },
      select: ['tripId'],
    });
    if (tickets.length === 0) {
      return recentTrips[0]?.route ?? '—';
    }

    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
    const trips = await this.tripRepo.find({ where: { id: In(tripIds) } });
    const roadIds = [...new Set(trips.map((t) => t.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((r) => [r.id, r]));

    const routeCounts = new Map<string, number>();
    for (const trip of trips) {
      const road = roadMap.get(trip.roadId);
      const label =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip.name ?? '—');
      routeCounts.set(label, (routeCounts.get(label) ?? 0) + 1);
    }

    let bestRoute = '—';
    let bestCount = 0;
    for (const [route, count] of routeCounts) {
      if (count > bestCount) {
        bestRoute = route;
        bestCount = count;
      }
    }
    return bestRoute;
  }

  private async loadRecentTrips(
    companyId: number,
    customerId: string,
    limit = 5,
  ): Promise<CmsCustomerTripDto[]> {
    const payments = await this.paymentRepo.find({
      where: { companyId, customerId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    if (payments.length === 0) {
      return [];
    }

    const ticketIds = [
      ...new Set(payments.map((p) => p.ticketId).filter(Boolean)),
    ];
    const tickets =
      ticketIds.length > 0
        ? await this.ticketRepo.find({ where: { id: In(ticketIds) } })
        : [];
    const ticketMap = new Map(tickets.map((t) => [t.id, t]));

    const bookingIds = [
      ...new Set(
        tickets
          .map((t) => t.bookingId)
          .filter((id): id is number => id != null),
      ),
    ];
    const bookings =
      bookingIds.length > 0
        ? await this.bookingRepo.find({ where: { id: In(bookingIds) } })
        : [];
    const bookingMap = new Map(bookings.map((b) => [b.id, b]));

    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
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

    return payments.map((payment) => {
      const ticket = ticketMap.get(payment.ticketId) ?? null;
      const booking = ticket?.bookingId
        ? (bookingMap.get(ticket.bookingId) ?? null)
        : null;
      const trip = ticket ? (tripMap.get(ticket.tripId) ?? null) : null;
      const road = trip ? (roadMap.get(trip.roadId) ?? null) : null;
      const route =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip?.name ?? '—');

      return {
        id: ticket?.code
          ? `#${ticket.code}`
          : booking?.code
            ? `#${booking.code}`
            : `#PAY-${payment.id}`,
        route,
        date: this.formatDate(payment.createdAt),
        amount: Number(payment.amount),
        status: this.resolveTripStatus(payment, ticket, booking),
      };
    });
  }

  private async resolvePreferredRoute(
    companyId: number,
    customerId: string,
    recentTrips: CmsCustomerTripDto[],
  ): Promise<string> {
    const tickets = await this.ticketRepo.find({
      where: { companyId, customerId },
      select: ['tripId'],
    });
    if (tickets.length === 0) {
      return recentTrips[0]?.route ?? '—';
    }

    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
    const trips = await this.tripRepo.find({ where: { id: In(tripIds) } });
    const roadIds = [...new Set(trips.map((t) => t.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((r) => [r.id, r]));

    const routeCounts = new Map<string, number>();
    for (const trip of trips) {
      const road = roadMap.get(trip.roadId);
      const label =
        road?.startPoint && road?.endPoint
          ? `${road.startPoint} → ${road.endPoint}`
          : (trip.name ?? '—');
      routeCounts.set(label, (routeCounts.get(label) ?? 0) + 1);
    }

    let bestRoute = '—';
    let bestCount = 0;
    for (const [route, count] of routeCounts) {
      if (count > bestCount) {
        bestRoute = route;
        bestCount = count;
      }
    }
    return bestRoute;
  }

  private getRankInfo(totalPaid: number) {
    if (totalPaid >= 15_000_000) {
      return 'Platinum';
    }
    if (totalPaid >= 5_000_000) {
      return 'Gold';
    }
    if (totalPaid >= 1_000_000) {
      return 'Silver';
    }
    return 'Bronze';
  }

  private resolveTier(
    bookingCount: number,
    totalPaid: number,
  ): CmsCustomerTier {
    if (totalPaid >= 15_000_000 || bookingCount >= 20) {
      return 'vip';
    }
    if (totalPaid >= 5_000_000 || bookingCount >= 10) {
      return 'than-thiet';
    }
    return 'pho-thong';
  }

  private resolveStatus(lastActivityAt: Date | null): CmsCustomerStatus {
    if (!lastActivityAt) {
      return 'inactive';
    }
    const daysSince = (Date.now() - lastActivityAt.getTime()) / MS_PER_DAY;
    if (daysSince > 90) {
      return 'inactive';
    }
    if (daysSince > 30) {
      return 'at-risk';
    }
    return 'active';
  }

  private resolveTripStatus(
    payment: TbPayment,
    ticket: TbTicket | null,
    booking: TbBooking | null,
  ): string {
    if (
      payment.status === PaymentStatus.FAILED ||
      booking?.status === BookingStatus.CANCELLED ||
      ticket?.status === TicketStatus.CANCELLED
    ) {
      return 'cancelled';
    }
    if (
      payment.status === PaymentStatus.SUCCESS &&
      ticket?.status === TicketStatus.PAID
    ) {
      return 'completed';
    }
    if (ticket?.status === TicketStatus.PENDING) {
      return 'pending';
    }
    return 'processing';
  }

  private buildNote(
    tier: CmsCustomerTier,
    status: CmsCustomerStatus,
    preferredRoute: string,
  ): string {
    if (status === 'inactive') {
      return 'Khách chưa có giao dịch gần đây — nên gửi ưu đãi tái kích hoạt.';
    }
    if (status === 'at-risk') {
      return 'Tần suất đặt vé giảm — cần chăm sóc và nhắc lịch tuyến quen.';
    }
    if (tier === 'vip') {
      return `Khách VIP, thường đi tuyến ${preferredRoute}.`;
    }
    if (tier === 'than-thiet') {
      return `Khách thân thiết, ưu tiên tuyến ${preferredRoute}.`;
    }
    return preferredRoute !== '—' ? `Tuyến ưa thích: ${preferredRoute}.` : '';
  }

  private applyFilters(
    items: CmsCustomerListItemDto[],
    query: CmsCustomerListQueryDto,
  ) {
    let result = items;

    const keyword = query.search?.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.phone.includes(keyword) ||
          item.id.toLowerCase().includes(keyword) ||
          item.email.toLowerCase().includes(keyword),
      );
    }

    if (query.tier && query.tier !== 'all') {
      result = result.filter((item) => item.tier === query.tier);
    }

    if (query.status && query.status !== 'all') {
      result = result.filter((item) => item.status === query.status);
    }

    return result.sort(
      (a, b) => b.totalSpent - a.totalSpent || b.bookingCount - a.bookingCount,
    );
  }

  private buildSummary(items: CmsCustomerListItemDto[]) {
    return {
      totalCustomers: items.length,
      vipCount: items.filter((item) => item.tier === 'vip').length,
      activeCount: items.filter((item) => item.status === 'active').length,
      totalSpent: items.reduce((sum, item) => sum + item.totalSpent, 0),
    };
  }

  private formatDateTime(value: Date): string {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private formatDate(value: Date): string {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
