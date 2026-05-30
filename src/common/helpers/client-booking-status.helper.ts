import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import {
  BookingStatus,
  PaymentStatus,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';

export type ClientBookingDisplayStatus =
  | 'HOLD'
  | 'EXPIRED'
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'CANCELLED'
  | string;

/** Trạng thái hiển thị client — đồng bộ logic với CMS resolveUiStatus. */
export function resolveClientBookingStatus(
  booking: TbBooking,
  ticket?: TbTicket | null,
  payment?: TbPayment | null,
): ClientBookingDisplayStatus {
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.EXPIRED ||
    ticket?.status === TicketStatus.CANCELLED ||
    ticket?.status === TicketStatus.REFUNDED ||
    payment?.status === PaymentStatus.FAILED
  ) {
    return 'CANCELLED';
  }

  if (
    booking.status === BookingStatus.CONFIRMED ||
    ticket?.status === TicketStatus.PAID ||
    payment?.status === PaymentStatus.SUCCESS
  ) {
    return 'CONFIRMED';
  }

  if (
    booking.status === BookingStatus.CONVERTED &&
    ticket?.status === TicketStatus.PENDING
  ) {
    return 'PENDING_APPROVAL';
  }

  return booking.status;
}

export function toClientBookingStatusFe(status: string): string {
  if (status === 'CONFIRMED') return 'confirmed';
  if (status === 'PENDING_APPROVAL') return 'pending_approval';
  if (status === 'CANCELLED') return 'cancelled';
  return String(status).toLowerCase();
}

/** Lấy payment đại diện: ưu tiên FAILED (đã hủy) rồi SUCCESS, rồi mới nhất. */
export function pickRepresentativePayment(
  payments: TbPayment[],
): TbPayment | null {
  if (payments.length === 0) return null;
  return (
    payments.find((p) => p.status === PaymentStatus.FAILED) ??
    payments.find((p) => p.status === PaymentStatus.SUCCESS) ??
    payments[0]
  );
}
