import React, { useState, useEffect, useCallback } from 'react';
import { LuWifiOff, LuWifi, LuRefreshCw, LuDatabase } from 'react-icons/lu';
import { offlineSyncService } from '@/services/offlineSync.service';

export const NetworkStatusOverlay = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [queueCount, setQueueCount] = useState(offlineSyncService.getQueueCount());

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    setShowRestored(false);
  }, []);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    setShowRestored(true);
    
    // Auto sync offline queue when connection is restored
    offlineSyncService.processQueue();

    const timer = setTimeout(() => {
      setShowRestored(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const handleNetworkError = () => {
      if (!navigator.onLine) {
        setIsOffline(true);
      }
    };
    window.addEventListener('app-network-error', handleNetworkError);

    const handleQueueChange = (e) => {
      setQueueCount(e.detail?.count ?? offlineSyncService.getQueueCount());
    };
    window.addEventListener('offline-queue-changed', handleQueueChange);

    // Initial check on mount if online and has pending queue
    if (navigator.onLine && offlineSyncService.getQueueCount() > 0) {
      offlineSyncService.processQueue();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('app-network-error', handleNetworkError);
      window.removeEventListener('offline-queue-changed', handleQueueChange);
    };
  }, [handleOffline, handleOnline]);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      if (res.ok || navigator.onLine) {
        setIsOffline(false);
        setShowRestored(true);
        offlineSyncService.processQueue();
        setTimeout(() => setShowRestored(false), 3000);
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline && !showRestored && queueCount === 0) return null;

  return (
    <div
      className="position-fixed top-0 start-0 end-0 z-3 p-2 d-flex flex-column align-items-center gap-2"
      style={{ zIndex: 9999, pointerEvents: 'none' }}
    >
      {isOffline && (
        <div
          className="card border-0 shadow-lg bg-danger text-white px-3 py-2 rounded-3 d-flex flex-row align-items-center gap-3 animate-fade-in"
          style={{ pointerEvents: 'auto', maxWidth: '650px', width: '90%' }}
        >
          <div
            className="rounded-circle bg-white text-danger d-flex align-items-center justify-content-center p-2 flex-shrink-0"
            style={{ width: '40px', height: '40px' }}
          >
            <LuWifiOff className="fs-5" />
          </div>

          <div className="flex-grow-1 text-start">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold fs-7">Internet aloqasi uzildi!</h6>
              {queueCount > 0 && (
                <span className="badge bg-warning text-dark fs-8">
                  {queueCount} ta saqlangan so'rov
                </span>
              )}
            </div>
            <p className="mb-0 fs-8 text-white-50">
              {queueCount > 0
                ? "Kiritilgan ma'lumotlar lokal (Offline) xotirada saqlanmoqda. Aloqa tiklanganda avtomatik serverga yuboriladi."
                : "Tizim to'g'ri ishlashi uchun internetga ulaning. Aloqa tiklanganda davom etasiz."}
            </p>
          </div>

          <button
            className="btn btn-sm btn-light text-danger fw-semibold d-flex align-items-center gap-1 flex-shrink-0"
            onClick={checkConnection}
            disabled={isChecking}
          >
            <LuRefreshCw className={`fs-7 ${isChecking ? 'spin-animation' : ''}`} />
            <span className="d-none d-sm-inline">Qayta tekshirish</span>
          </button>
        </div>
      )}

      {showRestored && !isOffline && (
        <div
          className="card border-0 shadow-lg bg-success text-white px-3 py-2 rounded-3 d-flex flex-row align-items-center gap-2 animate-fade-in"
          style={{ pointerEvents: 'auto', maxWidth: '450px' }}
        >
          <div
            className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center p-2 flex-shrink-0"
            style={{ width: '32px', height: '32px' }}
          >
            <LuWifi className="fs-6" />
          </div>
          <div className="text-start">
            <span className="fw-bold fs-7 d-block">Internet aloqasi tiklandi!</span>
            <small className="fs-8 opacity-75">Tizim ish tartibi va sinxronizatsiya davom etmoqda.</small>
          </div>
        </div>
      )}

      {!isOffline && queueCount > 0 && !showRestored && (
        <div
          className="card border-0 shadow-lg bg-primary text-white px-3 py-2 rounded-3 d-flex flex-row align-items-center gap-3 animate-fade-in"
          style={{ pointerEvents: 'auto', maxWidth: '500px' }}
        >
          <LuDatabase className="fs-5" />
          <div className="text-start flex-grow-1">
            <span className="fw-bold fs-7 d-block">Navbatda {queueCount} ta offline ma'lumot bor</span>
            <small className="fs-8 opacity-75">Serverga sinxronizatsiya qilinmoqda...</small>
          </div>
          <button
            className="btn btn-sm btn-light text-primary fw-semibold"
            onClick={() => offlineSyncService.processQueue()}
          >
            Sinxronlash
          </button>
        </div>
      )}
    </div>
  );
};
