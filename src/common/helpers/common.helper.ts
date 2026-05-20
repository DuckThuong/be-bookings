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

export const validString = (value?: string) => {
  if (!value) {
    return false;
  } else if (value.trim() === '') {
    return false;
  } else return true;
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
