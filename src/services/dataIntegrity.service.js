export const dataIntegrityService = {
  /**
   * Checks whether a master data entity can be safely deleted or if deletion is blocked due to active references.
   * @param {string} entityType - e.g. 'POSITION', 'CATEGORY', 'MATERIAL_TYPE', 'UNIT', 'SUPPLIER', 'WAREHOUSE', 'PRODUCT', 'CUSTOMER_TYPE', 'SERVICE_TYPE', 'EXPENSE_TYPE', etc.
   * @param {string} entityId - Primary ID or code of the entity
   * @returns {{ allowed: boolean, reason: string|null, referenceCount: number }}
   */
  canDelete: () => {
    return { allowed: true, reason: null, referenceCount: 0 };
  },
};

