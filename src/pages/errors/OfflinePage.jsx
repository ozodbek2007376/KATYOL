import React from 'react';

export const OfflinePage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-body-custom">
      <i className="bi bi-wifi-off display-1 text-secondary mb-3"></i>
      <h3 className="fw-semibold text-main mb-2">Internet aloqasi uzildi</h3>
      <p className="text-muted-custom mb-4" style={{ maxWidth: '480px' }}>
        Siz hozirda oflayn rejimdasiz. ERP tizimi bilan ma'lumotlar almashinuvini davom ettirish uchun tarmoq ulanishini tekshiring.
      </p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        Aloqani qayta tekshirish
      </button>
    </div>
  );
};
