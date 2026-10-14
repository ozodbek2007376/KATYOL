const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'kotyol_erp_';

export const storageService = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (err) {
      console.error('Storage set error:', err);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (err) {
      console.error('Storage remove error:', err);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('Storage clear error:', err);
    }
  },
};
