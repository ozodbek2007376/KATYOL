export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    SESSION_EXPIRED: '/session-expired',
  },
  PROTECTED: {
    DASHBOARD: '/',
    PROFILE: '/profile',
    CHANGE_PASSWORD: '/change-password',

    // System Administration & Audit Sub-Routes
    SYSTEM: '/system',
    AUDIT: '/audit',
    AUDIT_DETAIL: '/audit/:id',

    // Global Activity Center Sub-Route
    ACTIVITIES: '/activities',

    // Reports Sub-Routes
    REPORTS: '/reports',
    REPORTS_SALES: '/reports/sales',
    REPORTS_WAREHOUSE: '/reports/warehouse',
    REPORTS_PRODUCTION: '/reports/production',
    REPORTS_FINANCE: '/reports/finance',
    REPORTS_SERVICES: '/reports/services',

    // Finance Sub-Routes
    FINANCE: '/finance',
    FINANCE_PAYROLL: '/finance/payroll',
    FINANCE_DEBTORS: '/finance/debtors',
    FINANCE_EXPENSES: '/finance/expenses',
    FINANCE_INCOMES: '/finance/incomes',
    FINANCE_DETAIL: '/finance/:id',

    // Services Sub-Routes
    SERVICES: '/services',
    SERVICES_DETAIL: '/services/:id',

    // Production Sub-Routes
    PRODUCTION: '/production',
    PRODUCTION_DETAIL: '/production/:id',

    // Sales Sub-Routes
    SALES: '/sales',
    SALES_DETAIL: '/sales/:id',

    // Leads Sub-Routes
    LEADS: '/leads',
    LEADS_DETAIL: '/leads/:id',

    // Orders Sub-Routes
    ORDERS: '/orders',
    ORDERS_DETAIL: '/orders/:id',

    // Boilers (Finished Products Catalog) Sub-Routes
    BOILERS: '/boilers',
    BOILERS_DETAIL: '/boilers/:id',

    // Recipes & BOM Sub-Routes
    RECIPES: '/recipes',
    RECIPES_DETAIL: '/recipes/:id',

    // Purchasing Sub-Routes
    PURCHASING: '/purchasing',
    PURCHASING_DETAIL: '/purchasing/:id',

    // Warehouse Sub-Routes
    WAREHOUSE: '/warehouse',
    WAREHOUSE_LIST: '/warehouse/list',
    WAREHOUSE_STOCK: '/warehouse/stock',
    WAREHOUSE_STOCK_DETAIL: '/warehouse/stock/:id',
    WAREHOUSE_MOVEMENTS: '/warehouse/movements',
    WAREHOUSE_MOVEMENTS_DETAIL: '/warehouse/movements/:id',
    WAREHOUSE_REVALUATION: '/warehouse/revaluation',
    WAREHOUSE_INVENTORY_COUNT: '/warehouse/inventory-count',

    // Customers Sub-Routes
    CUSTOMERS: '/customers',
    CUSTOMERS_DETAIL: '/customers/:id',

    // Suppliers Sub-Routes
    SUPPLIERS: '/suppliers',
    SUPPLIERS_DETAIL: '/suppliers/:id',

    // Products & Raw Materials Sub-Routes
    PRODUCTS: '/warehouse/stock',
    PRODUCTS_DETAIL: '/warehouse/stock/:id',

    // Employees HR Sub-Routes
    EMPLOYEES: '/employees',
    EMPLOYEES_DETAIL: '/employees/:id',
    EMPLOYEES_POSITIONS: '/employees/positions',
    EMPLOYEES_SALARY_TYPES: '/employees/salary-types',
    EMPLOYEES_ACTIVITY: '/employees/activity',

    // Settings Sub-Routes
    SETTINGS: '/settings',
    SETTINGS_COMPANY: '/settings/company',
    SETTINGS_CURRENCY: '/settings/currency',
    SETTINGS_WAREHOUSE: '/settings/warehouse',
    SETTINGS_CATEGORIES: '/settings/categories',
    SETTINGS_SUPPLIER_CATEGORIES: '/settings/supplier-categories',
    SETTINGS_MATERIAL_TYPES: '/settings/material-types',
    SETTINGS_UNITS: '/settings/units',
    SETTINGS_EXPENSE_TYPES: '/settings/expense-types',
    SETTINGS_DEFECT_REASONS: '/settings/defect-reasons',
    SETTINGS_SERVICE_TYPES: '/settings/service-types',
    SETTINGS_WARRANTY_TYPES: '/settings/warranty-types',
    SETTINGS_INSURANCE_TYPES: '/settings/insurance-types',
    SETTINGS_PRODUCTION_STAGES: '/settings/production-stages',
    SETTINGS_ROLES: '/settings/roles',
    SETTINGS_PERMISSIONS: '/settings/permissions',
    MASTER_DATA: '/settings/master-data',
    SETTINGS_BRANCHES: '/settings/branches',
    SETTINGS_BRANCHES_STATS: '/settings/branches/stats',
  },
  ERRORS: {
    FORBIDDEN_403: '/403',
    NOT_FOUND_404: '/404',
    SERVER_ERROR_500: '/500',
    OFFLINE: '/offline',
    UNAUTHORIZED: '/unauthorized',
  },
};
