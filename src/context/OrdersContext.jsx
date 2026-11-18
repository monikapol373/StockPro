import React, { createContext } from 'react'
import usePersistentState from '../hooks/usePersistentState';
import { seedOrders } from '../data/seed';
import { validOrders } from '../utils/validators';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
     const [orders, setOrders] = usePersistentState('stockpro:orders', seedOrders, validOrders);

  return (
   <OrdersContext.Provider value={{orders, setOrders}}>
    {children}
   </OrdersContext.Provider>
  );
};

export default OrdersContext
