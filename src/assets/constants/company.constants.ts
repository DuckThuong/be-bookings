export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const CODE_PREFIX = {
  COMPANY: 'CMP',
  ROUTE: 'ROU',
  TRIP: 'TRP',
  VEHICLE: 'VEH',
  DRIVER: 'DRV',
  COMPANY_TRIP: 'CT',
  SEAT: 'SEA',
  TICKET: 'TKT',
} as const;
