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

export enum DriverStatus {
  AVAILABLE = 'available',    // Sẵn sàng
  ON_TRIP = 'on-trip',        // Đang chạy tuyến
  OFF_DUTY = 'off-duty',      // Ngoài ca
  LEAVE = 'leave',            // Nghỉ phép
}

export const VALID_DRIVER_STATUSES = Object.values(DriverStatus);

// Master Data Types for frontend CMS
export enum MasterDataType {
  DRIVER_STATUS = 'DRIVER_STATUS',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  VEHICLE_STATUS = 'VEHICLE_STATUS',
  VEHICLE_TYPE = 'VEHICLE_TYPE',
  ROUTE_STATUS = 'ROUTE_STATUS',
  TRIP_STATUS = 'TRIP_STATUS',
  CUSTOMER_STATUS = 'CUSTOMER_STATUS',
  CUSTOMER_TIER = 'CUSTOMER_TIER',
  REPORT_STATUS = 'REPORT_STATUS',
  REPORT_TYPE = 'REPORT_TYPE',
  SEAT_TYPE = 'SEAT_TYPE',
  REGISTRATION_STATUS = 'REGISTRATION_STATUS',
  BOOKING_STATUS = 'BOOKING_STATUS',
}

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
