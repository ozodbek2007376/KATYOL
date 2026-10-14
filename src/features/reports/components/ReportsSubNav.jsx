import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LuFileText,
  LuShoppingCart,
  LuWarehouse,
  LuSettings2,
  LuBadgeDollarSign,
  LuWrench,
} from 'react-icons/lu';
import { ROUTES } from '@/constants/routes.constants';

const SUB_NAV_ITEMS = [
  { label: 'Umumiy Hisobot', path: ROUTES.PROTECTED.REPORTS, icon: LuFileText },
  { label: 'Sotuv Hisoboti', path: ROUTES.PROTECTED.REPORTS_SALES, icon: LuShoppingCart },
  { label: 'Ombor Hisoboti', path: ROUTES.PROTECTED.REPORTS_WAREHOUSE, icon: LuWarehouse },
  { label: 'Ishlab Chiqarish Hisoboti', path: ROUTES.PROTECTED.REPORTS_PRODUCTION, icon: LuSettings2 },
  { label: 'Moliya Hisoboti', path: ROUTES.PROTECTED.REPORTS_FINANCE, icon: LuBadgeDollarSign },
  { label: 'Servis Hisoboti', path: ROUTES.PROTECTED.REPORTS_SERVICES, icon: LuWrench },
];

export const ReportsSubNav = () => {
  return (
    <div className="bg-body-custom border-custom rounded-3 p-2 mb-3 d-flex align-items-center gap-2 overflow-x-auto">
      {SUB_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.PROTECTED.REPORTS}
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-1-5 rounded-2 transition-all font-medium ${
                isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0 text-main'
              }`
            }
          >
            <Icon className="fs-6" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
