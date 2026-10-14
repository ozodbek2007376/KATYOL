export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email) => {
  if (!email) return 'Email kiritilishi shart';
  if (!EMAIL_REGEX.test(email)) return "Noto'g'ri email formati";
  return true;
};

export const validateRequired = (val, fieldName = 'Maydon') => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${fieldName} kiritilishi shart`;
  }
  return true;
};

export const validatePositiveNumber = (val, fieldName = 'Miqdor') => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} musbat son bo'lishi kerak`;
  }
  return true;
};
