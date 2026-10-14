import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';

const SETTINGS_PAGES = [
  { label: 'Bosh Sozlamalar', path: ROUTES.PROTECTED.SETTINGS, icon: 'bi-grid-fill', end: true },
  { label: 'Kompaniya', path: ROUTES.PROTECTED.SETTINGS_COMPANY, icon: 'bi-building' },
  { label: 'Valyuta', path: ROUTES.PROTECTED.SETTINGS_CURRENCY, icon: 'bi-cash-stack' },
  { label: 'Omborlar', path: ROUTES.PROTECTED.SETTINGS_WAREHOUSE, icon: 'bi-box-seam' },
  { label: 'Kategoriyalar', path: ROUTES.PROTECTED.SETTINGS_CATEGORIES, icon: 'bi-tags' },
  { label: 'Ta\'minot Kategoriyalari', path: ROUTES.PROTECTED.SETTINGS_SUPPLIER_CATEGORIES, icon: 'bi-tags-fill' },
  { label: 'Material Turlari', path: ROUTES.PROTECTED.SETTINGS_MATERIAL_TYPES, icon: 'bi-boxes' },
  { label: 'Birliklar', path: ROUTES.PROTECTED.SETTINGS_UNITS, icon: 'bi-rulers' },
  { label: 'Xarajat Turlari', path: ROUTES.PROTECTED.SETTINGS_EXPENSE_TYPES, icon: 'bi-receipt' },
  { label: 'Defekt Sabablari', path: ROUTES.PROTECTED.SETTINGS_DEFECT_REASONS, icon: 'bi-exclamation-triangle' },
  { label: 'Servis Turlari', path: ROUTES.PROTECTED.SETTINGS_SERVICE_TYPES, icon: 'bi-wrench' },
  { label: 'Kafolat Turlari', path: ROUTES.PROTECTED.SETTINGS_WARRANTY_TYPES, icon: 'bi-shield-check' },
  { label: 'Sug\'urta Turlari', path: ROUTES.PROTECTED.SETTINGS_INSURANCE_TYPES, icon: 'bi-file-earmark-medical' },
  { label: 'Bosqichlar', path: ROUTES.PROTECTED.SETTINGS_PRODUCTION_STAGES, icon: 'bi-diagram-3' },
  { label: 'Rollar', path: ROUTES.PROTECTED.SETTINGS_ROLES, icon: 'bi-person-badge' },
  { label: 'Ruxsatlar Matritsasi', path: ROUTES.PROTECTED.SETTINGS_PERMISSIONS, icon: 'bi-lock' },
];

export const SettingsSubNav = () => {
  return null;
};
