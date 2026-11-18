import React from "react";
import { Link } from "react-router-dom";
import {
  getLowStockProducts,
  getOverduePurchaseOrders,
  getBlockedProductionOrders,
  getAtRiskCustomerOrders,
} from "../utils/intelligence";

const IntelligencePanel = ({
  products = [],
  orders = [],
  boms = [],
  productions = [],
  customerOrders = [],
}) => {
  const cards = [
    { label: "Material Shortages", count: getLowStockProducts(products).length },
    { label: "Overdue Purchase Orders", count: getOverduePurchaseOrders(orders).length },
    { label: "Blocked Production", count: getBlockedProductionOrders(productions, boms, products).length },
    { label: "Customer Orders at Risk", count: getAtRiskCustomerOrders(customerOrders, products).length },
  ];

  const total = cards.reduce((s, c) => s + c.count, 0);

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0 }}>Business Risks</h2>
        <Link to="/alerts" style={{ color: "#0f766e", fontWeight: 600, fontSize: 14 }}>
          {total > 0 ? "View details and impact chain →" : "Open Alert Center →"}
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 12 }}>
        {cards.map((c) => (
          <Link
            key={c.label}
            to="/alerts"
            style={{
              background: "#fff",
              border: `1px solid ${c.count > 0 ? "#fcd9b6" : "#e5e7eb"}`,
              borderRadius: 12,
              padding: 16,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: c.count > 0 ? "#b45309" : "#0f766e" }}>
              {c.count}
            </div>
            <div style={{ fontSize: 13, color: "#5d6b6c" }}>{c.label}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default IntelligencePanel;