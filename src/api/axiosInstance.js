import axios from 'axios';
import { tokenService } from './tokenService';
import { handleApiError } from './errorHandler';
import { ENDPOINTS } from './endpoints';
import { useAuthStore } from '@/store/useAuthStore';
import { offlineSyncService } from '@/services/offlineSync.service';
import { mockBackend } from './mockBackend';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const defaultAdapter = axios.defaults.adapter;

const isStandaloneMockMode = () => {
  return localStorage.getItem('is_demo_mode') === 'true';
};

const customAdapter = async (config) => {
  if (isStandaloneMockMode()) {
    const mockRes = mockBackend.handleRequest(config);
    if (mockRes) {
      return {
        data: mockRes.data,
        status: mockRes.status || 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {},
      };
    }
  }

  try {
    const res = await defaultAdapter(config);
    if (typeof res.data === 'string' && (res.data.includes('<!DOCTYPE') || res.data.includes('<html'))) {
      const mockRes = mockBackend.handleRequest(config);
      if (mockRes) {
        return {
          data: mockRes.data,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          config,
          request: {},
        };
      }
    }
    return res;
  } catch (err) {
    const mockRes = mockBackend.handleRequest(config);
    if (mockRes) {
      return {
        data: mockRes.data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: {},
      };
    }
    throw err;
  }
};

export const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  adapter: customAdapter,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Public paths that should never send Authorization headers
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

const isPublicPath = (url) => PUBLIC_PATHS.some(p => url?.includes(p));

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't attach token to public auth endpoints
    if (!isPublicPath(config.url)) {
      const token = tokenService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    const branchId = localStorage.getItem('active_branch_id');
    if (branchId) {
      config.headers['X-Branch-ID'] = branchId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (isStandaloneMockMode() && originalRequest) {
      const mockResult = mockBackend.handleRequest(originalRequest);
      if (mockResult) {
        return Promise.resolve(mockResult.data);
      }
    }

    // Don't attempt refresh or auto-logout for public endpoints
    if (isPublicPath(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data?.access_token;
        const newRefreshToken = response.data?.refresh_token || refreshToken;
        useAuthStore.getState().setAuthTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(refreshErr);
      }
    }

    // Handle offline mutating requests (POST, PUT, PATCH, DELETE)
    const method = (originalRequest?.method || 'get').toLowerCase();
    const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
    const isNetworkError = !navigator.onLine || (!error.response && error.request);

    if (isMutating && isNetworkError && !isPublicPath(originalRequest?.url)) {
      const fallback = offlineSyncService.enqueueRequest(originalRequest);
      return Promise.resolve(fallback);
    }

    handleApiError(error);
    return Promise.reject(error);
  }
);
