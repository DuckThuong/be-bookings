export const CLIENT_BOOKING_META = {
  version: '1.0',
  currency: 'VND',
  locale: 'vi-VN',
  holdSecondsDefault: 600,
  maxSeatsPerBooking: 4,
  feeRate: 0.05,
  pickupAddonUnitPrice: 50000,
} as const;

export const CLIENT_BOOKING_FLOW = [
  { step: 1, code: 'SEAT_SELECTION', path: '/booking', name: 'Đặt ghế' },
  { step: 2, code: 'PASSENGER_INFO', path: '/booking-info', name: 'Thông tin hành khách' },
  {
    step: 3,
    code: 'CONFIRM_PAYMENT',
    path: '/booking-confirm',
    name: 'Xác nhận & thanh toán',
  },
  { step: 4, code: 'SUCCESS', path: '/booking-success', name: 'Hoàn tất' },
] as const;

export const CLIENT_BOOKING_ENUMS = {
  seatStatus: ['available', 'booked', 'vip'] as const,
  vehicleType: ['16', '36', '45'] as const,
  promoType: ['fixed', 'percent'] as const,
  paymentMethodId: ['card', 'ewallet', 'bank', 'cash'] as const,
  notifColor: ['green', 'amber', 'blue'] as const,
};

export interface ClientCatalogVehicle {
  type: string;
  label: string;
  floors: number;
  isSleeper: boolean;
  maxSeatsPerBooking: number;
}

export interface ClientCatalogAddon {
  id: string;
  name: string;
  price: number;
  hasQty: boolean;
  qtyMin?: number;
  qtyMax?: number;
}

export interface ClientCatalogPromo {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder?: number;
  max?: number;
}

export interface ClientCatalogPoint {
  value: string;
  label: string;
  city: string;
}

export const CLIENT_BOOKING_CATALOG = {
  vehicles: [
    {
      type: '16',
      label: 'Xe 16 chỗ',
      floors: 1,
      isSleeper: false,
      maxSeatsPerBooking: 4,
    },
    {
      type: '36',
      label: 'Giường nằm 36',
      floors: 2,
      isSleeper: true,
      maxSeatsPerBooking: 4,
    },
    {
      type: '45',
      label: 'Ghế ngồi 45',
      floors: 1,
      isSleeper: false,
      maxSeatsPerBooking: 4,
    },
  ] as ClientCatalogVehicle[],
  addonServices: [
    { id: 'insurance', name: 'Bảo hiểm chuyến đi', price: 30000, hasQty: false },
    { id: 'meal', name: 'Suất ăn cao cấp', price: 45000, hasQty: false },
    { id: 'baggage', name: 'Hành lý thêm', price: 0, hasQty: false },
    { id: 'pillow', name: 'Gối + chăn cao cấp', price: 15000, hasQty: false },
    {
      id: 'pickup',
      name: 'Đưa đón tận nơi',
      price: 50000,
      hasQty: true,
      qtyMin: 0,
      qtyMax: 4,
    },
  ] as ClientCatalogAddon[],
  promoCodes: [
    { code: 'RIDE50', type: 'fixed', value: 50000, minOrder: 300000 },
    { code: 'GORIDE10', type: 'percent', value: 0.1, max: 100000 },
    { code: 'NEWBIE', type: 'percent', value: 0.3, max: 150000 },
  ] as ClientCatalogPromo[],
  paymentMethods: [
    { id: 'card', name: 'Thẻ tín dụng / ghi nợ' },
    { id: 'ewallet', name: 'Ví điện tử' },
    { id: 'bank', name: 'Chuyển khoản ngân hàng' },
    { id: 'cash', name: 'Tiền mặt' },
  ],
  pickupPoints: [
    { value: 'mydinh', label: 'Mỹ Đình', city: 'Hà Nội' },
    { value: 'giapbat', label: 'Giáp Bát', city: 'Hà Nội' },
    { value: 'nuocngam', label: 'Nước Ngầm', city: 'Hà Nội' },
  ] as ClientCatalogPoint[],
  dropoffPoints: [
    { value: 'mienDong', label: 'Miền Đông', city: 'TP. Hồ Chí Minh' },
    { value: 'mienTay', label: 'Miền Tây', city: 'TP. Hồ Chí Minh' },
    { value: 'binhTrieu', label: 'Bình Triệu', city: 'TP. Hồ Chí Minh' },
  ] as ClientCatalogPoint[],
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Thẻ tín dụng / ghi nợ',
  ewallet: 'Ví điện tử',
  bank: 'Chuyển khoản ngân hàng',
  cash: 'Tiền mặt',
};
