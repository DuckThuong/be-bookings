import { emailRegex, phoneRegex } from '../../assests/regexs/regex';

export const isEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const isNotEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isPhoneNumber = (phone: string): boolean => {
  return phoneRegex.test(phone);
};
