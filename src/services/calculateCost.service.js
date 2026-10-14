/**
 * Pure calculation service for manufacturing unit costs, overheads, and total batch costs.
 * Fully decoupled from React UI.
 */
export const calculateManufacturingCost = ({
  rawMaterials = [],
  directLaborCost = 0,
  overheadCost = 0,
  wastePercentage = 0,
}) => {
  const rawMaterialsSubtotal = rawMaterials.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return acc + qty * unitPrice;
  }, 0);

  const wasteAmount = (rawMaterialsSubtotal * (Number(wastePercentage) || 0)) / 100;
  const totalRawMaterialCost = rawMaterialsSubtotal + wasteAmount;
  const grandTotalCost = totalRawMaterialCost + Number(directLaborCost) + Number(overheadCost);

  return {
    rawMaterialsSubtotal,
    wasteAmount,
    totalRawMaterialCost,
    directLaborCost: Number(directLaborCost),
    overheadCost: Number(overheadCost),
    grandTotalCost,
  };
};

export const calculateUnitCost = (grandTotalCost, unitsProduced) => {
  const units = Number(unitsProduced) || 0;
  if (units <= 0) return 0;
  return grandTotalCost / units;
};
