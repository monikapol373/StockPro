import React, { useContext, useMemo } from "react";
import * as XLSX from "xlsx";
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

// Excel download helper
const downloadExcel = (filename, sheetName, rows) => {
  if (!rows || rows.length === 0) return false;
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  const cols = Object.keys(rows[0]).map((k) => ({ wch: Math.max(k.length + 2, 14) }));
  ws["!cols"] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  return true;
};

// All-in-one export
const downloadAllExcel = (products, movements, orders, customerOrders, productions, getStockStatus, getOrderStatus) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1 — Inventory
  if (products.length > 0) {
    const ws1 = XLSX.utils.json_to_sheet(products.map((p) => ({
      ID: p.id,
      Name: p.name,
      Category: p.category,
      Quantity: p.quantity,
      Unit: p.unit,
      "Price (₹)": p.price,
      "Value (₹)": p.quantity * p.price,
      Status: getStockStatus(p),
    })));
    ws1["!cols"] = [8, 24, 16, 10, 8, 12, 14, 12].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws1, "Inventory");
  }

  // Sheet 2 — Stock Movements
  if (movements.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(
      [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).map((m) => ({
        Date: m.date ? new Date(m.date).toLocaleString("en-IN") : "",
        Product: m.productName,
        Type: m.type,
        Change: m.change,
        "Balance After": m.balanceAfter,
        Reason: m.reason || "",
      }))
    );
    ws2["!cols"] = [20, 24, 10, 8, 14, 20].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws2, "Stock Movements");
  }

  // Sheet 3 — Purchase Orders
  if (orders.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(orders.map((o) => ({
      "Order ID": o.id,
      Supplier: o.supplierName,
      Product: o.productName,
      Quantity: o.quantity,
      Received: o.receivedQty,
      "Expected Date": o.expectedDate || "",
      Status: getOrderStatus(o),
    })));
    ws3["!cols"] = [12, 20, 20, 10, 10, 14, 16].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws3, "Purchase Orders");
  }

  // Sheet 4 — Customer Orders
  if (customerOrders.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(customerOrders.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      Product: o.productName,
      Quantity: o.quantity,
      Status: o.status,
      "Order Date": o.orderDate || "",
    })));
    ws4["!cols"] = [12, 20, 20, 10, 12, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws4, "Customer Orders");
  }

  // Sheet 5 — Productions
  if (productions.length > 0) {
    const ws5 = XLSX.utils.json_to_sheet(productions.map((p) => ({
      "Production ID": p.id,
      Product: p.productName,
      "Target Qty": p.targetQty,
      "Produced Qty": p.producedQty || 0,
      Status: p.status,
      "Start Date": p.startDate || "",
    })));
    ws5["!cols"] = [14, 20, 12, 12, 12, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws5, "Productions");
  }

  XLSX.writeFile(wb, `StockPro-Full-Report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  return true;
};

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

  const exportInventory = () => {
    const ok = downloadExcel("inventory-report.xlsx", "Inventory", products.map((p) => ({
      ID: p.id, Name: p.name, Category: p.category,
      Quantity: p.quantity, Unit: p.unit,
      "Price (₹)": p.price, "Value (₹)": p.quantity * p.price,
      Status: getStockStatus(p),
    })));
    ok ? toast.success("Inventory Excel downloaded") : toast.info("Nothing to export yet");
  };

  const exportMovements = () => {
    const ok = downloadExcel("stock-movements.xlsx", "Movements",
      [...(Array.isArray(movements) ? movements : [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((m) => ({
          Date: m.date ? new Date(m.date).toLocaleString("en-IN") : "",
          Product: m.productName, Type: m.type,
          Change: m.change, "Balance After": m.balanceAfter,
          Reason: m.reason || "",
        }))
    );
    ok ? toast.success("Stock Movements Excel downloaded") : toast.info("Nothing to export yet");
  };

  const exportPurchases = () => {
    const ok = downloadExcel("purchase-orders.xlsx", "Purchase Orders", orders.map((o) => ({
      "Order ID": o.id, Supplier: o.supplierName, Product: o.productName,
      Quantity: o.quantity, Received: o.receivedQty,
      "Expected Date": o.expectedDate || "", Status: getOrderStatus(o),
    })));
    ok ? toast.success("Purchase Orders Excel downloaded") : toast.info("Nothing to export yet");
  };

  const exportCustomers = () => {
    const ok = downloadExcel("customer-orders.xlsx", "Customer Orders", customerOrders.map((o) => ({
      "Order ID": o.id, Customer: o.customerName, Product: o.productName,
      Quantity: o.quantity, Status: o.status, "Order Date": o.orderDate || "",
    })));
    ok ? toast.success("Customer Orders Excel downloaded") : toast.info("Nothing to export yet");
  };

  const exportAll = () => {
    const ok = downloadAllExcel(products, movements, orders, customerOrders, productions, getStockStatus, getOrderStatus);
    ok ? toast.success("Full Report Excel downloaded — 5 sheets!") : toast.info("Nothing to export yet");
  };

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
        <button
          type="button"
          className="pg-primary"
          onClick={exportAll}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          📊 Export Full Report
        </button>
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
            <em>XLSX</em>
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