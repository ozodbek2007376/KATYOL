import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

export const ServerError500Page = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <div className="display-1 fw-bold text-danger mb-2">500</div>
      <h3 className="fw-semibold text-main mb-2">Tizim ichki xatoligi</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        ERP serverida kutilmagan xatolik yuz berdi. Tizim monitoringi ushbu xatolikni avtomatik ravishda qayd etdi.
      </p>
      <Link to={ROUTES.PROTECTED.DASHBOARD} className="btn btn-primary">
        Boshqaruv paneliga qaytish
      </Link>
    </div>
  );
};
