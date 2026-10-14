import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

export const SessionExpiredPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <i className="bi bi-clock-history display-1 text-warning mb-3"></i>
      <h3 className="fw-semibold text-main mb-2">Seans Muddati Tugadi</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        Xavfsizlik nuqtai nazaridan tizimdagi faol seansingiz vaqti tugadi. Qaytadan tizimga kirish uchun quyidagi tugmani bosing.
      </p>
      <Link to={ROUTES.PUBLIC.LOGIN} className="btn btn-primary">
        Qayta Tizimga Kirish
      </Link>
    </div>
  );
};
