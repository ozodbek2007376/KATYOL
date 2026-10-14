/**
 * Centralized Enterprise Business Rules Engine - Kotyol ERP
 * Pure, side-effect-free business logic decoupled from React components.
 */

export const businessRulesService = {
  /**
   * Calculates total manufacturing cost breakdown for a Boiler model
   */
  calculateBoilerCost({ materialCost = 0, stageCost = 0, laborCost = 0, overheadRate = 0.05 }) {
    const mat = Number(materialCost) || 0;
    const stg = Number(stageCost) || 0;
    const lbr = Number(laborCost) || 0;

    const baseCost = mat + stg + lbr;
    const overheadCost = baseCost * overheadRate;
    const totalCost = baseCost + overheadCost;

    return {
      materialCost: mat,
      stageCost: stg,
      laborCost: lbr,
      overheadCost,
      overheadRatePercent: Math.round(overheadRate * 100),
      baseCost,
      totalCost,
      formula: `Tannarx = (Material: $${mat.toLocaleString()} + Bosqichlar: $${stg.toLocaleString()} + Ish haqi: $${lbr.toLocaleString()}) + Qo'shimcha xarajatlar (${Math.round(
        overheadRate * 100
      )}%: $${overheadCost.toLocaleString()}) = $${totalCost.toLocaleString()}`,
    };
  },

  /**
   * Calculates profit amount and profit margin percentage
   */
  calculateProfitMargin({ sellingPrice = 0, costPrice = 0 }) {
    const sell = Number(sellingPrice) || 0;
    const cost = Number(costPrice) || 0;

    const profit = sell - cost;
    const marginPercent = sell > 0 ? (profit / sell) * 100 : 0;

    return {
      profit,
      marginPercent: Number(marginPercent.toFixed(2)),
      isProfitable: profit > 0,
      formula: `Foyda = Sotish Narxi ($${sell.toLocaleString()}) - Tannarx ($${cost.toLocaleString()}) = $${profit.toLocaleString()} (Marja: ${marginPercent.toFixed(
        1
      )}%)`,
    };
  },

  /**
   * Calculates tax (VAT) and discount financial breakdown
   */
  calculateTaxAndDiscount({ subtotal = 0, discountPercent = 0, taxPercent = 12 }) {
    const sub = Number(subtotal) || 0;
    const discP = Number(discountPercent) || 0;
    const taxP = Number(taxPercent) || 0;

    const discountAmount = (sub * discP) / 100;
    const discountedSubtotal = Math.max(0, sub - discountAmount);
    const taxAmount = (discountedSubtotal * taxP) / 100;
    const grandTotal = discountedSubtotal + taxAmount;

    return {
      subtotal: sub,
      discountAmount,
      discountedSubtotal,
      taxAmount,
      grandTotal,
      formula: `Yakuniy Summa = ($${sub.toLocaleString()} - Chegirma ${discP}%: $${discountAmount.toLocaleString()}) + QQS ${taxP}% ($${taxAmount.toLocaleString()}) = $${grandTotal.toLocaleString()}`,
    };
  },

  /**
   * Calculates subtotal for an array of items with quantity and unitPrice
   */
  calculateItemsSubtotal(items = []) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  },

  /**
   * Calculates financial totals including subtotal, discount, tax and grand total
   */
  calculateFinancialTotals({ subtotal = 0, discountAmount = 0, taxRate = 12 }) {
    const sub = Number(subtotal) || 0;
    const disc = Number(discountAmount) || 0;
    const taxR = Number(taxRate) || 0;

    const discountedSubtotal = Math.max(0, sub - disc);
    const taxAmount = (discountedSubtotal * taxR) / 100;
    const totalAmount = discountedSubtotal + taxAmount;

    return {
      subtotal: sub,
      discountAmount: disc,
      discountedSubtotal,
      taxRate: taxR,
      taxAmount,
      totalAmount,
      grandTotal: totalAmount,
    };
  },

  /**
   * Validates raw material stock availability for production batch
   */
  validateStockAvailability({ requiredItems = [], availableStockMap = {} }) {
    let isEnough = true;
    const missingItems = [];

    requiredItems.forEach((item) => {
      const available = availableStockMap[item.productId] || 0;
      if (available < item.requiredQty) {
        isEnough = false;
        missingItems.push({
          productId: item.productId,
          materialName: item.materialName,
          required: item.requiredQty,
          available,
          shortage: item.requiredQty - available,
        });
      }
    });

    return {
      isAvailable: isEnough,
      status: isEnough ? 'ENOUGH' : 'MISSING',
      missingItems,
    };
  },
};

