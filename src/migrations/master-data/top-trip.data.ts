export interface TopTripSeed {
  id: string;
  from: string;
  to: string;
  operator: string;
  operatorLogo: string;
  departure: string;
  duration: string;
  seats: number;
  price: number;
  type: string;
  rating: number;
}

export const MASTER_DATA_TYPE_TOP_TRIP = 'TOP_TRIP';

export const TOP_TRIPS: TopTripSeed[] = [
  {
    id: 't1',
    from: 'Hà Nội',
    to: 'Đà Nẵng',
    operator: 'Phương Trang',
    operatorLogo: 'PT',
    departure: '20:00 · Hôm nay',
    duration: '14 tiếng',
    seats: 8,
    price: 320000,
    type: 'Giường nằm 40 chỗ',
    rating: 4.8,
  },
  {
    id: 't2',
    from: 'HCM',
    to: 'Đà Lạt',
    operator: 'Thành Bưởi',
    operatorLogo: 'TB',
    departure: '21:30 · Hôm nay',
    duration: '7 tiếng',
    seats: 14,
    price: 180000,
    type: 'Limousine 22 chỗ',
    rating: 4.7,
  },
  {
    id: 't3',
    from: 'Hà Nội',
    to: 'Vinh',
    operator: 'Hoàng Long',
    operatorLogo: 'HL',
    departure: '06:00 · Ngày mai',
    duration: '5 tiếng',
    seats: 3,
    price: 150000,
    type: 'Ghế ngồi 45 chỗ',
    rating: 4.6,
  },
  {
    id: 't4',
    from: 'HCM',
    to: 'Cần Thơ',
    operator: 'Kumho Samco',
    operatorLogo: 'KS',
    departure: '07:00 · Ngày mai',
    duration: '3.5 tiếng',
    seats: 22,
    price: 120000,
    type: 'Xe Limousine',
    rating: 4.6,
  },
];
