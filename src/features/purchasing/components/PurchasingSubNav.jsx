import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuShoppingBag, LuTruck } from 'react-icons/lu';
import { ROUTES } from '@/constants/routes.constants';

const SUB_NAV_ITEMS = [
  { label: 'Xaridlar Ro\'yxati', path: ROUTES.PROTECTED.PURCHASING, icon: LuShoppingBag },
  { label: 'Ta\'minotchi Korxonalar', path: ROUTES.PROTECTED.SUPPLIERS, icon: LuTruck },
];

export const PurchasingSubNav = () => {
  return (
    <div className="bg-body-custom border-custom rounded-3 p-2 mb-3 d-flex align-items-center gap-2 overflow-x-auto">
      {SUB_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.PROTECTED.PURCHASING}
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
