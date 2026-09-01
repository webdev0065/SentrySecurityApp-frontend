export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidIndianMobile = (value: string): boolean => {
  const digits = value.replace(/\D/g, '').replace(/^91/, '');
  return /^[6-9]\d{9}$/.test(digits);
};

export const isValidIdentifier = (value: string): boolean =>
  isValidEmail(value) || isValidIndianMobile(value);

export const passwordError = (value: string): string | undefined => {
  if (value.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must include uppercase, lowercase, and a number.';
  }
  return undefined;
};

export const isValidPincode = (value: string): boolean => /^\d{6}$/.test(value);

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const isCompleteOtp = (otp: string[]): boolean =>
  otp.length === 6 && otp.every(digit => /^\d$/.test(digit));
