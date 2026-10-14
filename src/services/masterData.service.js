import { dynamicSettingsService } from './dynamicSettings.service';

export const masterDataService = {
  // Master Entities Getters
  getProducts: () => [],
  getProductById: () => null,

  getSuppliers: () => [],
  getSupplierById: () => null,

  getEmployees: () => [],
  getEmployeeById: () => null,

  getRecipes: () => [],
  getActiveRecipeByProduct: () => null,

  // Master Settings Registries (Currencies, Warehouses, Categories, Material Types, Units, Stages, Roles)
  getCurrencies: () => dynamicSettingsService.getCurrencies(),
  getWarehouses: () => dynamicSettingsService.getWarehouses(),
  getCategories: () => dynamicSettingsService.getCategories(),
  getMaterialTypes: () => dynamicSettingsService.getMaterialTypes(),
  getUnits: () => dynamicSettingsService.getUnits(),
  getProductionStages: () => dynamicSettingsService.getProductionStages(),
  getRoles: () => dynamicSettingsService.getRoles(),
  getPositions: () => dynamicSettingsService.getPositions(),
};
