import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { SessionExpiredPage } from '@/features/auth/pages/SessionExpiredPage';

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { AuditLogPage, AuditDetailPage } from '@/features/audit';
import { ActivitiesPage } from '@/features/activities';

import {
  GeneralReportPage,
  SalesReportPage,
  WarehouseReportPage,
  ProductionReportPage,
  FinanceReportPage,
  ServiceReportPage,
} from '@/features/reports';

import { FinancePage, ExpensesPage, IncomesPage, PayrollPage, DebtorsPage, FinanceDetailPage } from '@/features/finance';
import { ServicesPage } from '@/features/services/pages/ServicesPage';
import { ServiceDetailPage } from '@/features/services/pages/ServiceDetailPage';
import { ProductionPage } from '@/features/production/pages/ProductionPage';
import { ProductionDetailPage } from '@/features/production/pages/ProductionDetailPage';
import { SalesPage, SaleDetailPage } from '@/features/sales';
import { OrdersPage, OrderDetailPage } from '@/features/orders';
import { BoilersPage, BoilerDetailPage } from '@/features/boilers';
import { RecipesPage } from '@/features/recipes/pages/RecipesPage';
import { RecipeDetailPage } from '@/features/recipes/pages/RecipeDetailPage';
import { PurchasingPage, PurchaseDetailPage } from '@/features/purchasing';

import {
  WarehousePage,
  WarehousesListPage,
  StockDetailPage,
  RevaluationPage,
  InventoryCountPage,
} from '@/features/warehouse';

import { CustomersPage, CustomerDetailPage } from '@/features/customers';
import { LeadsPage, LeadDetailPage } from '@/features/leads';

import { SuppliersPage, SupplierDetailPage } from '@/features/suppliers';
import { ProductsPage } from '@/features/warehouse/pages/ProductsPage';
import { ProductDetailPage } from '@/features/warehouse/pages/ProductDetailPage';

import {
  EmployeesPage,
  EmployeeDetailPage,
  PositionsPage,
  SalaryTypesPage,
} from '@/features/employees';

import {
  CompanySettingsPage,
  CurrencySettingsPage,
  WarehouseSettingsPage,
  CategoriesSettingsPage,
  MaterialTypesSettingsPage,
  UnitsSettingsPage,
  ExpenseTypesSettingsPage,
  DefectReasonsSettingsPage,
  ServiceTypesSettingsPage,
  WarrantyTypesSettingsPage,
  InsuranceTypesSettingsPage,
  ProductionStagesSettingsPage,
  RolesSettingsPage,
  PermissionsSettingsPage,
  MasterDataManagementPage,
  BranchesManagementPage,
  BranchesStatisticsPage,
  SupplierCategoriesSettingsPage,
} from '@/features/settings';

import { Forbidden403Page } from '@/pages/errors/Forbidden403Page';
import { NotFound404Page } from '@/pages/errors/NotFound404Page';
import { ServerError500Page } from '@/pages/errors/ServerError500Page';
import { OfflinePage } from '@/pages/errors/OfflinePage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';

export const router = createBrowserRouter([
  // Public Routes (Auth)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // Protected Enterprise ERP Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/change-password', element: <ChangePasswordPage /> },

          // Audit Routes
          { path: '/audit', element: <AuditLogPage /> },
          { path: '/audit/:id', element: <AuditDetailPage /> },

          // Global Activity Center Route
          { path: '/activities', element: <ActivitiesPage /> },

          // Reports Routes
          { path: '/reports', element: <GeneralReportPage /> },
          { path: '/reports/sales', element: <SalesReportPage /> },
          { path: '/reports/warehouse', element: <WarehouseReportPage /> },
          { path: '/reports/production', element: <ProductionReportPage /> },
          { path: '/reports/finance', element: <FinanceReportPage /> },
          { path: '/reports/services', element: <ServiceReportPage /> },

          // Finance Routes
          { path: '/finance', element: <FinancePage /> },
          { path: '/finance/payroll', element: <PayrollPage /> },
          { path: '/finance/debtors', element: <DebtorsPage /> },
          { path: '/finance/expenses', element: <ExpensesPage /> },
          { path: '/finance/incomes', element: <IncomesPage /> },
          { path: '/finance/:id', element: <FinanceDetailPage /> },

          // Services Routes
          { path: '/services', element: <ServicesPage /> },
          { path: '/services/:id', element: <ServiceDetailPage /> },

          // Sales Routes
          { path: '/sales', element: <SalesPage /> },
          { path: '/sales/:id', element: <SaleDetailPage /> },

          // Production Routes
          { path: '/production', element: <ProductionPage /> },
          { path: '/production/:id', element: <ProductionDetailPage /> },

          // Orders Routes
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },

          // Boilers (Finished Products) Routes
          { path: '/boilers', element: <BoilersPage /> },
          { path: '/boilers/:id', element: <BoilerDetailPage /> },

          // Recipe Routes
          { path: '/recipes', element: <RecipesPage /> },
          { path: '/recipes/:id', element: <RecipeDetailPage /> },

          // Purchasing Routes
          { path: '/purchasing', element: <PurchasingPage /> },
          { path: '/purchasing/:id', element: <PurchaseDetailPage /> },

          // Warehouse Routes
          { path: '/warehouse', element: <Navigate to="/warehouse/list" replace /> },
          { path: '/warehouse/list', element: <WarehousesListPage /> },
          { path: '/warehouse/stock', element: <ProductsPage /> },
          { path: '/warehouse/stock/:id', element: <ProductDetailPage /> },
          { path: '/warehouse/revaluation', element: <RevaluationPage /> },
          { path: '/warehouse/inventory-count', element: <InventoryCountPage /> },

          // Customers Routes
          { path: '/customers', element: <CustomersPage /> },
          { path: '/customers/:id', element: <CustomerDetailPage /> },

          // Leads Routes
          { path: '/leads', element: <LeadsPage /> },
          { path: '/leads/:id', element: <LeadDetailPage /> },

          // Suppliers Routes
          { path: '/suppliers', element: <SuppliersPage /> },
          { path: '/suppliers/:id', element: <SupplierDetailPage /> },

          // Products & Raw Materials Routes
          { path: '/products', element: <Navigate to="/warehouse/stock" replace /> },
          { path: '/products/:id', element: <Navigate to="/warehouse/stock/:id" replace /> },

          // Employees HR Routes
          { path: '/employees', element: <EmployeesPage /> },
          { path: '/employees/:id', element: <EmployeeDetailPage /> },
          { path: '/employees/positions', element: <PositionsPage /> },
          { path: '/employees/salary-types', element: <SalaryTypesPage /> },

          // Settings Routes
          { path: '/settings', element: <Navigate to="/settings/company" replace /> },
          { path: '/settings/company', element: <CompanySettingsPage /> },
          { path: '/settings/currency', element: <CurrencySettingsPage /> },
          { path: '/settings/warehouse', element: <WarehouseSettingsPage /> },
          { path: '/settings/categories', element: <CategoriesSettingsPage /> },
          { path: '/settings/supplier-categories', element: <SupplierCategoriesSettingsPage /> },
          { path: '/settings/material-types', element: <MaterialTypesSettingsPage /> },
          { path: '/settings/units', element: <UnitsSettingsPage /> },
          { path: '/settings/expense-types', element: <ExpenseTypesSettingsPage /> },
          { path: '/settings/defect-reasons', element: <DefectReasonsSettingsPage /> },
          { path: '/settings/service-types', element: <ServiceTypesSettingsPage /> },
          { path: '/settings/warranty-types', element: <WarrantyTypesSettingsPage /> },
          { path: '/settings/insurance-types', element: <InsuranceTypesSettingsPage /> },
          { path: '/settings/production-stages', element: <ProductionStagesSettingsPage /> },
          { path: '/settings/roles', element: <RolesSettingsPage /> },
          { path: '/settings/permissions', element: <PermissionsSettingsPage /> },
          { path: '/settings/master-data', element: <MasterDataManagementPage /> },
          { path: '/settings/branches', element: <BranchesManagementPage /> },
          { path: '/settings/branches/stats', element: <BranchesStatisticsPage /> },
        ],
      },
    ],
  },

  // Standalone Error Pages & Session Expiry
  { path: '/session-expired', element: <SessionExpiredPage /> },
  { path: '/403', element: <Forbidden403Page /> },
  { path: '/404', element: <NotFound404Page /> },
  { path: '/500', element: <ServerError500Page /> },
  { path: '/offline', element: <OfflinePage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // Catch-all Redirect to 404
  { path: '*', element: <Navigate to="/404" replace /> },
]);
