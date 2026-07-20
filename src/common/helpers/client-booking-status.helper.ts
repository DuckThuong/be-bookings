import {
  BookingStatus,
  PaymentStatus,
} from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { formatDDMMYYYYHHmm } from '../formator/price.format';

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

export function getTimeTicket(createdAt: Date): string {
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, '0');

  const nowTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const createdTimeStr = `${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}:${pad(createdAt.getSeconds())}`;

  if (nowTimeStr < createdTimeStr) {
    return formatDDMMYYYYHHmm(createdAt);
  } else {
    const nextDay = new Date(createdAt);
    nextDay.setDate(nextDay.getDate() + 1);
    return formatDDMMYYYYHHmm(nextDay);
  }
}