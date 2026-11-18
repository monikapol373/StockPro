export function calculateMaxProducible(bom, products) {
  let max = Infinity;
  let limitingComponent = null;

  const breakdown = bom.components.map((c) => {
    const product = products.find((p) => p.id === c.productId);
    const available = product ? product.quantity : 0;
    const possibleUnits = c.quantityPerUnit > 0 ? Math.floor(available / c.quantityPerUnit) : 0;

    if (possibleUnits < max) {
      max = possibleUnits;
      limitingComponent = product ? product.name : c.productId;
    }

    return {
      productId: c.productId,
      productName: product ? product.name : c.productId,
      unit: product ? product.unit : "",
      quantityPerUnit: c.quantityPerUnit,
      available,
      possibleUnits,
    };
  });

  return {
    maxUnits: max === Infinity ? 0 : max,
    limitingComponent,
    breakdown,
  };
}