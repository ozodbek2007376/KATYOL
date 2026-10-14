# Dynamic Pagination & Page Size Filter Standard

## Overview
This document specifies the universal pagination and page size filter architecture implemented across the entire Kotyol Enterprise ERP system.

## Standard Default Page Size
- **Standard Default:** **25 items / page** (`DEFAULT_PAGE_SIZE = 25`).

## Page Size Options
All data tables and object lists across all ERP modules support standard page size filtering with the following options:
- **10 items / page**
- **25 items / page (Standard Default)**
- **50 items / page**
- **100 items / page**
- **200 items / page**

## Architecture & Reusable Components

### 1. `src/constants/app.constants.js`
Defines system-wide pagination constants:
```javascript
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200];
export const DEFAULT_PAGE_SIZE = 25;
```

### 2. `src/components/common/Pagination/Pagination.jsx`
Provides a clean, responsive pagination toolbar in Uzbek language:
- **Always Visible:** Displays current item range (`Jami N ta yozuvdan X-Y ko'rsatilmoqda`) and page size dropdown selector (`Sahifada: 10 ta | 25 ta | 50 ta | 100 ta | 200 ta`) on ALL tables and activity lists regardless of row count.
- Includes page navigation controls (`<<`, `<`, `1, 2, 3...`, `>`, `>>`) when total pages > 1.

### 3. `src/components/common/Table/Table.jsx`
The central `<Table />` component has built-in smart pagination enabled by default (`enablePagination = true`, default size = 25):
- Automatically handles client-side data slicing for all module lists (`data.slice((page-1)*pageSize, page*pageSize)`).
- Automatically resets page number to `1` whenever dataset filters or search terms change.
- Supports external/controlled props for server-side pagination endpoints (`currentPage`, `totalPages`, `pageSize`, `totalItems`, `onPageChange`, `onPageSizeChange`).

## Covered ERP Modules & Pages
1. **Global Faoliyatlar Jurnali (Global Activity Log)** (`/activities`)
2. **Audit Jurnali (Audit Log)** (`/audit`)
3. **Ombor Zaxiralari (Warehouse Stock)** (`/warehouse/stock`)
4. **Ombor Harakatlari (Stock Movements)** (`/warehouse/movements`)
5. **Qayta Baholash (Stock Revaluation)** (`/warehouse/revaluation`)
6. **Inventarizatsiya (Inventory Counts)** (`/warehouse/inventory-count`)
7. **Mahsulotlar & Xomashyo (Products & Materials)** (`/products`)
8. **Ishlab Chiqarish Topshiriqlari (Production Orders)** (`/production`)
9. **Sotuvlar (Sales & Invoices)** (`/sales`)
10. **Mijozlar Buyurtmalari (Customer Orders)** (`/orders`)
11. **Xaridlar va Ta'minot (Purchasing)** (`/purchasing`)
12. **Mijozlar Reyestri (Customers)** (`/customers`)
13. **Ta'minotchilar Reyestri (Suppliers)** (`/suppliers`)
14. **Xodimlar & Shtat (Employees & HR)** (`/employees`)
15. **Moliya & Xarajatlar (Finance & Expenses)** (`/finance/expenses`)
16. **Retsepturalar va BOM (Recipes)** (`/recipes`)
17. **Kotyollar Katalogi (Boilers)** (`/boilers`)
18. **Tizim Sozlamalari (Settings)** (`/settings/categories`, `/settings/material-types`, `/settings/units`, `/settings/warehouse`, etc.)
