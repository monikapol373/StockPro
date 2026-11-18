import React, { useContext, useMemo, useState } from "react";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import BomContext from "../context/BomContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import {
  buildImpactChain,
  getAtRiskCustomerOrders,
  getBlockedProductionOrders,
  getLowStockProducts,
  getOverduePurchaseOrders,
} from "../utils/intelligence";
import DecisionLogContext from "../context/DecisionLogContext";

const ICON = {
  short: <path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8" />,
  po: (
    <>
      <rect x="2" y="7" width="12" height="9" rx="1" />
      <path d="M14 10h4l4 4v2h-8" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  prod: <path d="M3 21V10l6 4v-4l6 4V6h6v15z" />,
  co: <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" />,
};

const TABS = [
  { id: "all", label: "All alerts" },
  { id: "short", label: "Material shortages" },
  { id: "po", label: "Overdue POs" },
  { id: "prod", label: "Blocked production" },
  { id: "co", label: "Orders at risk" },
];

const LOG_ICON = {
  "Material Shortage": "short",
  "Overdue Purchase Order": "po",
  "Blocked Production": "prod",
  "Customer Order At Risk": "co",
};

const Svg = ({ k }) => (
  <svg className="al-svg" viewBox="0 0 24 24">{ICON[k] || ICON.short}</svg>
);

const Chain = ({ product, chainGroups }) => (
  <div className="al-chain">
    <div className="al-node">
      <small>Material shortage</small>
      <b>{product.name}</b>
      <span>{product.quantity} {product.unit} left</span>
    </div>

    {chainGroups.map((g, i) => (
      <React.Fragment key={i}>
        <i className="al-arrow">→</i>
        <div className="al-node">
          <small>Production order</small>
          <b>{g.productionOrder.id}</b>
          <span>{g.bom.finishedProductName}</span>
        </div>

        {g.customerOrders.length > 0 ? (
          g.customerOrders.map((co) => (
            <React.Fragment key={co.id}>
              <i className="al-arrow">→</i>
              <div className="al-node hit">
                <small>Customer order</small>
                <b>{co.id}</b>
                <span>{co.customerName}</span>
              </div>
            </React.Fragment>
          ))
        ) : (
          <>
            <i className="al-arrow">→</i>
            <div className="al-node ok">
              <small>No customer impact</small>
              <b>Not yet ordered</b>
            </div>
          </>
        )}
      </React.Fragment>
    ))}
  </div>
);

const Alerts = () => {
  const { products = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const { boms = [] } = useContext(BomContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);
  const { decisions = [], logDecision, isResolved } = useContext(DecisionLogContext);

  const [tab, setTab] = useState("all");

  const lowStock = useMemo(() => getLowStockProducts(products), [products]);
  const overduePOs = useMemo(() => getOverduePurchaseOrders(orders), [orders]);
  const blockedProduction = useMemo(
    () => getBlockedProductionOrders(productions, boms, products),
    [productions, boms, products]
  );
  const atRiskCustomerOrders = useMemo(
    () => getAtRiskCustomerOrders(customerOrders, products),
    [customerOrders, products]
  );

  const items = [
    ...lowStock.map((p) => ({
      key: `s-${p.id}`,
      kind: "short",
      tone: Number(p.quantity) === 0 ? "bad" : "warn",
      title: `${p.name} is running low`,
      detail: `${p.quantity} ${p.unit} remaining`,
      refId: `low-stock-${p.id}`,
      product: p,
      chain: buildImpactChain(p, { boms, productions, customerOrders }),
      log: {
        alertType: "Material Shortage",
        summary: `${p.name} running low (${p.quantity} ${p.unit})`,
        action: "Acknowledged — reorder in progress",
      },
    })),
    ...overduePOs.map((o) => ({
      key: `p-${o.id}`,
      kind: "po",
      tone: "warn",
      title: `${o.id} — ${o.supplierName}`,
      detail: `${o.productName}, expected ${o.expectedDate}, still not fully received`,
      refId: `overdue-po-${o.id}`,
      log: {
        alertType: "Overdue Purchase Order",
        summary: `${o.id} from ${o.supplierName} is overdue`,
        action: "Acknowledged — followed up with supplier",
      },
    })),
    ...blockedProduction.map(({ order, limitingComponent, maxUnits }) => ({
      key: `b-${order.id}`,
      kind: "prod",
      tone: "bad",
      title: `${order.id} — ${order.finishedProductName}`,
      detail: `Needs ${order.targetQty} units, only ${maxUnits} possible — limited by ${limitingComponent}`,
      refId: `blocked-po-${order.id}`,
      log: {
        alertType: "Blocked Production",
        summary: `${order.id} blocked, limited by ${limitingComponent}`,
        action: "Acknowledged — sourcing alternate supplier",
      },
    })),
    ...atRiskCustomerOrders.map(({ order, available }) => ({
      key: `c-${order.id}`,
      kind: "co",
      tone: "bad",
      title: `${order.id} — ${order.customerName}`,
      detail: `Needs ${order.quantity} ${order.productName}, only ${available} in stock`,
      refId: `at-risk-co-${order.id}`,
      log: {
        alertType: "Customer Order At Risk",
        summary: `${order.id} for ${order.customerName} at risk`,
        action: "Acknowledged — customer notified of possible delay",
      },
    })),
  ];

  const countOf = (id) => (id === "all" ? items.length : items.filter((i) => i.kind === id).length);
  const open = items.filter((i) => !isResolved(i.refId)).length;
  const critical = items.filter((i) => i.tone === "bad" && !isResolved(i.refId)).length;
  const shown = tab === "all" ? items : items.filter((i) => i.kind === tab);

  return (
    <section className="al pg">
      <header className="pg-head">
        <div>
          <h1>Alert Center</h1>
          <p>Live findings from across inventory, procurement, production and orders.</p>
        </div>
        <div className="al-badges">
          <span className="pg-pill bad">{critical} critical open</span>
          <span className="pg-pill info">{open} open in total</span>
        </div>
      </header>

      <div className="al-tabs">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={tab === t.id ? "on" : ""}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            <strong>{countOf(t.id)}</strong>
          </button>
        ))}
      </div>

      <div className="al-layout">
        <div className="al-feed">
          {shown.length === 0 && (
            <div className="pg-empty">All clear. No alerts in this category right now.</div>
          )}

          {shown.map((it) => {
            const done = isResolved(it.refId);
            return (
              <article key={it.key} className={`al-card ${it.tone} ${done ? "done" : ""}`}>
                <span className="al-ic"><Svg k={it.kind} /></span>
                <div className="al-body">
                  <div className="al-top">
                    <b>{it.title}</b>
                    <span className={`pg-pill ${it.tone}`}>{it.tone === "bad" ? "Critical" : "Warning"}</span>
                  </div>
                  <p>{it.detail}</p>

                  {it.chain && it.chain.length > 0 && (
                    <Chain product={it.product} chainGroups={it.chain} />
                  )}

                  {done ? (
                    <span className="al-done">✓ Acknowledged</span>
                  ) : (
                    <button
                      type="button"
                      className="al-ack"
                      onClick={() => logDecision({ ...it.log, alertRefId: it.refId })}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="al-log">
          <div className="al-log-h">
            <h2>Decision Log</h2>
            <span className="pg-pill info">{decisions.length}</span>
          </div>
          <p className="al-log-sub">Every acknowledged action, who approved it, and when.</p>

          {decisions.length === 0 && <p className="al-empty">No decisions logged yet.</p>}

          {decisions.map((d) => (
            <div className="al-log-row" key={d.id}>
              <span className="al-log-ic"><Svg k={LOG_ICON[d.alertType]} /></span>
              <div>
                <b>{d.alertType}</b>
                <span>{d.summary}</span>
                <small>
                  {d.action} · by {d.actor} · {new Date(d.timestamp).toLocaleString("en-IN")}
                </small>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
};

export default Alerts;