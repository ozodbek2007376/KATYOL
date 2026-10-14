import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

export const NotFound404Page = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <div className="display-1 fw-bold text-primary mb-2">404</div>
      <h3 className="fw-semibold text-main mb-2">Sahifa topilmadi</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        Siz qidirayotgan ERP sahifa manzili mavjud emas yoki tizimda boshqa manzilga ko'chirilgan.
      </p>
      <Link to={ROUTES.PROTECTED.DASHBOARD} className="btn btn-primary">
        Boshqaruv paneliga qaytish
      </Link>
    </div>
  );
};
