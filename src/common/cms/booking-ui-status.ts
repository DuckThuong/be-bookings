import {
  BookingStatus,
  PaymentStatus,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';

export type CmsBookingUiStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'moving'
  | 'completed'
  | 'no_show';

export type DashboardBookingUiStatus =
  | 'completed'
  | 'moving'
  | 'pending'
  | 'cancelled';

const MOVING_WINDOW_DAYS = 3;

export function resolveCmsBookingUiStatus(
  payment: TbPayment,
  ticket: TbTicket | null,
  booking: TbBooking | null,
): CmsBookingUiStatus {
  if (
    payment.status === PaymentStatus.FAILED ||
    booking?.status === BookingStatus.CANCELLED ||
    ticket?.status === TicketStatus.CANCELLED
  ) {
    return 'cancelled';
  }

  if (
    booking?.status === BookingStatus.CONFIRMED &&
    ticket?.status === TicketStatus.PAID &&
    payment.status === PaymentStatus.SUCCESS
  ) {
    return 'confirmed';
  }

  if (
    payment.status === PaymentStatus.PENDING ||
    ticket?.status === TicketStatus.PENDING ||
    booking?.status === BookingStatus.CONVERTED
  ) {
    return 'pending';
  }

  return 'pending';
}

export function mapCmsStatusToDashboard(
  cmsStatus: CmsBookingUiStatus,
  payment: TbPayment,
): DashboardBookingUiStatus {
  if (cmsStatus === 'cancelled') return 'cancelled';
  if (cmsStatus === 'pending') return 'pending';

  if (cmsStatus === 'confirmed') {
    const anchor = payment.paidAt ?? payment.createdAt;
    const anchorDate = anchor instanceof Date ? anchor : new Date(anchor);
    const movingThreshold = new Date();
    movingThreshold.setDate(movingThreshold.getDate() - MOVING_WINDOW_DAYS);
    return anchorDate >= movingThreshold ? 'moving' : 'completed';
  }

  return 'pending';
}

export function resolveDashboardBookingUiStatus(
  payment: TbPayment,
  ticket: TbTicket | null,
  booking: TbBooking | null,
): DashboardBookingUiStatus {
  return mapCmsStatusToDashboard(
    resolveCmsBookingUiStatus(payment, ticket, booking),
    payment,
  );
}
