
export const getReorderRecommendation = (product) => {
  const currentStock = Number(product.quantity) || 0;

  const minimumStock = Number(product.minStock ?? 20);

  // First define targetStock
  const targetStock = minimumStock * 2;

  // Then calculate suggested quantity
  const suggestedQuantity = Math.max(
    0,
    targetStock - currentStock
  );

  return {
    currentStock,
    minimumStock,
    targetStock,
    suggestedQuantity,
    needsReorder: currentStock <= minimumStock,
  };
};
