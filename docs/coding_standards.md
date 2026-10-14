# Coding Standards & Guidelines - Kotyol ERP

## 1. Language Standards
- **UI Language**: 100% Uzbek language for user-visible elements (buttons, headers, modals, toasts, error messages).
- **Code Language**: 100% English language for source code, file paths, variables, React components, and CSS classes.

## 2. Component Structure & Naming
- Use Named Exports for components (e.g. `export const FilterBar = ...`).
- One component per file under `src/features/<module>/components/`.
- Pages reside under `src/features/<module>/pages/`.

## 3. UI Component Reuse Mandate
- Always check `src/components/common/` before creating UI elements.
- Mandatory primitives: `FilterBar`, `Table`, `Card`, `PageHeader`, `EmptyState`, `DynamicSelect`, `StatusBadge`, `CalculationBreakdown`, `EntityPreviewCard`.

## 4. State & Service Separation
- Pure business logic belongs in `src/services/` (e.g., `businessRulesService.js`, `documentNumberingService.js`).
- UI state belongs in Zustand stores (`src/store/`).

## 5. Icons
- Standardize on `react-icons/lu` Lucide and `react-icons/fa` Font Awesome icons.
