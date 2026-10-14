/**
 * Pure calculation service for Bill of Materials (BOM) recipe scaling.
 */
export const calculateRecipeScale = (baseRecipeItems = [], targetBatchSize = 1, baseBatchSize = 1) => {
  const scaleFactor = (Number(targetBatchSize) || 1) / (Number(baseBatchSize) || 1);

  const scaledIngredients = baseRecipeItems.map((ingredient) => {
    const requiredQty = (Number(ingredient.quantity) || 0) * scaleFactor;
    const estimatedCost = requiredQty * (Number(ingredient.unitCost) || 0);

    return {
      ...ingredient,
      scaledQuantity: Number(requiredQty.toFixed(4)),
      estimatedCost: Number(estimatedCost.toFixed(2)),
    };
  });

  const totalRecipeCost = scaledIngredients.reduce((acc, item) => acc + item.estimatedCost, 0);

  return {
    scaleFactor,
    scaledIngredients,
    totalRecipeCost: Number(totalRecipeCost.toFixed(2)),
  };
};
