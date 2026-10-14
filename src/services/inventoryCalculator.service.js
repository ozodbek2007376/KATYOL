/**
 * Pure calculation service for stock valuation, reorder point alert triggers, and inventory turnover.
 */
export const calculateStockValuation = (items = []) => {
  let totalItemsCount = 0;
  let totalValuation = 0;
  let lowStockAlertCount = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const unitCost = Number(item.unitCost) || 0;
    const minThreshold = Number(item.minThreshold) || 5;

    totalItemsCount += qty;
    totalValuation += qty * unitCost;

    if (qty <= minThreshold) {
      lowStockAlertCount += 1;
    }
  });

  return {
    totalItemsCount,
    totalValuation: Number(totalValuation.toFixed(2)),
    lowStockAlertCount,
  };
};

export const checkStockAvailability = (requiredItems = [], currentStockMap = {}) => {
  const shortages = [];

  requiredItems.forEach((req) => {
    const available = Number(currentStockMap[req.itemId]) || 0;
    const needed = Number(req.quantity) || 0;

    if (available < needed) {
      shortages.push({
        itemId: req.itemId,
        name: req.name || req.itemId,
        needed,
        available,
        shortage: needed - available,
      });
    }
  });

  return {
    isAvailable: shortages.length === 0,
    shortages,
  };
};
