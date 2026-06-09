export type ClientTripSeatType =
  | 'all'
  | 'sleeper'
  | 'seat'
  | 'limousine'
  | 'bus';

export type ClientTripFilterKey =
  | 'all'
  | 'morning'
  | 'daytime'
  | 'night'
  | 'wifi'
  | 'ac';

export type ClientTripSortKey = 'price' | 'departure' | 'duration' | 'rating';

export type ClientTripBadgeType = 'green' | 'amber' | 'blue' | 'gray' | 'red';

export interface ClientTripAmenity {
  icon: string;
  label: string;
}

export interface ClientTripBadge {
  type: ClientTripBadgeType;
  label: string;
}

export const CLIENT_TRIP_OPERATOR_COLORS = [
  '#0a0e1a',
  '#1a2a4a',
  '#2d1a45',
  '#1a3a2a',
  '#3a1a1a',
  '#1a2a3a',
] as const;

export const CLIENT_TRIP_AMENITIES_BY_VEHICLE: Record<
  string,
  ClientTripAmenity[]
> = {
  '16': [
    { icon: '📶', label: 'Wifi 5G' },
    { icon: '❄️', label: 'Điều hoà' },
    { icon: '🔌', label: 'Sạc không dây' },
    { icon: '💆', label: 'Ghế massage' },
  ],
  '36': [
    { icon: '📶', label: 'Wifi miễn phí' },
    { icon: '❄️', label: 'Điều hoà' },
    { icon: '📺', label: 'Màn hình riêng' },
    { icon: '🔌', label: 'Sạc USB' },
    { icon: '🍱', label: 'Bữa ăn nhẹ' },
  ],
  '45': [
    { icon: '📶', label: 'Wifi' },
    { icon: '❄️', label: 'Điều hoà' },
    { icon: '🔌', label: 'Sạc USB' },
  ],
};

export const CLIENT_TRIP_VEHICLE_LABELS: Record<string, string> = {
  '16': 'Limousine VIP',
  '36': 'Giường nằm',
  '45': 'Ghế ngồi',
};

export const CLIENT_TRIP_TIME_SLOTS: Record<
  Exclude<ClientTripFilterKey, 'all' | 'wifi' | 'ac'>,
  { from: number; to: number }
> = {
  morning: { from: 5, to: 11 },
  daytime: { from: 12, to: 17 },
  night: { from: 18, to: 4 },
};

export const CLIENT_TRIP_SEAT_TYPE_MAP: Record<
  Exclude<ClientTripSeatType, 'all'>,
  string[]
> = {
  sleeper: ['36'],
  seat: ['45'],
  limousine: ['16'],
  bus: ['45', '36'],
};
