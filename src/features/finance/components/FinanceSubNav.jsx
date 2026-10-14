import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import { LuLayoutDashboard, LuArrowUpRight, LuArrowDownLeft, LuUsers, LuBadgeAlert } from 'react-icons/lu';

export const FinanceSubNav = () => {
  return (
    <div className="sub-nav bg-body-custom border-bottom border-custom mb-4 py-2 px-3 rounded-3">
      <div className="d-flex align-items-center gap-2 overflow-x-auto">
        <NavLink
          to={ROUTES.PROTECTED.FINANCE}
          end
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuLayoutDashboard />
          <span>Moliya Boshqaruvi</span>
        </NavLink>

        <NavLink
          to="/finance/payroll"
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuUsers className="text-primary" />
          <span>Ish Haqi (Payroll)</span>
        </NavLink>

        <NavLink
          to="/finance/debtors"
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuBadgeAlert className="text-warning" />
          <span>Qarzdorlar Reestri</span>
        </NavLink>

        <NavLink
          to="/finance/expenses"
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuArrowUpRight className="text-danger" />
          <span>Xarajatlar Reyestri</span>
        </NavLink>

        <NavLink
          to="/finance/incomes"
          className={({ isActive }) =>
            `btn btn-sm text-nowrap d-flex align-items-center gap-2 border-0 ${
              isActive ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary text-main'
            }`
          }
        >
          <LuArrowDownLeft className="text-success" />
          <span>Daromadlar Reyestri</span>
        </NavLink>
      </div>
    </div>
  );
};
