import { useNotificationStore } from '@/store/useNotificationStore';

const FIELD_TRANSLATIONS = {
  description: 'Tavsifi',
  name: 'Nomi',
  code: 'Kodi',
  amount: 'Narxi/Stavkasi',
  phone: 'Telefon raqami',
  email: 'E-mail manzili',
  address: 'Manzili',
  password: 'Paroli',
};

const COMMON_ERROR_PATTERNS = [
  { pattern: /may not be blank/i, replace: "maydoni bo'sh bo'lishi mumkin emas" },
  { pattern: /is required/i, replace: "maydonini to'ldirish majburiy" },
  { pattern: /already exists/i, replace: "allaqachon mavjud" },
  { pattern: /invalid/i, replace: "haqiqiy emas yoki noto'g'ri" },
];

export const parseRawErrorMessage = (raw) => {
  if (!raw) return "Kiritilgan ma'lumotlarda xatolik bor.";

  let str = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);

  // Extract string='...' from Django ErrorDetail(string='...', code='...')
  const matchStringDetail = str.match(/string=['"]([^'"]+)['"]/);
  if (matchStringDetail && matchStringDetail[1]) {
    str = matchStringDetail[1];
  }

  // Detect field name at start of Django dict e.g. {'description':
  let fieldName = '';
  const matchField = String(raw).match(/['"]?([a-zA-Z0-9_]+)['"]?\s*:\s*/);
  if (matchField && matchField[1]) {
    const key = matchField[1];
    if (FIELD_TRANSLATIONS[key]) {
      fieldName = FIELD_TRANSLATIONS[key];
    }
  }

  // Replace common patterns with Uzbek equivalents
  for (const { pattern, replace } of COMMON_ERROR_PATTERNS) {
    if (pattern.test(str)) {
      return fieldName ? `${fieldName} ${replace}.` : `Ushbu ${replace}.`;
    }
  }

  // Fallback cleanup of python/Django representation symbols
  str = str
    .replace(/ErrorDetail\(.*?\)/g, '')
    .replace(/[{}[\]'"]/g, '')
    .replace(/code=\w+/g, '')
    .trim();

  if (
    str.includes('[object Object]') ||
    str.includes('TypeError') ||
    str.includes('AxiosError') ||
    str.includes('Network Error')
  ) {
    return "Tizimda ma'lumotlarni qayta ishlashda xatolik yuz berdi.";
  }

  return str || "Kiritilgan ma'lumotlarda xatolik bor.";
};

export const notifySuccess = (message, title = 'Muvaffaqiyatli') => {
  useNotificationStore.getState().addNotification({ type: 'success', title, message });
};

export const notifyError = (message, title = 'Xatolik') => {
  useNotificationStore.getState().addNotification({
    type: 'error',
    title,
    message: parseRawErrorMessage(message),
  });
};

export const notifyWarning = (message, title = 'Ogohlantirish') => {
  useNotificationStore.getState().addNotification({ type: 'warning', title, message });
};

export const notifyInfo = (message, title = 'Ma\'lumot') => {
  useNotificationStore.getState().addNotification({ type: 'info', title, message });
};
