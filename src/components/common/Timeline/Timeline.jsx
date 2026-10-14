import React from 'react';

export const Timeline = ({ items = [] }) => {
  return (
    <div className="timeline-container py-2">
      {items.map((item, idx) => (
        <div key={idx} className="d-flex gap-3 mb-3 position-relative">
          <div className="d-flex flex-column align-items-center">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <i className={`bi ${item.icon || 'bi-circle-fill'} fs-7`}></i>
            </div>
            {idx !== items.length - 1 && (
              <div className="bg-border flex-grow-1" style={{ width: '2px', backgroundColor: 'var(--erp-border-color)' }}></div>
            )}
          </div>
          <div>
            <h6 className="mb-0 fs-7 fw-semibold text-main">{item.title}</h6>
            <small className="text-muted-custom fs-8">{item.timestamp}</small>
            {item.description && <p className="fs-7 text-muted-custom mt-1 mb-0">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
