import { useEffect, useRef } from 'react';

/**
 * Reusable Page-Based Background Auto-Refresh Hook
 * @param {Function} fetchFn - Callback function to refresh page data silently
 * @param {Object} options - Configuration options
 * @param {number} [options.intervalMs=15000] - Refresh interval in milliseconds (default 15s)
 * @param {boolean} [options.isEditing=false] - Smart Pause flag (pauses while modal is open)
 * @param {boolean} [options.enabled=true] - Toggle auto-refresh on/off
 */
export const usePageAutoRefresh = (fetchFn, { intervalMs = 15000, isEditing = false, enabled = true } = {}) => {
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled || isEditing) return;

    const timer = setInterval(() => {
      if (fetchRef.current) {
        fetchRef.current();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, isEditing, enabled]);
};
