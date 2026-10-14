# Backend API Integration Rules - Kotyol ERP

## 1. REST Architecture & Endpoint Standards
- Every feature module communicates via an API simulation layer (e.g. `src/features/sales/api/salesApi.js`) returning standardized Promise payloads: `{ success: boolean, data?: any, message?: string }`.
- Base URL configured in `src/api/axiosInstance.js`.

## 2. JWT Authentication & Bearer Tokens
- Bearer tokens are attached automatically via `axiosInstance` request interceptors.
- Session expiration automatically redirects to `/session-expired`.

## 3. Data Integrity & Validation Response Handling
- Backend errors must return clear Uzbek messages.
- Soft-deleted entities return `status: 'INACTIVE'` rather than being destroyed.
