# Architecture Decision Records (ADR) - Kotyol ERP

## ADR 001: Selection of Vanilla CSS over Utility Frameworks (Tailwind)
## ADR 002: State Separation between Zustand and TanStack Query
## ADR 003: Pure Business Services Layer Decoupled from React
## ADR 004: Strict Path Alias Usage
## ADR 005: Backend-Ready Abstracted JWT Auth Layer & Centralized Mock Data
## ADR 006: 100% Uzbek UI Language Standard with English Code Identifiers
## ADR 007: Centralized Enterprise Settings Architecture & `@dnd-kit` Drag & Drop Production Stages
## ADR 008: Dynamic Positions & HR Foundation Model
## ADR 009: Dynamic Configuration Registry Pattern for Zero Hardcoded Business Values
## ADR 010: Suppliers and Products Foundation Architecture with Dynamic Material Types
## ADR 011: React Icons Library Standard (`react-icons/lu` & `react-icons/fa`)
## ADR 012: Dynamic Warehouse Movement & Audit Engine
## ADR 013: Administrator First Philosophy
## ADR 014: Uninterrupted Workflow with DynamicSelect Component
## ADR 015: Automated Stock Receiving and Purchasing Calculation Engine
## ADR 016: Data Integrity, Single Source of Truth, and Soft Delete Engine
## ADR 017: Recipe Versioning and Automated Production Cost Engine
## ADR 018: Master Data vs Transaction Data Architecture & Single Source of Truth
## ADR 019: Smart Forms, Smart Tables Column Customization, and Local Preference Persistence
## ADR 020: Finished Products Boiler Catalog & Recipe-to-Production Flow Mapping
## ADR 021: Read-Only Related Information Preview UX
## ADR 022: Customer Management & Sales/Services Integration Architecture
## ADR 023: Form Draft Auto-Save & Unsaved Changes Protection UX
## ADR 024: Reusable Page-Based Background Auto-Refresh Engine
## ADR 025: Customer Orders & Material Reservation Engine Architecture
## ADR 026: Real-Time Production Rules, Audit Trail & Optimistic Locking Architecture
## ADR 027: Production Foundation & Multi-Module Workflow Integration Architecture
## ADR 028: Smart Actions & 1-Click Direct Cross-Module Navigation Architecture
## ADR 029: Drag & Drop Engine, Optimistic UI & Production Kanban Architecture
## ADR 030: Complete Production Kanban & Quick Inspection Drawer Architecture
## ADR 031: Permission-Based UI & Dynamic Read-Only Mode Architecture
## ADR 032: Business Rules Isolation & Calculation Transparency Architecture
## ADR 033: Complete Sales & Commercial Module Architecture
## ADR 034: Centralized Document Numbering System Architecture
## ADR 035: Simplicity First, One Screen One Purpose & Progressive UI Architecture
## ADR 036: Complete Service & Warranty Module Architecture
## ADR 037: Complete Finance & Treasury Module Architecture
## ADR 038: Manager-Centric Managerial Finance Architecture
## ADR 039: Complete Reports & Read-Only Analytics Architecture
## ADR 040: Unified Reusable Filter System Architecture
## ADR 041: Notification Center & Global Activity Center Architecture
## ADR 042: Continuous Architecture Review & System Consistency Standard
## ADR 043: Complete Audit Log & System Management Architecture
## ADR 044: Comprehensive Quality Gate & Technical Debt Exclusion Standard
## ADR 045: Final Production Release & Enterprise ERP Architecture Baseline
## ADR 046: Implementation Quality over Superficial Features Standard

## ADR 047: UI Language Parentheses Cleanup Standard
- **Status**: Accepted
- **Context**: Ensuring the UI feels natively designed in Uzbek rather than translated from English.
- **Decision**: Removed all parenthesized English translations (e.g. `(Customers)`, `(Orders)`, `(Warehouse)`) from user-facing text, page titles, tables, forms, modals, drawers, and buttons across all modules.
- **Benefits**: Native, clean, professional 100% Uzbek enterprise user experience.
