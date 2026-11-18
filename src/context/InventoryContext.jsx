import React, { createContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { seedProducts } from '../data/seed';
import { validProducts, validMovements } from '../utils/validators';
import { makeId } from '../utils/ids';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = usePersistentState('stockpro:products', seedProducts, validProducts);
  const [movements, setMovements] = usePersistentState('stockpro:movements', [], validMovements);

  const recordMovement = ({ productId, type, quantity, reason = "" }) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return { ok: false, error: "Product not found." };

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      return { ok: false, error: "Enter a valid whole number." };
    }
    if (type !== "ADJUST" && qty === 0) {
      return { ok: false, error: "Quantity must be greater than 0." };
    }

    let change;
    if (type === "IN") {
      change = qty;
    } else if (type === "OUT") {
      if (qty > product.quantity) {
        return { ok: false, error: `Only ${product.quantity} ${product.unit} in stock.` };
      }
      change = -qty;
    } else if (type === "ADJUST") {
      if (!reason.trim()) {
        return { ok: false, error: "Reason is required for an adjustment." };
      }
      change = qty - product.quantity;
      if (change === 0) {
        return { ok: false, error: "Counted quantity matches system stock." };
      }
    } else {
      return { ok: false, error: "Invalid movement type." };
    }

    const balanceAfter = product.quantity + change;

    // ID updater ke bahar banti hai, taaki har movement ki apni unique ID ho
    const movement = {
      id: makeId('MOV'),
      productId,
      productName: product.name,
      type,
      change,
      balanceAfter,
      reason: reason.trim(),
      date: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + change } : p))
    );
    setMovements((prev) => [movement, ...prev]);

    return { ok: true };
  };

  return (
    <InventoryContext.Provider value={{ products, setProducts, movements, recordMovement }}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;