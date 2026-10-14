import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-body-custom p-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="card shadow-lg border-custom p-4 animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
