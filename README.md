# KotyoI Enterprise ERP Frontend

[![Production Ready](https://img.shields.io/badge/status-production_ready-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![UI Language](https://img.shields.io/badge/UI_Language-Uzbek_100%25-orange.svg)]()

KotyoI Enterprise ERP is a production-grade, modular web application engineered for industrial boiler manufacturing, sales, warehouse management, production scheduling, warranty service, finance, and enterprise analytics.

---

## 🌟 Key Features & Architecture Highlights

- **100% Uzbek User Interface**: Every label, table header, form modal, toast, and report card is translated into professional Uzbek language.
- **English Codebase & Clean Architecture**: All variables, file paths, React components, and internal domain engines are cleanly structured in English.
- **22 Production Modules**:
  1. `auth`: JWT Authentication & Session Management
  2. `dashboard`: Executive Executive Dashboard & Analytics
  3. `settings`: Enterprise Settings System (14 sub-pages, D&D production stages)
  4. `employees`: HR & Personnel Foundation
  5. `suppliers`: Supplier Relations & Contacts
  6. `products`: Raw Materials & Finished Product Nomenclatures
  7. `boilers`: Industrial Boiler & Furnace Models Catalog
  8. `recipes`: Bill of Materials (BOM) & Multi-Version Recipe Engine
  9. `purchasing`: Automated Stock Receiving & Supplier Procurement
  10. `warehouse`: Inventory Movements, Stock Audit & Revaluation
  11. `customers`: Customer Profiles, Contract Ledger & CRM Integrations
  12. `orders`: Order Reservation Engine & Material Availability Audit
  13. `production`: Production Orders, Scheduling & Audit Trail
  14. `kanban`: Visual D&D Production Kanban Board with Quick Card Inspection Drawer
  15. `sales`: Invoicing, Tax (QQS 12%), Profit Margins & Automated Stock Dispatch
  16. `services`: Warranty Tracking, Technician Master Allocation & Service Logs
  17. `finance`: Managerial Finance, Expenses, Revenue & Profit Analytics
  18. `reports`: Read-Only Enterprise Analytics with Recharts & PDF/Excel Export
  19. `notifications`: Real-Time Unread Bell Counter & Slide-Over Drawer
  20. `activities`: Global Event Audit Log & Timeline
  21. `audit`: Immutable System Audit Log & Old vs New Values Comparison
  22. `system`: Engine Health, Database Status & Centralized Document Numbering Previews
- **Unified Reusable Filter System (`FilterBar`)**: Single universal filter bar across all pages with local preference persistence (`useFilterPreferencesStore`).
- **Dynamic Entities (`DynamicSelect`)**: Uninterrupted form workflows with `+ Add New` (inline modal) and `⚙️ Manage` (direct settings link).
- **Centralized Document Numbering (`documentNumberingService`)**: Standardized document sequences (`ORD-YYYY-000001`, `PRD-YYYY-000001`, `SAL-YYYY-000001`, `EXP-YYYY-000001`).
- **Data Integrity & Soft Delete (`dataIntegrityService`)**: Restricts hard deletion of linked master records with clear Uzbek error feedback.

---

## 🚀 Quick Start

### Requirements
- Node.js `v18.x` or higher
- npm `v9.x` or higher

### Installation & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📚 Technical Documentation

Find detailed architectural specifications inside the `docs/` folder:
- [Architecture Specifications](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/architecture.md)
- [Coding Standards](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/coding_standards.md)
- [Folder Structure Map](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/folder_structure.md)
- [Backend API Integration Rules](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/api_rules.md)
- [Architecture Decision Records (ADRs)](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/decisions.md)
- [Business Workflow Models](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/business_flow.md)
- [Milestone Roadmap Tracker](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/roadmap.md)
- [Current System State](file:///home/lite/Documents/projects/FrontendProjects/kotyol/docs/current_state.md)
