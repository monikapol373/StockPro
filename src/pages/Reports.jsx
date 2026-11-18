import React, { useContext, useMemo } from "react";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import { useToast } from "../context/ToastContext";
import { getStockStatus } from "../utils/stock";
import { getOrderStatus } from "../utils/orders";
import {
  getInventoryByCategory,
  getProductionSummary,
  getCustomerOrderSummary,
  getPurchaseOrderSummary,
  downloadCSV,
} from "../utils/reports";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Bar = ({ value, total, tone = "cyan" }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rpt-bar" aria-hidden="true">
      <i className={tone} style={{ width: `${pct}%` }} />
    </div>
  );
};

const Row = ({ label, value, total, tone }) => (
  <div className="rpt-row">
    <div className="rpt-row-top">
      <span>{label}</span>
      <b>{value}</b>
    </div>
    <Bar value={value} total={total} tone={tone} />
  </div>
);

const Reports = () => {
  const toast = useToast();
  const { products = [], movements = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  const byCategory = useMemo(() => getInventoryByCategory(products), [products]);
  const production = useMemo(() => getProductionSummary(productions), [productions]);
  const customers = useMemo(() => getCustomerOrderSummary(customerOrders), [customerOrders]);
  const purchases = useMemo(() => getPurchaseOrderSummary(orders), [orders]);

  const totalValue = byCategory.reduce((s, c) => s + c.value, 0);
  const lowCount = products.filter((p) => getStockStatus(p) !== "In Stock").length;
  const productionTotal = production.Planned + production["In Progress"] + production.Completed;
  const purchaseTotal = purchases.Pending + purchases["Partially Received"] + purchases.Received;

  const exportFile = (filename, rows, label) => {
    try {
      if (downloadCSV(filename, rows)) toast.success(`${label} CSV downloaded`);
      else toast.info("Nothing to export yet");
    } catch (err) {
      console.error(err);
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const exportInventory = () =>
    exportFile(
      "inventory-report.csv",
      products.map((p) => ({
        ID: p.id,
        Name: p.name,
        Category: p.category,
        Quantity: p.quantity,
        Unit: p.unit,
        Price: p.price,
        Value: p.quantity * p.price,
        Status: getStockStatus(p),
      })),
      "Inventory"
    );

  const exportMovements = () =>
    exportFile(
      "stock-movements.csv",
      [...(Array.isArray(movements) ? movements : [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((m) => ({
          Date: m.date ? new Date(m.date).toLocaleString("en-IN") : "",
          Product: m.productName,
          Type: m.type,
          Change: m.change,
          BalanceAfter: m.balanceAfter,
          Reason: m.reason || "",
        })),
      "Movements"
    );

  const exportPurchases = () =>
    exportFile(
      "purchase-orders.csv",
      orders.map((o) => ({
        Order: o.id,
        Supplier: o.supplierName,
        Product: o.productName,
        Quantity: o.quantity,
        Received: o.receivedQty,
        Expected: o.expectedDate || "",
        Status: getOrderStatus(o),
      })),
      "Purchase orders"
    );

  const exportCustomers = () =>
    exportFile(
      "customer-orders.csv",
      customerOrders.map((o) => ({
        Order: o.id,
        Customer: o.customerName,
        Product: o.productName,
        Quantity: o.quantity,
        Status: o.status,
        OrderDate: o.orderDate || "",
      })),
      "Customer orders"
    );

  const kpis = [
    { l: "Inventory Value", v: inr(totalValue), c: "#22d3ee", s: `${products.length} products` },
    { l: "Needs Attention", v: lowCount, c: lowCount > 0 ? "#fb923c" : "#34d399", s: "low or out of stock" },
    { l: "Units Built", v: production.unitsCompleted, c: "#8b5cf6", s: `${production.Completed} completed orders` },
    {
      l: "Fulfilment Rate",
      v: `${customers.fulfillmentRate}%`,
      c: customers.fulfillmentRate >= 50 ? "#34d399" : "#fb923c",
      s: `${customers.fulfilled} of ${customers.total} dispatched`,
    },
  ];

  const downloads = [
    { t: "Inventory", d: "Every product with stock, price and value", f: exportInventory },
    { t: "Stock Movements", d: "Full ledger of in, out and adjust entries", f: exportMovements },
    { t: "Purchase Orders", d: "Orders with supplier and receipt status", f: exportPurchases },
    { t: "Customer Orders", d: "Orders with dispatch status", f: exportCustomers },
  ];

  return (
    <section className="rpt pg">
      <header className="pg-head">
        <div>
          <h1>Reports</h1>
          <p>Business summary across inventory, production and orders.</p>
        </div>
      </header>

      <div className="pg-stats">
        {kpis.map((s) => (
          <div className="pg-stat" key={s.l} style={{ "--c": s.c }}>
            <small>{s.l}</small>
            <strong>{s.v}</strong>
            <span>{s.s}</span>
          </div>
        ))}
      </div>

      <div className="rpt-dl">
        {downloads.map((d) => (
          <button type="button" key={d.t} className="rpt-dl-card" onClick={d.f}>
            <span className="rpt-dl-ic">
              <svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></svg>
            </span>
            <div>
              <b>{d.t}</b>
              <small>{d.d}</small>
            </div>
            <em>CSV</em>
          </button>
        ))}
      </div>

      <div className="rpt-grid">
        <section className="rpt-card">
          <div className="rpt-card-h"><h3>Production</h3><span>{productionTotal} orders</span></div>
          <Row label="Planned" value={production.Planned} total={productionTotal} tone="amber" />
          <Row label="In Progress" value={production["In Progress"]} total={productionTotal} tone="blue" />
          <Row label="Completed" value={production.Completed} total={productionTotal} tone="green" />
        </section>

        <section className="rpt-card">
          <div className="rpt-card-h"><h3>Customer Orders</h3><span>{customers.total} orders</span></div>
          <Row label="Pending" value={customers.pending} total={customers.total} tone="amber" />
          <Row label="Dispatched" value={customers.fulfilled} total={customers.total} tone="green" />
        </section>

        <section className="rpt-card">
          <div className="rpt-card-h"><h3>Purchase Orders</h3><span>{purchaseTotal} orders</span></div>
          <Row label="Pending" value={purchases.Pending} total={purchaseTotal} tone="amber" />
          <Row label="Partially Received" value={purchases["Partially Received"]} total={purchaseTotal} tone="blue" />
          <Row label="Received" value={purchases.Received} total={purchaseTotal} tone="green" />
        </section>
      </div>

      <section className="rpt-card">
        <div className="rpt-card-h"><h3>Inventory by Category</h3><span>{inr(totalValue)} total</span></div>
        {byCategory.length === 0 && <p className="rpt-empty">No inventory data.</p>}
        {byCategory.map((c) => {
          const share = totalValue ? Math.round((c.value / totalValue) * 100) : 0;
          return (
            <div className="rpt-cat" key={c.category}>
              <div className="rpt-cat-name">
                <b>{c.category}</b>
                <small>{c.items} items · {c.low} low or out</small>
              </div>
              <Bar value={c.value} total={totalValue} />
              <div className="rpt-cat-val">
                <b>{inr(c.value)}</b>
                <small>{share}%</small>
              </div>
            </div>
          );
        })}
      </section>
    </section>
  );
};

export default Reports;