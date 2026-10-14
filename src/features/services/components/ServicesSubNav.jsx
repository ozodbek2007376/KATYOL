import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import { LuWrench, LuUserCheck, LuFlame } from 'react-icons/lu';

export const ServicesSubNav = () => {
  return (
    <div className="sub-nav bg-body-custom border-bottom border-custom mb-4 py-2 px-3 rounded-3">
      <div className="d-flex align-items-center gap-2 overflow-x-auto">
        <NavLink
          to={ROUTES.PROTECTED.SERVICES}
          end
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuWrench />
          <span>Servislar Reyestri</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROTECTED.CUSTOMERS}
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuUserCheck />
          <span>Mijozlar Katalogi</span>
        </NavLink>

        <NavLink
          to={ROUTES.PROTECTED.BOILERS}
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuFlame />
          <span>Kotyol Modellari</span>
        </NavLink>
      </div>
    </div>
  );
};
