import { notifyError } from '@/services/notification.service';

export const handleApiError = (error) => {
  if (error?.response) {
    const status = error.response.status;
    const rawData = error.response.data;
    let message = 'Serverda kutilmagan xatolik yuz berdi';
    let isHtmlOrRaw = false;

    if (rawData) {
      if (typeof rawData === 'string') {
        if (rawData.trim().startsWith('<') || rawData.includes('<!DOCTYPE') || rawData.includes('<html>')) {
          message = `Xato ${status}`;
          isHtmlOrRaw = true;
        } else {
          message = rawData;
        }
      } else if (rawData.message) {
        message = rawData.message;
      } else if (rawData.error) {
        message = rawData.error;
      } else if (rawData.detail) {
        message = rawData.detail;
      } else if (rawData.non_field_errors && Array.isArray(rawData.non_field_errors)) {
        message = rawData.non_field_errors.join(', ');
      } else if (typeof rawData === 'object' && Object.keys(rawData).length > 0) {
        const firstKey = Object.keys(rawData)[0];
        const val = rawData[firstKey];
        const valText = Array.isArray(val) ? val.join(', ') : String(val);
        message = `${firstKey}: ${valText}`;
      }
    }

    const hasCleanMessage = message && message !== 'Serverda kutilmagan xatolik yuz berdi' && !isHtmlOrRaw;

    switch (status) {
      case 400:
        notifyError(hasCleanMessage ? message : 'Xato so\'rov jo\'natildi.', 'Xato so\'rov');
        break;
      case 401:
        // Handled by interceptor token refresh flow
        break;
      case 403:
        notifyError('Ushbu amalni bajarish uchun ruxsatingiz yetarli emas.', 'Ruxsat berilmadi');
        break;
      case 404:
        notifyError(hasCleanMessage ? message : 'So\'ralgan ma\'lumot topilmadi (Xato 404).', 'Ma\'lumot topilmadi');
        break;
      case 422:
        notifyError(hasCleanMessage ? message : 'Kiritilgan ma\'lumotlarda xatolik bor.', 'Tekshirish xatoligi');
        break;
      case 500:
        notifyError('Server ichki xatoligi. Iltimos keyinroq qayta urinib ko\'ring.', 'Server Xatoligi');
        break;
      default:
        notifyError(hasCleanMessage ? message : `Xatolik yuz berdi (Status ${status})`, `HTTP Xatosi ${status}`);
    }

    return { status, message, data: error.response.data };
  } else if (error?.request) {
    window.dispatchEvent(new Event('app-network-error'));
    const msg = 'Internet aloqasi uzildi yoki server javob bermadi. Ulanishni tekshiring!';
    notifyError(msg, 'Internet Aloqasi Yo\'q');
    return { status: 0, message: msg };
  } else {
    notifyError('Tizimda kutilmagan xatolik yuz berdi.', 'Tizim Xatosi');
    return { status: -1, message: error?.message || 'Tizim xatoligi' };
  }
};
