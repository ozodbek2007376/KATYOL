# System Architecture & Technical Specifications - Kotyol ERP

## Architectural Overview
Kotyol ERP is built as an enterprise-grade, modular web application with strict separation between UI view components, Zustand client session state, and side-effect-free business services.

```
src/
  ├── app/                # Application bootstrap & router
  ├── api/                # Axios instance & token interceptors
  ├── components/common/  # 21 Reusable UI components (including FilterBar, CalculationBreakdown, EntityPreviewCard, Smart Table & DynamicSelect)
  ├── features/           # Isolated ERP domain modules (22 Production Modules)
  │   ├── auth/           # JWT Authentication
  │   ├── dashboard/      # Executive Dashboard
  │   ├── system/         # System Engine Status, PostgreSQL & Document Numbering Previews
  │   ├── audit/          # Immutable System Audit Log & Old/New Values Comparison
  │   ├── notifications/  # Notification Bell, Unread Counter & Slide-Over Drawer
  │   ├── activities/     # Global Activity Log & Event Audit Center
  │   ├── settings/       # System Settings (14 sub-pages)
  │   ├── employees/      # HR & Personnel Foundation
  │   ├── suppliers/      # Supplier Relations & Contacts
  │   ├── products/       # Products, Materials & Inventory Nomenclatures
  │   ├── boilers/        # Finished Products (Boiler Types) Catalog & Costing
  │   ├── customers/      # Customer Relations, Profiles & Contracts
  │   ├── orders/         # Customer Orders, Material Availability & Reservation
  │   ├── production/     # Production Foundation, Dynamic Kanban Board & Card Drawer
  │   ├── sales/          # Complete Sales, Invoicing, Tax, Profit Margins & Warehouse Stock Dispatch
  │   ├── services/       # Complete Service, Warranty Tracking, Master Allocation & Maintenance History
  │   ├── finance/        # Complete Finance & Treasury Overview, Expenses, Revenues & Visual Trend Analytics
  │   ├── reports/        # Read-Only Analytical Reports (General, Sales, Warehouse, Production, Finance, Services)
  │   ├── warehouse/      # Warehouse, Movements, Revaluation & Audit
  │   ├── purchasing/     # Purchasing Orders, Invoices & Automated Stock Receipts
  │   └── recipes/        # Bill of Materials (BOM), Recipe Versioning & Production Costs
  ├── hooks/              # Custom React hooks (usePageAutoRefresh, usePermission, etc.)
  ├── services/           # Pure business engines, documentNumberingService, businessRulesService, masterDataService, transactionDataService, dataIntegrityService & productionAuditService
  ├── shared/             # Reusable enums, validators & React Icons
  └── store/              # Zustand global client UI stores (including useNotificationStore, useFilterPreferencesStore & useFormDraftStore)
```

## Production Release Verification
- **22 Production Modules**: Fully implemented and tested with 0 build errors.
- **100% Uzbek User Interface**: Standardized Uzbek labels across all pages.
- **Pure Business Logic Layer**: Fully decoupled calculation and document numbering services.

## Icon Standard & Library
Built-in Bootstrap Icons have been replaced with **React Icons** (`react-icons/lu` Lucide and `react-icons/fa` Font Awesome). Icons are exported via `REACT_ERP_ICONS` in `src/shared/icons/index.js`.
