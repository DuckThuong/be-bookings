export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED', // Đã lên lịch
  PREPARING = 'PREPARING', // Chuẩn bị khởi hành
  BOARDING = 'BOARDING', // Đang đón khách
  DEPARTED = 'DEPARTED', // Đã khởi hành
  APPROACHING = 'APPROACHING', // Sắp đến điểm đón
  MOVING = 'MOVING', // Đang di chuyển
  ARRIVED = 'ARRIVED', // Đã đến điểm đón
  COMPLETED = 'COMPLETED', // Hoàn thành
  CANCELLED = 'CANCELLED', // Đã hủy
  DELAYED = 'DELAYED', // Trễ chuyến
}

// Các trạng thái cho phép restart (bắt đầu lại)
export const TRIP_STATUSES_ALLOW_RESTART: TripStatus[] = [
  TripStatus.COMPLETED,
  TripStatus.CANCELLED,
];

export const VALID_TRIP_STATUSES = Object.values(TripStatus);

export const CODE_PREFIX = {
  COMPANY: 'CMP',
  ROAD: 'ROD',
  TRIP: 'TRP',
  VEHICLE: 'VEH',
  DRIVER: 'DRV',
  COMPANY_TRIP: 'CT',
  SEAT: 'SEA',
  TICKET: 'TKT',
} as const;
