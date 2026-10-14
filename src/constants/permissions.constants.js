export const PERMISSION_ACTIONS = [
  { key: 'VIEW', altKey: 'view', label: "Ko'rish" },
  { key: 'CREATE', altKey: 'create', label: 'Yaratish' },
  { key: 'EDIT', altKey: 'update', label: 'Tahrirlash' },
  { key: 'DELETE', altKey: 'delete', label: "O'chirish" },
  { key: 'EXPORT', altKey: 'export', label: 'Eksport Qilish' },
];

export const PERMISSION_MODULES_TREE = [
  {
    key: 'DASHBOARD',
    label: 'Asosiy va Hisobotlar',
    pages: [
      { key: 'DASHBOARD_MAIN', label: 'Boshqaruv Paneli (Dashboard)' },
      { key: 'ACTIVITIES', label: 'Faoliyatlar Jurnali' },
      { key: 'REPORTS_SALES', label: 'Sotuv Hisoboti' },
      { key: 'REPORTS_WAREHOUSE', label: 'Ombor Hisoboti' },
      { key: 'REPORTS_PRODUCTION', label: 'Ishlab Chiqarish Hisoboti' },
      { key: 'REPORTS_FINANCE', label: 'Moliya Hisoboti' },
      { key: 'REPORTS_SERVICES', label: 'Servis Hisoboti' },
    ],
  },
  {
    key: 'SALES',
    label: "Savdo Bo'limi",
    pages: [
      { key: 'SALES_ORDERS', label: 'Buyurtmalar Reyestri' },
      { key: 'SALES_DEALS', label: 'Sotuvlar Reyestri' },
      { key: 'SALES_CUSTOMERS', label: 'Mijozlar Katalogi' },
    ],
  },
  {
    key: 'PRODUCTION',
    label: 'Zavod va Ishlab Chiqarish',
    pages: [
      { key: 'PRODUCTION_ORDERS', label: 'Ishlab Chiqarish Buyurtmalari (Kanban)' },
      { key: 'PRODUCTION_RECIPES', label: 'Retseptlar va BOM Spetsifikatsiya' },
      { key: 'PRODUCTION_BOILERS', label: 'Kotyol Turlari Katalogi' },
      { key: 'PRODUCTION_PRODUCTS', label: 'Mahsulotlar va Xomashyolar Nomenklaturasi' },
    ],
  },
  {
    key: 'WAREHOUSE',
    label: 'Ombor Tizimi',
    pages: [
      { key: 'WAREHOUSE_STOCK', label: 'Mavjud Zaxiralar' },
      { key: 'WAREHOUSE_MOVEMENTS', label: 'Ombor Harakatlari' },
      { key: 'WAREHOUSE_REVALUATION', label: 'Qayta Baholash' },
      { key: 'WAREHOUSE_INVENTORY', label: 'Inventarizatsiya' },
      { key: 'WAREHOUSE_SUPPLIERS', label: "Ta'minotchilar Katalogi" },
      { key: 'WAREHOUSE_PURCHASING', label: 'Xaridlar Reyestri' },
    ],
  },
  {
    key: 'FINANCE',
    label: "Moliya Bo'limi",
    pages: [
      { key: 'FINANCE_DASHBOARD', label: 'Moliya Boshqaruvi' },
      { key: 'FINANCE_EXPENSES', label: 'Xarajatlar Reyestri' },
      { key: 'FINANCE_INCOMES', label: 'Daromadlar Reyestri' },
    ],
  },
  {
    key: 'EMPLOYEES',
    label: "Kadrlar Bo'limi (Xodimlar)",
    pages: [
      { key: 'EMPLOYEES_LIST', label: "Xodimlar Ro'yxati" },
      { key: 'EMPLOYEES_POSITIONS', label: 'Lavozimlar Boshqaruvi' },
      { key: 'EMPLOYEES_SALARY', label: 'Oylik Turlari va Maosh' },
      { key: 'EMPLOYEES_ACTIVITY', label: 'Ish Faolligi va Davomat' },
    ],
  },
  {
    key: 'SERVICES',
    label: "Servis va Ta'mir",
    pages: [
      { key: 'SERVICES_LIST', label: "Servis buyurtmalari va ta'mir" },
    ],
  },
  {
    key: 'SETTINGS',
    label: 'Tizim va Sozlamalar',
    pages: [
      { key: 'SETTINGS_SYSTEM', label: 'Tizim Injini va Raqamlash' },
      { key: 'SETTINGS_AUDIT', label: 'Audit Jurnali (Loglar)' },
      { key: 'SETTINGS_MASTER_DATA', label: 'Master Data Boshqaruvi' },
      { key: 'SETTINGS_COMPANY', label: 'Kompaniya va Rekvizitlar' },
      { key: 'SETTINGS_CURRENCY', label: 'Valyuta va Kurslar' },
      { key: 'SETTINGS_BRANCHES', label: 'Filiallar Boshqaruvi' },
      { key: 'SETTINGS_PERMISSIONS', label: 'Rollar va Ruxsatlar Matritsasi' },
    ],
  },
];
