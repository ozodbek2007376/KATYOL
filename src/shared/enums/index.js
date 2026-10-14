export const UserRole = {
  SUPER_ADMIN: 'Bosh administrator',
  ADMIN: 'Administrator',
  WAREHOUSE_MANAGER: 'Omborxona mudiri',
  PRODUCTION_MANAGER: "Ishlab chiqarish boshlig'i",
  SALES_MANAGER: "Sotuv bo'limi boshlig'i",
  FINANCE_MANAGER: 'Bosh hisobchi',
  EMPLOYEE: 'Xodim',
};

export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const ProductionStatus = {
  DRAFT: 'Qoralama',
  SCHEDULED: 'Rejalashtirilgan',
  IN_PROGRESS: 'Jarayonda',
  QUALITY_CHECK: 'Sifat nazorati',
  COMPLETED: 'Bajarildi',
  CANCELLED: 'Bekor qilindi',
};

export const OrderStatus = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  PROCESSING: 'Ishlanmoqda',
  SHIPPED: "Jo'natilgan",
  DELIVERED: 'Etkazib berildi',
  CANCELLED: 'Bekor qilindi',
};
