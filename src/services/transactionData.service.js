import { masterDataService } from './masterData.service';

export const transactionDataService = {
  // Purchases Transactions
  getPurchases: () => [],
  getPurchaseById: () => null,

  // Warehouse Movements & Stock Balances
  getCurrentStock: () => [],
  getStockMovements: () => [],

  /**
   * Generates a historical snapshot of a Master Data entity at transaction time
   * @param {string} masterType - 'PRODUCT' | 'SUPPLIER' | 'WAREHOUSE'
   * @param {string} masterId - Primary ID
   */
  createTransactionSnapshot: (masterType, masterId) => {
    switch (masterType) {
      case 'PRODUCT': {
        const prod = masterDataService.getProductById(masterId);
        return prod
          ? {
              productId: prod.id,
              productName: prod.name,
              internalCode: prod.internalCode,
              unitPriceAtTransaction: prod.purchasePrice || 0,
              unitName: prod.unitName || 'dona',
            }
          : null;
      }

      case 'SUPPLIER': {
        const sup = masterDataService.getSupplierById(masterId);
        return sup
          ? {
              supplierId: sup.id,
              supplierName: sup.companyName,
              contactPhone: sup.phone,
            }
          : null;
      }

      default:
        return null;
    }
  },
};
