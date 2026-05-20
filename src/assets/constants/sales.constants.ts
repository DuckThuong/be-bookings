export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED',
}

export enum BookingStatus {
  HOLD = 'HOLD',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
  CANCELLED = 'CANCELLED',
}

export enum SettlementStatus {
  DRAFT = 'DRAFT',
  PAID = 'PAID',
}

export const SALES_CODE_PREFIX = {
  BOOKING: 'BKG',
  PAYMENT: 'PAY',
  REFUND: 'REF',
  SETTLEMENT: 'STL',
} as const;
