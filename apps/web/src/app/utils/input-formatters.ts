const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmailInput = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '');

export const isValidEmailInput = (value: string) => emailPattern.test(normalizeEmailInput(value));

export const normalizeNameInput = (value: string) => value.replace(/\s+/g, ' ').trimStart();

export const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const phoneDigits = (value: string) => value.replace(/\D/g, '');

export const isValidPhoneInput = (value: string) => {
  const digits = phoneDigits(value);
  return digits.length === 10 || digits.length === 11;
};

export const formatInstagramHandleInput = (value: string) => {
  const normalized = value.replace(/\s+/g, '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '');
  return normalized ? `@${normalized.slice(0, 30)}` : '';
};
