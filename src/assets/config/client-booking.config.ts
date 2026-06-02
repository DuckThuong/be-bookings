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
  {
    step: 2,
    code: 'PASSENGER_INFO',
    path: '/booking-info',
    name: 'Thông tin hành khách',
  },
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
  icon: string;
  name: string;
  desc: string;
  price: number;
  hasQty: boolean;
  qtyMin?: number;
  qtyMax?: number;
}

export interface ClientCatalogPromo {
  code: string;
  icon: string;
  discount: string;
  desc: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder?: number;
  max?: number;
}

export interface ClientCatalogPolicy {
  icon: string;
  title: string;
  desc: string;
  tagLabel: string;
  tagVariant: 'green' | 'amber' | 'red';
}

export interface ClientCatalogOperatorAmenity {
  icon: string;
  label: string;
}

export interface ClientCatalogVehicleDisplay {
  icon: string;
  mapTitle: string;
  mapSub: string;
}

export interface ClientCatalogPoint {
  value: string;
  label: string;
  city: string;
}

export const CLIENT_BOOKING_BREADCRUMB = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Vé xe', href: '/booking' },
  { label: 'Chọn ghế', href: '/booking/seat' },
] as const;

export const CLIENT_BOOKING_VEHICLE_DISPLAY: Record<
  string,
  ClientCatalogVehicleDisplay
> = {
  '16': {
    icon: 'ti-car-suv',
    mapTitle: 'Xe 16 chỗ - Limousine SUV',
    mapSub: 'Chọn ghế bạn muốn ngồi. Tối đa 4 ghế mỗi lần đặt.',
  },
  '36': {
    icon: 'ti-bus',
    mapTitle: 'Giường nằm 38 chỗ - 2 tầng',
    mapSub: 'Xe 2 tầng, layout có lối đi và hàng cuối mở rộng.',
  },
  '45': {
    icon: 'ti-bus',
    mapTitle: 'Xe ghế ngồi 45 chỗ',
    mapSub: 'Ghế ngồi tiêu chuẩn, có điều hoà và wifi.',
  },
};

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
      label: 'Giường nằm 38',
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
    {
      id: 'insurance',
      icon: 'shield-check',
      name: 'Bảo hiểm chuyến đi',
      desc: 'Bồi thường đến 50 triệu - tai nạn, mất hành lý',
      price: 30000,
      hasQty: false,
    },
    {
      id: 'meal',
      icon: 'tools-kitchen-2',
      name: 'Suất ăn cao cấp',
      desc: 'Cơm hộp nóng giao tận ghế - Việt Nam / Hàn Quốc',
      price: 45000,
      hasQty: false,
    },
    {
      id: 'baggage',
      icon: 'luggage',
      name: 'Hành lý thêm',
      desc: 'Cho phép thêm 1 kiện <= 20 kg vào khoang xe',
      price: 0,
      hasQty: false,
    },
    {
      id: 'pillow',
      icon: 'bed',
      name: 'Gối + chăn cao cấp',
      desc: 'Bộ gối chăn fleece mềm, sạch - đảm bảo vệ sinh',
      price: 15000,
      hasQty: false,
    },
    {
      id: 'pickup',
      icon: 'map-pin',
      name: 'Đưa đón tận nơi',
      desc: 'Bán kính <= 5 km từ bến xe - đặt thêm sau khi chọn ghế',
      price: 50000,
      hasQty: true,
      qtyMin: 0,
      qtyMax: 4,
    },
  ] as ClientCatalogAddon[],
  promoCodes: [
    {
      code: 'RIDE50',
      icon: 'ti-ticket',
      discount: 'Giảm 50.000đ',
      desc: 'Đơn từ 300k',
      type: 'fixed',
      value: 50000,
      minOrder: 300000,
    },
    {
      code: 'GORIDE10',
      icon: 'ti-ticket',
      discount: 'Giảm 10%',
      desc: 'Tối đa 100k',
      type: 'percent',
      value: 0.1,
      max: 100000,
    },
    {
      code: 'NEWBIE',
      icon: 'ti-gift',
      discount: '-30% lần đầu',
      desc: 'Khách mới',
      type: 'percent',
      value: 0.3,
      max: 150000,
    },
  ] as ClientCatalogPromo[],
  policies: [
    {
      icon: 'clock-cancel',
      title: 'Huỷ vé',
      desc: 'Hoàn 80% nếu huỷ trước 24h khởi hành. Hoàn 50% nếu huỷ trước 6h.',
      tagLabel: 'Linh hoạt',
      tagVariant: 'green',
    },
    {
      icon: 'clock-edit',
      title: 'Đổi vé',
      desc: 'Đổi ngày / giờ miễn phí 1 lần, thực hiện trước 12h khởi hành.',
      tagLabel: '1 lần',
      tagVariant: 'amber',
    },
    {
      icon: 'backpack',
      title: 'Hành lý',
      desc: 'Miễn phí 1 kiện <= 20 kg và xách tay <= 7 kg. Kiện thêm 50.000đ / kiện.',
      tagLabel: 'Miễn phí',
      tagVariant: 'green',
    },
    {
      icon: 'smoking-no',
      title: 'Nội quy xe',
      desc: 'Không hút thuốc, không thực phẩm mùi nồng, lên xe đúng giờ.',
      tagLabel: 'Bắt buộc',
      tagVariant: 'red',
    },
  ] as ClientCatalogPolicy[],
  operatorAmenities: [
    { icon: 'wifi', label: 'Wifi 5G' },
    { icon: 'air-conditioning', label: 'Điều hoà' },
    { icon: 'plug', label: 'Sạc USB' },
    { icon: 'device-tv', label: 'Màn hình' },
    { icon: 'bowl', label: 'Bữa nhẹ' },
    { icon: 'shield-check', label: 'Bảo hiểm' },
  ] as ClientCatalogOperatorAmenity[],
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
