export const randomString = (length = 8) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateEntityCode = (prefix: string): string => {
  const suffix = `${Date.now().toString(36)}${randomString(4)}`.toUpperCase();
  return `${prefix}${suffix}`.slice(0, 24);
};

export const parsePositiveInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.trunc(parsed);
};

export const validString = (value?: string) => {
  if (!value) {
    return false;
  } else if (value.trim() === '') {
    return false;
  } else return true;
};

export const generateOtp = (length = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

export const equalString = (value1: string, value2: string) => {
  if (!validString(value1) || !validString(value2)) {
    return false;
  } else if (value1.trim() == value2.trim()) {
    return true;
  } else {
    return false;
  }
};
