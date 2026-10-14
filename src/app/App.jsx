import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NetworkStatusOverlay } from '@/components/common/NetworkStatusOverlay/NetworkStatusOverlay';
import { GlobalErrorBoundary } from '@/components/common/ErrorBoundary/GlobalErrorBoundary';
import { ERP_ICONS } from '@/shared/icons';

export const App = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <QueryProvider>
      <ThemeProvider>
        {/* Global Offline Network Banner */}
        <NetworkStatusOverlay />

        {/* Global Error Boundary for UX Protection */}
        <GlobalErrorBoundary>
          <RouterProvider router={router} />
        </GlobalErrorBoundary>

        {/* Global Toast Overlay */}
        <div className="toast-container position-fixed bottom-0 end-0 p-3 z-3">
          {notifications.map((n) => {
            const badgeClass =
              n.type === 'success'
                ? 'bg-success text-white'
                : n.type === 'error'
                  ? 'bg-danger text-white'
                  : n.type === 'warning'
                    ? 'bg-warning text-dark'
                    : 'bg-info text-white';

            return (
              <div
                key={n.id}
                className={`toast show border-0 shadow-lg mb-2 animate-fade-in ${badgeClass}`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="d-flex align-items-center justify-content-between p-3">
                  <div className="d-flex align-items-center gap-2">
                    <i
                      className={`bi ${
                        n.type === 'success'
                          ? ERP_ICONS.CHECK
                          : n.type === 'error'
                            ? ERP_ICONS.EXCLAMATION
                            : ERP_ICONS.INFO
                      } fs-5`}
                    ></i>
                    <div>
                      {n.title && <strong className="d-block fs-7">{n.title}</strong>}
                      <span className="fs-8">{n.message}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-3"
                    onClick={() => removeNotification(n.id)}
                  ></button>
                </div>
              </div>
            );
          })}
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
