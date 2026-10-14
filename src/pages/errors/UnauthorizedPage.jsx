import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

export const UnauthorizedPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <div className="display-1 fw-bold text-danger mb-2">401</div>
      <h3 className="fw-semibold text-main mb-2">Seans muddati tugagan</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        Tizimda foydalanuvchi seansi tugadi yoki autentifikatsiya ma'lumotlari taqdim etilmadi. Davom etish uchun tizimga kiring.
      </p>
      <Link to={ROUTES.PUBLIC.LOGIN} className="btn btn-primary">
        Tizimga kirish
      </Link>
    </div>
  );
};
