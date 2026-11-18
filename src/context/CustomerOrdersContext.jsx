import React, { createContext, useContext } from 'react'
import usePersistentState from '../hooks/usePersistentState';
import { seedCustomerOrders } from '../data/seed';
import InventoryContext from './InventoryContext';
import { validCustomerOrders } from '../utils/validators';

const CustomerOrdersContext = createContext();

export const CustomerOrdersProvider = ({ children }) => {
  const [customerOrders, setCustomerOrders] = usePersistentState('stockpro:customerOrders', seedCustomerOrders, validCustomerOrders);
  const { products, recordMovement } = useContext(InventoryContext);

  const createCustomerOrder = ({ customerName, productId, quantity }) => {
    const product = products.find((p) => p.id === productId);
    const qty = Number(quantity);

    if (!customerName.trim()) return { ok: false, error: "Customer name is required."};
    if (!product) return { ok: false, error: "Select a product."};
    if (!Number.isInteger(qty) || qty <= 0) return { ok: false, error: "Enter a valid quantity."};
    
    const newOrder = {
      id: `CO-${2000 + customerOrders.length + 1}`,
      customerName: customerName.trim(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      status: "Pending",
      orderDate: new Date().toISOString().slice(0, 10),
    };

    setCustomerOrders([newOrder, ...customerOrders]);
    return { ok: true };
  };

  const dispatchOrder = (orderId) => {
    const order = customerOrders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: "Order not found."};
    if (order.status !== "Pending") return { ok: false, error: "Order already dispatched."};

    const product = products.find((p) => p.id === order.productId);
    if (!product || product.quantity < order.quantity) {
      return { ok: false, error: `Not enough ${order.productName} in stock to  dispatch.` };
    }

    const result = recordMovement ({
      productId: order.productId,
      type: "OUT",
      quantity: order.quantity,
      reason: `Dispatched for Customer Order ${order.id} (${order.customerName})`,
    });
    if (!result.ok) return { ok: false, error: result.error };

    setCustomerOrders(
      customerOrders.map((o) => (o.id === orderId ? { ...o, status: "Dispatched", dispatchedDate: new Date().toISOString() } : o))
    );
    return { ok: true };
  };
  
  return (
    <CustomerOrdersContext.Provider value={{ customerOrders, createCustomerOrder, dispatchOrder}}>
    {children}
  </CustomerOrdersContext.Provider>
  )
}

export default CustomerOrdersContext
