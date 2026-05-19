export const randomString = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
