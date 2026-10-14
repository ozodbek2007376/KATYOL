import { UserRole } from '../enums';

export const Permissions = {
  MANAGE_USERS: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  VIEW_FINANCE: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_MANAGER],
  MANAGE_PRODUCTION: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRODUCTION_MANAGER],
  MANAGE_WAREHOUSE: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER],
  MANAGE_SALES: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_MANAGER],
};

export const hasPermission = (userRole, requiredPermissions = []) => {
  if (!userRole) return false;
  if (userRole === UserRole.SUPER_ADMIN) return true;
  return requiredPermissions.includes(userRole);
};
