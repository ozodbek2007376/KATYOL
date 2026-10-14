import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuClipboardList } from 'react-icons/lu';
import { ROUTES } from '@/constants/routes.constants';

const SUB_NAV_ITEMS = [
  { label: 'Buyurtmalar Katalogi', path: ROUTES.PROTECTED.ORDERS, icon: LuClipboardList },
];

export const OrdersSubNav = () => {
  return (
    <div className="orders-sub-nav bg-surface border-custom rounded-3 p-1 mb-4 shadow-sm">
      <ul className="nav nav-pills d-flex flex-wrap gap-1">
        {SUB_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 fs-7 px-3 py-2 fw-medium rounded-2 transition-all ${
                    isActive ? 'active bg-primary text-white shadow-sm' : 'text-main hover-bg-custom'
                  }`
                }
              >
                <Icon className="fs-6" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
