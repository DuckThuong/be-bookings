export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYOS = 'PAYOS',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
}

export const PAYMENT_METHOD_DISPLAY = {
  [PaymentMethod.CASH]: 'Tiền mặt',
  [PaymentMethod.PAYOS]: 'PayOS (VietQR)',
} as const;
