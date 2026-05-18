export const jwtConstants = {
  secret: '28072003',
  expiresIn: '24h',
};

export const ROUND = 10;
export const chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const LOCATION_RENT_STATUS = {
  HAS_RENT: 1,
  READY: 0,
};

export const ADDRESS_TYPE = {
  MAIN_ADDRESS: 1,
  SUB_ADDRESS: 2,
};

export const ADDRESS_STATUS = {
  ACTIVE: 0,
  IN_ACTIVE: 1,
};

export const RESOURCE_TYPE = 'auto';

export const USER_ROLE = {
  ADMIN: 0,
  OWNER: 1,
  USER: 2,
};

export const COMMENT_TYPE = {
  COMMENT: 0,
  REPLY: 1,
};
