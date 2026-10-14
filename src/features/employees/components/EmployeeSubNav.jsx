import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

const HR_NAV_ITEMS = [
  { label: 'Xodimlar Ro\'yxati', path: ROUTES.PROTECTED.EMPLOYEES, icon: 'bi-people', end: true },
  { label: 'Lavozimlar Boshqaruvi', path: ROUTES.PROTECTED.EMPLOYEES_POSITIONS, icon: 'bi-briefcase' },
  { label: 'Oylik Turlari', path: ROUTES.PROTECTED.EMPLOYEES_SALARY_TYPES, icon: 'bi-wallet2' },
];

export const EmployeeSubNav = () => {
  return (
    <div className="employee-subnav mb-4 border-bottom border-custom pb-2 overflow-x-auto">
      <ul className="nav nav-pills flex-nowrap gap-1">
        {HR_NAV_ITEMS.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `nav-link fs-8 py-2 px-3 fw-medium d-inline-flex align-items-center gap-1 text-nowrap rounded-3 ${
                  isActive ? 'active bg-primary text-white shadow-sm' : 'text-muted-custom bg-body-custom border-custom'
                }`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
