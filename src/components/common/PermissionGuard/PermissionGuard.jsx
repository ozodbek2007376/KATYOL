import React from 'react';
import { usePermission } from '@/hooks/usePermission';

export const PermissionGuard = ({ module, action, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(module, action)) {
    return fallback;
  }

  return <>{children}</>;
};
