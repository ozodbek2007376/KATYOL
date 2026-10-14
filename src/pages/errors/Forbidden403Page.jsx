import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

export const Forbidden403Page = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <div className="display-1 fw-bold text-warning mb-2">403</div>
      <h3 className="fw-semibold text-main mb-2">Ruxsat etilmagan</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        Ushbu ERP moduliga yoki resursiga kirish uchun sizda yetarli ruxsat huquqlari mavjud emas. Iltimos, tizim administratoriga murojaat qiling.
      </p>
      <Link to={ROUTES.PROTECTED.DASHBOARD} className="btn btn-primary">
        Boshqaruv paneliga qaytish
      </Link>
    </div>
  );
};
