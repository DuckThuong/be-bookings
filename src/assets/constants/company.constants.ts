export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
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
