import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  return (
    <div className="d-flex min-vh-100 bg-body-custom" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 min-w-0 dashboard-main-content">
        <Navbar />
        <main className="flex-grow-1 p-3 p-md-4 w-100 min-w-0" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
