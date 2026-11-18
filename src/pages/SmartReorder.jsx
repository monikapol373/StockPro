import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import SuppliersContext from "../context/SuppliersContext";
import { useToast } from "../context/ToastContext";

import { getReorderRecommendation } from "../utils/reorder";
import { getOrderStatus } from "../utils/orders";

const getNextOrderId = (orders) => {
  const maxNumber = orders.reduce((max, order) => {
    const number = parseInt(String(order.id).replace(/\D/g, ""), 10);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 1000);

  return `ORD-${maxNumber + 1}`;
};

const getDefaultExpectedDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const SmartReorder = () => {
  const { products = [] } = useContext(InventoryContext);
  const { orders = [], setOrders } = useContext(OrdersContext);
  const { suppliers = [] } = useContext(SuppliersContext);

  const toast = useToast();
  const navigate = useNavigate();

  const lowStockProducts = products
    .filter((product) => product.category !== "Finished Goods")
    .map((product) => ({
      ...product,
      recommendation: getReorderRecommendation(product),
    }))
    .filter((product) => product.recommendation.needsReorder)
    .sort(
      (a, b) =>
        a.recommendation.currentStock - b.recommendation.currentStock
    );

  const handleCreateOrder = (event, product) => {
    event.preventDefault();

    const existingOrder = orders.find((order) => {
      const sameProduct =
        String(order.productId) === String(product.id);

      const status = getOrderStatus(order);
      const isActive =
        status === "Pending" || status === "Partially Received";

      return sameProduct && isActive;
    });

    if (existingOrder) {
      toast.info(
        `An active purchase order (${existingOrder.id}) already exists for ${product.name}. Receive the remaining stock before creating another order.`
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const supplierId = formData.get("supplierId");
    const expectedDate = formData.get("expectedDate");

    const supplier = suppliers.find(
      (item) => String(item.id) === String(supplierId)
    );

    if (!supplier) {
      toast.error("Please select a supplier.");
      return;
    }

    if (!expectedDate) {
      toast.error("Please select an expected delivery date.");
      return;
    }

    const recommendation = getReorderRecommendation(product);
    const quantity = recommendation.suggestedQuantity;

    if (quantity <= 0) {
      toast.info("This product does not need reordering.");
      return;
    }

    const newOrder = {
      id: getNextOrderId(orders),
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      quantity,
      receivedQty: 0,
      expectedDate,
      createdDate: new Date().toISOString(),
    };

    setOrders((previousOrders) => [
      newOrder,
      ...previousOrders,
    ]);

    toast.success(`${newOrder.id} created for ${product.name}`);
  };

  const findActive = (product) =>
    orders.find((order) => {
      const status = getOrderStatus(order);
      return (
        String(order.productId) === String(product.id) &&
        (status === "Pending" || status === "Partially Received")
      );
    });
  const totalUnits = lowStockProducts.reduce((s, p) => s + p.recommendation.suggestedQuantity, 0);
  const stats = [
    { l: "Low-stock Products", v: lowStockProducts.length, c: "#fb923c", s: "below minimum level" },
    { l: "Units to Reorder", v: totalUnits.toLocaleString("en-IN"), c: "#8b5cf6", s: "suggested in total" },
    { l: "Already Ordered", v: lowStockProducts.filter((p) => findActive(p)).length, c: "#60a5fa", s: "active purchase orders" },
    { l: "Suppliers Available", v: suppliers.length, c: "#34d399", s: "ready to order from" },
  ];

  return (
    <section className="sr pg">
      <header className="pg-head">
        <div>
          <h1>Smart Reorder</h1>
          <p>Review low-stock products and create purchase orders.</p>
        </div>
        <button type="button" className="pg-btn" onClick={() => navigate("/orders")}>
          View Purchase Orders
        </button>
      </header>

      <div className="pg-stats">
        {stats.map((s) => (
          <div className="pg-stat" key={s.l} style={{ "--c": s.c }}>
            <small>{s.l}</small>
            <strong>{s.v}</strong>
            <span>{s.s}</span>
          </div>
        ))}
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="pg-empty">All good! No products currently need reordering.</div>
      ) : (
        <div className="sr-list">
          {lowStockProducts.map((product) => {
            const recommendation = product.recommendation;
            const activeOrder = findActive(product);
            const target = Math.max(Number(recommendation.targetStock) || 0, 1);
            const curPct = Math.min(100, ((Number(recommendation.currentStock) || 0) / target) * 100);
            const minPct = Math.min(100, ((Number(recommendation.minimumStock) || 0) / target) * 100);
            return (
              <article className="sr-row" key={product.id}>
                <div className="sr-prod">
                  <b>{product.name}</b>
                  <small>{product.category}</small>
                </div>

                <div className="sr-gauge">
                  <div className="sr-gauge-t">
                    <span>Now <b>{recommendation.currentStock} {product.unit}</b></span>
                    <span>Min <b>{recommendation.minimumStock}</b></span>
                    <span>Target <b>{recommendation.targetStock}</b></span>
                  </div>
                  <div className="sr-bar">
                    <i className={Number(recommendation.currentStock) === 0 ? "bad" : "warn"} style={{ width: `${curPct}%` }} />
                    <s style={{ left: `${minPct}%` }} />
                  </div>
                </div>

                <div className="sr-suggest">
                  <small>Suggested order</small>
                  <strong>{recommendation.suggestedQuantity}</strong>
                  <span>{product.unit}</span>
                </div>

                <div className="sr-action">
                  {activeOrder ? (
                    <div className="sr-active">
                      <span className="pg-pill info">Active order {activeOrder.id}</span>
                      <small>Status: {getOrderStatus(activeOrder)}</small>
                      <button type="button" className="pg-btn" onClick={() => navigate("/orders")}>
                        View order
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={(event) => handleCreateOrder(event, product)} className="sr-form">
                      <select
                        name="supplierId"
                        required
                        defaultValue=""
                        aria-label={`Supplier for ${product.name}`}
                      >
                        <option value="" disabled>Select supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        name="expectedDate"
                        required
                        min={getDefaultExpectedDate()}
                        defaultValue={getDefaultExpectedDate()}
                        aria-label={`Expected delivery for ${product.name}`}
                      />
                      <button type="submit" className="pg-primary sm" disabled={suppliers.length === 0}>
                        Create order
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SmartReorder;