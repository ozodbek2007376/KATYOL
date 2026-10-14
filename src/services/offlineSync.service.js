import { notifyWarning, notifySuccess, notifyError } from '@/services/notification.service';
import axios from 'axios';
import { tokenService } from '@/api/tokenService';

const QUEUE_KEY = 'kotyol_offline_request_queue';

class OfflineSyncService {
  getQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: queue.length } }));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  enqueueRequest(config) {
    const queue = this.getQueue();
    const newItem = {
      id: `off_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      method: (config.method || 'post').toUpperCase(),
      url: config.url,
      data: config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null,
      timestamp: new Date().toISOString(),
    };

    queue.push(newItem);
    this.saveQueue(queue);

    notifyWarning(
      "Internet yo'q. Kiritilgan ma'lumot lokal xotirada (Offline) saqlandi. Aloqa tiklanganda serverga avtomatik yuboriladi.",
      "Offline Saqlandi"
    );

    // Optimistic fallback data
    const mockData = newItem.data ? { id: newItem.id, ...newItem.data } : { id: newItem.id };
    return {
      success: true,
      offline: true,
      data: mockData,
      message: "Offline rejimida saqlandi. Internet ulanishi kutilmoqda.",
    };
  }

  async processQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    if (!navigator.onLine) return;

    const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    const token = tokenService.getAccessToken();
    const branchId = localStorage.getItem('active_branch_id');

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (branchId) headers['X-Branch-ID'] = branchId;

    let successCount = 0;
    const remainingQueue = [];

    for (const item of queue) {
      try {
        const fullUrl = item.url.startsWith('http') ? item.url : `${baseURL}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
        
        await axios({
          method: item.method,
          url: fullUrl,
          data: item.data,
          headers,
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to sync offline item ${item.id}:`, err);
        // If it's a server error or network fail, keep in queue
        if (!err.response || err.response.status >= 500) {
          remainingQueue.push(item);
        }
      }
    }

    this.saveQueue(remainingQueue);

    if (successCount > 0) {
      notifySuccess(
        `Offline saqlangan ${successCount} ta ma'lumot serverga muvaffaqiyatli sinxronizatsiya qilindi.`,
        "Sinxronizatsiya Yakunlandi"
      );
      window.dispatchEvent(new Event('offline-sync-completed'));
    }
  }

  getQueueCount() {
    return this.getQueue().length;
  }

  clearQueue() {
    localStorage.removeItem(QUEUE_KEY);
    window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: 0 } }));
  }
}

export const offlineSyncService = new OfflineSyncService();
