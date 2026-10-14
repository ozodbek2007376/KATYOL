import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuX,
  LuBell,
  LuCheckCheck,
  LuTrash2,
  LuTriangleAlert,
  LuClipboardList,
  LuSettings2,
  LuWrench,
  LuShoppingCart,
  LuInfo,
} from 'react-icons/lu';
import { useNotificationStore } from '@/store/useNotificationStore';
import { notificationsApi } from '../api/notificationsApi';
import { usePageAutoRefresh } from '@/hooks/usePageAutoRefresh';
import { EmptyState } from '@/components/common/EmptyState/EmptyState';

export const NotificationDrawer = () => {
  const navigate = useNavigate();
  const { isDrawerOpen, closeDrawer, setUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isDrawerOpen) {
      loadNotifications();
    }
  }, [isDrawerOpen]);

  const loadNotifications = async () => {
    const res = await notificationsApi.getNotifications();
    if (res.success) {
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    }
  };

  usePageAutoRefresh(loadNotifications, { intervalMs: 15000, isEditing: !isDrawerOpen });

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    loadNotifications();
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      await notificationsApi.markAsRead(item.id);
    }
    closeDrawer();
    if (item.linkPath) {
      navigate(item.linkPath);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    await notificationsApi.deleteNotification(id);
    loadNotifications();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <LuTriangleAlert className="text-warning fs-5" />;
      case 'NEW_ORDER':
        return <LuClipboardList className="text-primary fs-5" />;
      case 'PRODUCTION_COMPLETED':
        return <LuSettings2 className="text-success fs-5" />;
      case 'SERVICE_REMINDER':
        return <LuWrench className="text-info fs-5" />;
      case 'PAYMENT_REMINDER':
        return <LuShoppingCart className="text-danger fs-5" />;
      default:
        return <LuInfo className="text-secondary fs-5" />;
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className="position-fixed top-0 end-0 h-100 bg-body-custom border-start border-custom shadow-lg z-3 d-flex flex-column transition-all"
        style={{ width: '380px', maxWidth: '100vw' }}
      >
        {/* Drawer Header */}
        <div className="p-3 border-bottom border-custom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <LuBell className="text-primary fs-5" />
            <h6 className="mb-0 fw-bold text-main font-heading">Bildirishnomalar Markazi</h6>
          </div>
          <div className="d-flex align-items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                className="btn btn-sm btn-outline-primary border-0 p-1 fs-8"
                onClick={handleMarkAllRead}
                title="Barchasini o'qilgan deb belgilash"
              >
                <LuCheckCheck className="me-1" /> O'qilgan deb belgilash
              </button>
            )}
            <button className="btn btn-sm btn-outline-secondary border-0 p-1" onClick={closeDrawer}>
              <LuX />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-grow-1 overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<LuBell />}
              title="Bildirishnomalar Yo'q"
              description="Sizda hozircha hech qanday yangi bildirishnoma mavjud emas."
            />
          ) : (
            <div className="d-flex flex-column gap-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-3 border-custom transition-all cursor-pointer position-relative ${
                    item.isRead ? 'bg-body-custom opacity-75' : 'bg-primary bg-opacity-10 border-primary border-opacity-25'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start gap-2 mb-1">
                    <div className="mt-1">{getTypeIcon(item.type)}</div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <strong className="fs-7 text-main fw-bold">{item.title}</strong>
                        {!item.isRead && <span className="badge bg-primary p-1 rounded-circle" style={{ width: '8px', height: '8px' }}></span>}
                      </div>
                      <p className="fs-8 text-muted-custom mb-1">{item.description}</p>
                      <small className="fs-8 text-secondary">{item.time}</small>
                    </div>

                    <button
                      className="btn btn-sm text-muted-custom p-0 border-0 ms-1 opacity-50 hover-opacity-100"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      title="O'chirish"
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
