import React from 'react';
import { APP_NAME, APP_VERSION } from '@/constants/app.constants';

export const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-card-custom border-top border-custom px-4">
      <div className="container-fluid d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted-custom fs-8">
        <div>
          &copy; {new Date().getFullYear()} <strong className="text-main">{APP_NAME}</strong>. Ishlab chiqarish tizimi.
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="d-flex align-items-center gap-1 text-success">
            <span className="p-1 bg-success rounded-circle"></span> API Ishchi Holatda
          </span>
          <span>Versiya {APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
};
