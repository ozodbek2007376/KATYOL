export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
  },
  WAREHOUSE: {
    STOCK_LIST: '/warehouse/stocks',
    STOCK_DETAIL: (id) => `/warehouse/stocks/${id}`,
    CATEGORIES: '/warehouse/categories',
  },
  PRODUCTION: {
    WORK_ORDERS: '/production/work-orders',
    BOM_LIST: '/production/recipes',
    SCHEDULE: '/production/schedule',
  },
  FINANCE: {
    TRANSACTIONS: '/finance/transactions',
    PAYROLL: '/finance/payroll',
    REPORTS: '/finance/reports',
  },
  SALES: {
    ORDERS: '/sales/orders',
    QUOTATIONS: '/sales/quotations',
  },
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id) => `/customers/${id}`,
  },
  EMPLOYEES: {
    LIST: '/employees',
    DETAIL: (id) => `/employees/${id}`,
  },
};
