import React from 'react';
import { NavLink } from 'react-router-dom';

const LeadsSubNav = () => {
  return (
    <ul className="nav nav-tabs mb-4 glass-tabs">
      <li className="nav-item">
        <NavLink 
          to="/leads" 
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Lidlar Ro'yxati
        </NavLink>
      </li>
    </ul>
  );
};

export default LeadsSubNav;
