import React from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { ERP_ICONS } from '@/shared/icons';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, clearAll } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 end-0 h-100 bg-card-custom border-start border-custom shadow-lg z-3 animate-slide-right d-flex flex-column"
      style={{ width: '350px', maxWidth: '100vw' }}
    >
      <div className="p-3 border-bottom border-custom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${ERP_ICONS.BELL} text-primary`}></i>
          <h6 className="fw-semibold mb-0 text-main">Tizim bildirishnomalari</h6>
        </div>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <div className="flex-grow-1 overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="text-center py-5 text-muted-custom">
            <i className={`bi ${ERP_ICONS.BELL} fs-1 d-block mb-2 opacity-50`}></i>
            <small>Yangi bildirishnomalar mavjud emas</small>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-3 mb-2 rounded-3 border-custom bg-body-custom position-relative">
              <div className="d-flex align-items-start justify-content-between">
                <strong className="fs-7 text-main">{n.title}</strong>
                <button
                  className="btn btn-sm p-0 border-0 text-muted-custom"
                  onClick={() => removeNotification(n.id)}
                >
                  <i className={`bi ${ERP_ICONS.X_MARK}`}></i>
                </button>
              </div>
              <p className="fs-8 text-muted-custom mb-0 mt-1">{n.message}</p>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-top border-custom text-center">
          <button className="btn btn-sm btn-outline-secondary w-100" onClick={clearAll}>
            Barcha bildirishnomalarni tozalash
          </button>
        </div>
      )}
    </div>
  );
};
