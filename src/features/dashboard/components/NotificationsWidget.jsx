import React from 'react';
import { Card } from '@/components/common/Card/Card';
import { ERP_ICONS } from '@/shared/icons';

export const NotificationsWidget = ({ notifications = [] }) => {
  const displayNotifications = notifications.length > 0 ? notifications : [
    {
      id: 1,
      title: 'Tizim bildirishnomasi',
      message: 'Hozircha yangi bildirishnomalar mavjud emas.',
      type: 'info',
      time: 'Hozir',
    }
  ];

  return (
    <Card title="Bildirishnomalar va Ogohlantirishlar">
      <div className="d-flex flex-column gap-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {displayNotifications.map((n) => {
          const type = (n.type || 'info').toLowerCase();
          const bgClass =
            type === 'danger' || type === 'error'
              ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25'
              : type === 'warning'
                ? 'bg-warning bg-opacity-15 text-warning-emphasis border-warning border-opacity-25'
                : type === 'success'
                  ? 'bg-success bg-opacity-10 text-success border-success border-opacity-25'
                  : 'bg-info bg-opacity-10 text-info border-info border-opacity-25';

          const icon =
            type === 'danger' || type === 'error' || type === 'warning'
              ? ERP_ICONS.EXCLAMATION
              : type === 'success'
                ? ERP_ICONS.CHECK
                : ERP_ICONS.INFO;

          return (
            <div key={n.id} className={`p-3 rounded-3 border ${bgClass}`}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${icon} fs-6`}></i>
                  <strong className="fs-7">{n.title}</strong>
                </div>
                <small className="fs-8 opacity-75">{n.timestamp || n.time || ''}</small>
              </div>
              <p className="fs-8 mb-0 opacity-90">{n.message || n.content || ''}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
