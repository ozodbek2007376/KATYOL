# Folder Structure Map - Kotyol ERP

```
src/
  ├── api/                       # Axios instance and JWT token interceptors
  ├── app/                       # Application entry point & router configuration
  │   ├── providers/             # Theme & Query providers
  │   └── router/                # Router & Protected/Public route guards
  ├── components/                # Shared UI primitives
  │   └── common/                # 21 Reusable components (FilterBar, Table, Card, DynamicSelect, etc.)
  ├── constants/                 # Enterprise constants & route paths
  ├── features/                  # 22 Domain Feature Modules
  │   ├── activities/            # Global Event Audit Log & Timeline
  │   ├── audit/                 # Immutable System Audit Log & JSON Comparison
  │   ├── auth/                  # JWT Authentication & Password Recovery
  │   ├── boilers/               # Finished Product (Boiler Models) Catalog
  │   ├── customers/             # Customer Relations & CRM
  │   ├── dashboard/             # Executive Dashboard & KPI Metrics
  │   ├── employees/             # HR & Personnel Foundation
  │   ├── finance/               # Managerial Finance, Expenses & Revenues
  │   ├── notifications/         # Notification Bell, Badge & Drawer
  │   ├── orders/                # Customer Orders & Stock Reservation Engine
  │   ├── products/              # Raw Materials & Nomenclatures Catalog
  │   ├── production/            # Production Orders & Kanban Board
  │   ├── purchasing/            # Supplier Procurement & Automated Stock Receipts
  │   ├── recipes/               # Bill of Materials (BOM) & Recipe Versioning
  │   ├── reports/               # Read-Only Enterprise Analytical Reports
  │   ├── sales/                 # Invoicing, Profit Margins & Dispatch
  │   ├── services/              # Warranty & Maintenance Tracking
  │   ├── settings/              # Centralized Enterprise System Settings (14 sub-pages)
  │   ├── suppliers/             # Supplier Profiles & Contacts
  │   ├── system/                # System Engine Health & Document Numbering Previews
  │   └── warehouse/             # Inventory Stock, Movements & Audit
  ├── hooks/                     # Custom React hooks (usePageAutoRefresh, usePermission, etc.)
  ├── layouts/                   # DashboardLayout & AuthLayout
  ├── pages/                     # Standalone Error & Status pages (403, 404, 500, Offline)
  ├── services/                  # Pure Business Logic & Calculation Engines
  ├── shared/                    # Shared enums, currencies & React icon definitions
  ├── store/                     # Zustand UI stores (useNotificationStore, useFilterPreferencesStore, etc.)
  ├── styles/                    # Global CSS variables & design tokens
  └── utils/                     # Formatting utilities (currency, date, numbers)
```
