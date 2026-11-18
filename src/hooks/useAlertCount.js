import { useContext, useMemo } from "react";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import BomContext from "../context/BomContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import {
  getLowStockProducts,
  getOverduePurchaseOrders,
  getBlockedProductionOrders,
  getAtRiskCustomerOrders,
} from "../utils/intelligence";

// Sidebar badge aur top bar bell ke liye: kul active alerts ki ginti
export default function useAlertCount() {
  const { products = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const { boms = [] } = useContext(BomContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  return useMemo(() => {
    try {
      return (
        getLowStockProducts(products).length +
        getOverduePurchaseOrders(orders).length +
        getBlockedProductionOrders(productions, boms, products).length +
        getAtRiskCustomerOrders(customerOrders, products).length
      );
    } catch {
      return 0;
    }
  }, [products, orders, boms, productions, customerOrders]);
}
