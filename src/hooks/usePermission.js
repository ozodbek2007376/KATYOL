import { useAuthStore } from '@/store/useAuthStore';

export const usePermission = (moduleName) => {
  const { user } = useAuthStore();
  const userRole = user?.role || 'ADMIN';
  const permissions = user?.permissions || [];

  // Super Admin bypasses all checks
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const hasPermission = (module, action) => {
    if (isAdmin) return true;
    if (!module || !action) return false;

    // Standardized permission string check, e.g. "PRODUCTION_CREATE" or "PRODUCTION:CREATE"
    const permString = `${module.toUpperCase()}_${action.toUpperCase()}`;
    return permissions.includes(permString) || permissions.includes('*');
  };

  const targetModule = moduleName || '';

  const canCreate = targetModule ? hasPermission(targetModule, 'CREATE') : true;
  const canEdit = targetModule ? hasPermission(targetModule, 'EDIT') : true;
  const canDelete = targetModule ? hasPermission(targetModule, 'DELETE') : true;
  const canView = targetModule ? hasPermission(targetModule, 'VIEW') : true;

  const isReadOnly = canView && !canCreate && !canEdit && !canDelete;

  return {
    hasPermission,
    canCreate,
    canEdit,
    canDelete,
    canView,
    isReadOnly,
    isAdmin,
  };
};
