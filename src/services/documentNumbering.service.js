/**
 * Centralized Enterprise Document Numbering System Service - Kotyol ERP
 * Generates reusable, backend-ready, configurable document numbers.
 */

const DEFAULT_CONFIGS = {
  ORDER: { prefix: 'ORD', sequenceLength: 6, currentCounter: 1001 },
  PRODUCTION: { prefix: 'PRD', sequenceLength: 6, currentCounter: 2001 },
  SALE: { prefix: 'SAL', sequenceLength: 6, currentCounter: 3001 },
  INVOICE: { prefix: 'INV', sequenceLength: 6, currentCounter: 9001 },
  PURCHASE: { prefix: 'PUR', sequenceLength: 6, currentCounter: 5001 },
  PURCHASING: { prefix: 'PUR', sequenceLength: 6, currentCounter: 5001 },
  MOVEMENT: { prefix: 'MOV', sequenceLength: 6, currentCounter: 6001 },
  SERVICE: { prefix: 'SRV', sequenceLength: 6, currentCounter: 7001 },
  BOILER: { prefix: 'BOIL', sequenceLength: 6, currentCounter: 8001 },
  RECIPE: { prefix: 'REC', sequenceLength: 6, currentCounter: 9001 },
};

const STORAGE_KEY = 'kotyol_document_numbering_state';

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default configs to ensure new keys exist
      return { ...DEFAULT_CONFIGS, ...parsed };
    }
  } catch (_err) {
    // Ignore storage parse errors
  }
  return { ...DEFAULT_CONFIGS };
};

let numberingState = loadState();

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(numberingState));
  } catch (_err) {
    // Ignore storage write errors
  }
};

export const documentNumberingService = {
  /**
   * Generates a formatted document number based on type and year
   * Example: generateNumber('ORDER') -> "ORD-2026-000101"
   */
  generateNumber(documentType, year = new Date().getFullYear()) {
    const typeKey = (documentType || '').toUpperCase();
    const config = numberingState[typeKey] || { prefix: 'DOC', sequenceLength: 6, currentCounter: 1 };

    const paddedCounter = String(config.currentCounter).padStart(config.sequenceLength, '0');
    const documentNumber = `${config.prefix}-${year}-${paddedCounter}`;

    // Auto-increment counter for next call
    numberingState[typeKey] = {
      ...config,
      currentCounter: config.currentCounter + 1,
    };
    saveState();

    return documentNumber;
  },

  /**
   * Returns current configuration for a document type
   */
  getConfig(documentType) {
    const typeKey = (documentType || '').toUpperCase();
    return numberingState[typeKey] || DEFAULT_CONFIGS.ORDER;
  },

  /**
   * Updates configuration dynamically (Administrator Settings backend-ready)
   */
  updateConfig(documentType, newConfig) {
    const typeKey = (documentType || '').toUpperCase();
    numberingState[typeKey] = {
      ...numberingState[typeKey],
      ...newConfig,
    };
  },
};
