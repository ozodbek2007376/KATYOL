import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import { LuDollarSign, LuFileText, LuTrendingUp } from 'react-icons/lu';

export const SalesSubNav = () => {
  return (
    <div className="sub-nav bg-body-custom border-bottom border-custom mb-4 py-2 px-3 rounded-3">
      <div className="d-flex align-items-center gap-2 overflow-x-auto">
        <NavLink
          to={ROUTES.PROTECTED.SALES}
          end
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuDollarSign />
          <span>Sotuvlar Reyestri</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROTECTED.CUSTOMERS}
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuFileText />
          <span>Mijozlar Katalogi</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROTECTED.ORDERS}
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuTrendingUp />
          <span>Mijozlar Buyurtmalari</span>
        </NavLink>
      </div>
    </div>
  );
};
