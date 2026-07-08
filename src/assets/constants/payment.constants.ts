export enum PaymentMethod {
  CASH = 'CASH',
  PAYOS = 'PAYOS',
}

export const PAYMENT_METHOD_DISPLAY = {
  [PaymentMethod.CASH]: 'Tiền mặt',
  [PaymentMethod.PAYOS]: 'PayOS (VietQR)',
} as const;
