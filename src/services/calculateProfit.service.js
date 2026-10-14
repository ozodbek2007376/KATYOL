/**
 * Pure calculation service for profit margin, gross revenue, net profit, and ROI.
 */
export const calculateProfitMargin = (sellingPrice, totalCost) => {
  const price = Number(sellingPrice) || 0;
  const cost = Number(totalCost) || 0;

  const grossProfit = price - cost;
  const marginPercentage = price > 0 ? (grossProfit / price) * 100 : 0;
  const markupPercentage = cost > 0 ? (grossProfit / cost) * 100 : 0;

  return {
    grossProfit,
    marginPercentage: Number(marginPercentage.toFixed(2)),
    markupPercentage: Number(markupPercentage.toFixed(2)),
  };
};

export const calculateBatchProfitability = (unitsSold, unitSellingPrice, unitProductionCost) => {
  const units = Number(unitsSold) || 0;
  const revenue = units * (Number(unitSellingPrice) || 0);
  const totalCost = units * (Number(unitProductionCost) || 0);
  const netProfit = revenue - totalCost;

  return {
    revenue,
    totalCost,
    netProfit,
    profitMargin: revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(2)) : 0,
  };
};
