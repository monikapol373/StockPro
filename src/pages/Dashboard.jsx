import React, { Suspense, lazy, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import BomContext from "../context/BomContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import { getStockStatus } from "../utils/stock";
import { getOrderStatus } from "../utils/orders";
import {
  getLowStockProducts,
  getOverduePurchaseOrders,
  getBlockedProductionOrders,
  getAtRiskCustomerOrders,
} from "../utils/intelligence";
import { calculateMaxProducible } from "../utils/bom";
import useCountUp from "../hooks/useCountUp";
import Icon from "../components/Icon";
import TrendChart from "../components/TrendChart";

const Warehouse3D = lazy(() => import("../components/Warehouse3D"));

const money = (n) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} Lakh` : `₹${Math.round(n).toLocaleString("en-IN")}`;

const curve = (vals, w, h) => {
  const mx = Math.max(...vals), mn = Math.min(...vals), span = mx - mn || 1;
  const X = (i) => (i / (vals.length - 1)) * w;
  const Y = (v) => h - 8 - ((v - mn) / span) * (h - 20);
  let d = `M0 ${Y(vals[0])}`;
  for (let i = 1; i < vals.length; i++) {
    const m = (X(i - 1) + X(i)) / 2;
    d += `C${m} ${Y(vals[i - 1])} ${m} ${Y(vals[i])} ${X(i)} ${Y(vals[i])}`;
  }
  return d;
};

const Spark = ({ vals }) => (
  <svg className="sx-spark" viewBox="0 0 100 34" preserveAspectRatio="none">
    <path d={curve(vals, 100, 34)} fill="none" vectorEffect="non-scaling-stroke" />
  </svg>
);

const Kpi = ({ icon, label, value, format, sub, tone, spark, c }) => {
  const shown = useCountUp(value);
  return (
    <div className="sx-k" style={{ "--c": c }}>
      <div className="sx-k-top">
        <span className="sx-k-ic"><Icon name={icon} size={18} /></span>
        {label}
      </div>
      <strong>{format ? format(shown) : Math.round(shown).toLocaleString("en-IN")}</strong>
      <span className={`sx-k-sub ${tone || ""}`}>{sub}</span>
      <Spark vals={spark} />
    </div>
  );
};

const Ring = ({ segs, size = 128, children }) => {
  const total = segs.reduce((s, x) => s + x.v, 0);
  let off = 0;
  return (
    <div className="sx-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.9" className="sx-ring-bg" />
        {total > 0 && segs.map((s, i) => {
          const len = Math.max((s.v / total) * 100 - 1.5, 0);
          const el = <circle key={i} cx="21" cy="21" r="15.9" pathLength="100" stroke={s.c} strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-off} />;
          off += (s.v / total) * 100;
          return el;
        })}
      </svg>
      <div className="sx-ring-c">{children}</div>
    </div>
  );
};

const ACTIONS = [
  { icon: "inventory", label: "Add Item", to: "/inventory" },
  { icon: "orders", label: "Create PO", to: "/orders" },
  { icon: "production", label: "New Production", to: "/production" },
  { icon: "customer", label: "Customer Order", to: "/customer-orders" },
  { icon: "reports", label: "Generate Report", to: "/reports" },
  { icon: "alerts", label: "Alert Center", to: "/alerts" },
];
const PALETTE = ["#22d3ee", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];
const MOVE = { IN: "good", OUT: "bad", ADJUST: "warn" };
const PSTAT = { Planned: "warn", "In Progress": "info", Completed: "good" };
const sdate = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const CHIPS = ["Which materials are low?", "How many can we build?", "What's at risk?", "Which supplier is risky?", "What's the bottleneck?"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { products = [], movements = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const { boms = [] } = useContext(BomContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  const stockValue = useMemo(() => products.reduce((s, p) => s + p.quantity * p.price, 0), [products]);
  const lowStock = useMemo(() => getLowStockProducts(products), [products]);
  const outCount = lowStock.filter((p) => getStockStatus(p) === "Out of Stock").length;
  const lowCount = lowStock.length - outCount;
  const inCount = Math.max(products.length - lowStock.length, 0);
  const overdue = useMemo(() => getOverduePurchaseOrders(orders), [orders]);
  const blocked = useMemo(() => getBlockedProductionOrders(productions, boms, products), [productions, boms, products]);
  const atRisk = useMemo(() => getAtRiskCustomerOrders(customerOrders, products), [customerOrders, products]);
  const openPOs = orders.filter((o) => getOrderStatus(o) !== "Received").length;
  const pendingCOs = customerOrders.filter((o) => o.status === "Pending").length;

  const prod = useMemo(() => {
    let target = 0, done = 0;
    productions.forEach((p) => {
      const q = Number(p.targetQty) || 0;
      target += q;
      if (p.status === "Completed") done += q;
    });
    return { target, done, pct: target ? Math.round((done / target) * 100) : 0 };
  }, [productions]);
  const onTime = orders.length ? Math.round((1 - overdue.length / orders.length) * 100) : 100;

  // pichhle 7 din ki inventory value: aaj ki value se movements ulta ghuma kar
  const trend = useMemo(() => {
    const price = Object.fromEntries(products.map((p) => [p.id, p.price || 0]));
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      return { d, key: d.toDateString(), delta: 0 };
    });
    movements.forEach((m) => {
      const slot = days.find((x) => x.key === new Date(m.date).toDateString());
      if (slot) slot.delta += (Number(m.change) || 0) * (price[m.productId] || 0);
    });
    let v = stockValue;
    const vals = Array(7);
    for (let i = 6; i >= 0; i--) { vals[i] = Math.max(v, 0); v -= days[i].delta; }
    return days.map((x, i) => ({ label: x.d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: vals[i] }));
  }, [movements, products, stockValue]);
  const tVals = trend.map((t) => t.value);
  const tDelta = tVals[0] > 0 ? ((tVals[6] - tVals[0]) / tVals[0]) * 100 : 0;

  const zones = useMemo(() => {
    const g = {};
    products.forEach((p) => {
      const c = p.category || "Other";
      g[c] = g[c] || { name: c, t: 0, ok: 0 };
      g[c].t++;
      if (getStockStatus(p) === "In Stock") g[c].ok++;
    });
    return Object.values(g).sort((a, b) => b.t - a.t).slice(0, 4).map((z) => {
      const pct = Math.round((z.ok / z.t) * 100);
      return { ...z, pct, tone: pct >= 70 ? "good" : pct > 0 ? "warn" : "bad", label: pct >= 70 ? "Healthy" : pct > 0 ? "Low Stock" : "Out of Stock" };
    });
  }, [products]);

  const critical = outCount + blocked.length + atRisk.length;
  const warning = lowCount + overdue.length;
  const counts = { Planned: 0, "In Progress": 0, Completed: 0 };
  productions.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
  const capacity = useMemo(() => boms.map((b) => ({ bom: b, calc: calculateMaxProducible(b, products) })), [boms, products]);
  const recent = useMemo(() => [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [movements]);
  const catSegs = useMemo(() => {
    const g = {};
    products.forEach((p) => { g[p.category] = (g[p.category] || 0) + p.quantity * p.price; });
    return Object.entries(g).map(([label, v], i) => ({ label, v, c: PALETTE[i % PALETTE.length] }));
  }, [products]);
  const riskSegs = [
    { label: "Material shortages", v: lowStock.length, c: "#f59e0b" },
    { label: "Overdue POs", v: overdue.length, c: "#3b82f6" },
    { label: "Blocked production", v: blocked.length, c: "#f43f5e" },
    { label: "Orders at risk", v: atRisk.length, c: "#a78bfa" },
  ];
  const demandSupply = useMemo(() => products.filter((p) => p.category === "Finished Goods").map((p) => {
    const demand = customerOrders.filter((o) => o.productId === p.id && o.status === "Pending").reduce((a, o) => a + (Number(o.quantity) || 0), 0);
    const planned = productions.filter((pr) => pr.status !== "Completed" && boms.some((b) => b.id === pr.bomId && b.finishedProductId === p.id)).reduce((a, pr) => a + (Number(pr.targetQty) || 0), 0);
    return { id: p.id, name: p.name, demand, stock: p.quantity, planned, max: Math.max(demand, p.quantity, planned, 1) };
  }), [products, customerOrders, productions, boms]);
  const supplierRows = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const k = o.supplierName || "Unknown";
      map[k] = map[k] || { name: k, open: 0, overdue: 0, qty: 0, received: 0 };
      map[k].qty += Number(o.quantity) || 0;
      map[k].received += Number(o.receivedQty) || 0;
      if (getOrderStatus(o) !== "Received") map[k].open++;
    });
    overdue.forEach((o) => { const k = o.supplierName || "Unknown"; if (map[k]) map[k].overdue++; });
    return Object.values(map).slice(0, 5);
  }, [orders, overdue]);

  const alerts = [
    ...products.filter((p) => getStockStatus(p) === "Out of Stock").map((p) => ({ k: `o${p.id}`, t: `${p.name} out of stock`, m: "Inventory", tone: "bad", i: "inventory" })),
    ...blocked.map((b) => ({ k: `b${b.order.id}`, t: `${b.order.id} production blocked`, m: `Limited by ${b.limitingComponent || "N/A"}`, tone: "bad", i: "production" })),
    ...atRisk.map((r) => ({ k: `r${r.order.id}`, t: `${r.order.id} order at risk`, m: r.order.customerName, tone: "bad", i: "customer" })),
    ...lowStock.filter((p) => getStockStatus(p) !== "Out of Stock").map((p) => ({ k: `l${p.id}`, t: `${p.name} is running low`, m: `${p.quantity} ${p.unit} left`, tone: "warn", i: "inventory" })),
    ...overdue.map((o) => ({ k: `d${o.id}`, t: `${o.id} delivery delayed`, m: o.supplierName, tone: "warn", i: "suppliers" })),
  ].slice(0, 5);

  return (
    <section className="sx">
      <Kpi c="#8b5cf6" icon="inventory" label="Inventory Value" value={stockValue} format={money}
        sub={`${tDelta >= 0 ? "▲" : "▼"} ${Math.abs(tDelta).toFixed(1)}% in 7 days`} tone={tDelta >= 0 ? "up" : "down"} spark={tVals} />
      <Kpi c="#ec4899" icon="alerts" label="Low Stock Items" value={lowStock.length}
        sub={`${outCount} out of stock`} tone={outCount ? "down" : "up"} spark={[4, 5, 4.5, 6, 5, 7, 6.5]} />
      <Kpi c="#3b82f6" icon="orders" label="Open POs" value={openPOs}
        sub={overdue.length ? `${overdue.length} delayed` : "all on schedule"} tone={overdue.length ? "down" : "up"} spark={[3, 4, 3.5, 5, 4.5, 6, 7]} />
      <Kpi c="#f59e0b" icon="customer" label="Pending Customer Orders" value={pendingCOs}
        sub={`${atRisk.length} at risk`} tone={atRisk.length ? "down" : "up"} spark={[2, 3, 2.5, 4, 3.5, 5, 4]} />
      <Kpi c="#10b981" icon="production" label="Production Output" value={prod.done}
        sub={`of ${prod.target} units · ${prod.pct}%`} tone="up" spark={[2, 3, 3.5, 3.2, 5, 5.5, 7]} />
      <Kpi c="#f43f5e" icon="alerts" label="Total Alerts" value={critical + warning}
        sub={`${critical} critical · ${warning} warning`} tone={critical ? "down" : "up"} spark={[5, 4, 6, 5, 7, 6, 8]} />

            <div className="sx-card sx-wh">
        <div className="sx-h"><span>Smart Warehouse Overview</span></div>
        <span className="sx-live"><i />Live</span>
        <Suspense fallback={<div className="sx-scene" />}>
          <Warehouse3D zones={zones} onZone={() => navigate("/inventory")} />
        </Suspense>
        <div className="sx-hint">Drag to rotate · Click a zone to open its stock</div>
      </div>

      <div className="sx-side">
        <div className="sx-card">
          <div className="sx-h"><span>Stock Status</span><Link to="/reports"><small>Full report</small></Link></div>
          <div className="sx-split">
            <Ring segs={[{ v: inCount, c: "#10b981" }, { v: lowCount, c: "#fb923c" }, { v: outCount, c: "#f43f5e" }]}>
              <strong>{products.length}</strong><small>Total Items</small>
            </Ring>
            <ul className="sx-legend">
              <li><i style={{ background: "#10b981" }} />In Stock<b>{inCount}</b></li>
              <li><i style={{ background: "#fb923c" }} />Low Stock<b>{lowCount}</b></li>
              <li><i style={{ background: "#f43f5e" }} />Out of Stock<b>{outCount}</b></li>
            </ul>
          </div>
        </div>
        <div className="sx-card">
          <div className="sx-h"><span>Quick Actions</span></div>
          <div className="sx-qa">
            {ACTIONS.map((a) => (
              <Link key={a.label} to={a.to}><span><Icon name={a.icon} size={20} /></span>{a.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="sx-card sx-r3">
        <div className="sx-h"><span>Inventory Value Trend</span><small>Last 7 days</small></div>
        <div className="sx-big">{money(stockValue)}</div>
        <svg className="sx-area" viewBox="0 0 400 130" preserveAspectRatio="none">
          <defs><linearGradient id="sxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".5" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
          <path d={`${curve(tVals, 400, 130)}L400 130L0 130Z`} fill="url(#sxg)" />
          <path d={curve(tVals, 400, 130)} className="sx-line" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="sx-xl">{trend.filter((_, i) => i % 2 === 0).map((t) => <span key={t.label}>{t.label}</span>)}</div>
      </div>

      <div className="sx-card sx-r3">
        <div className="sx-h"><span>Critical Alerts</span><Link to="/alerts"><small><b className="bad">{critical} critical</b> · <b className="warn">{warning} warning</b></small></Link></div>
        {alerts.length === 0 && <p className="sx-empty">No active alerts. All clear.</p>}
        {alerts.map((a) => (
          <div className="sx-al" key={a.k}>
            <span className={`sx-al-i ${a.tone}`}><Icon name={a.i} size={15} /></span>
            <div><b>{a.t}</b><small>{a.m}</small></div>
            <span className={`sx-pill ${a.tone}`}>{a.tone === "bad" ? "Critical" : "Warning"}</span>
          </div>
        ))}
      </div>

      <div className="sx-card sx-r3">
        <div className="sx-h"><span>Production Overview</span><Link to="/production"><small>View all</small></Link></div>
        <div className="sx-split">
          <div className="sx-stat">Planned<b>{prod.target} units</b>In progress<b>{counts["In Progress"]} orders</b>Efficiency<b className="up">{prod.pct}%</b></div>
          <Ring size={112} segs={[{ v: prod.pct, c: "#2dd4bf" }, { v: 100 - prod.pct, c: "rgba(255,255,255,.08)" }]}>
            <strong>{prod.pct}%</strong><small>Completed</small>
          </Ring>
          <div className="sx-stat">Completed<b>{prod.done} units</b>On-time delivery<b className="up">{onTime}%</b></div>
        </div>
      </div>

      <div className="sx-card sx-c4">
        <div className="sx-h"><span>Inventory by Category</span><Link to="/inventory"><small>View all</small></Link></div>
        <div className="sx-split">
          <Ring size={110} segs={catSegs}><strong>{money(stockValue)}</strong><small>Total Stock</small></Ring>
          <ul className="sx-legend">{catSegs.map((c) => <li key={c.label}><i style={{ background: c.c }} />{c.label}<b>{stockValue ? Math.round((c.v / stockValue) * 100) : 0}%</b></li>)}</ul>
        </div>
      </div>

      <div className="sx-card sx-c4">
        <div className="sx-h"><span>Operational Risk</span><Link to="/alerts"><small>Details</small></Link></div>
        <div className="sx-split">
          <Ring size={110} segs={riskSegs}><strong>{critical + warning}</strong><small>{critical >= 3 ? "High" : critical + warning > 0 ? "Medium" : "Low"} risk</small></Ring>
          <ul className="sx-legend">{riskSegs.map((c) => <li key={c.label}><i style={{ background: c.c }} />{c.label}<b>{c.v}</b></li>)}</ul>
        </div>
      </div>

      <div className="sx-card sx-c4">
        <div className="sx-h"><span>Producible Right Now</span><Link to="/bom"><small>View BOMs</small></Link></div>
        {capacity.length === 0 && <p className="sx-empty">No BOMs defined yet.</p>}
        {capacity.map(({ bom, calc }) => (
          <div className="sx-al" key={bom.id}>
            <div><b>{bom.finishedProductName}</b><small>Limited by {calc.limitingComponent || "N/A"}</small></div>
            <span className="sx-num">{calc.maxUnits}<small>units</small></span>
          </div>
        ))}
      </div>

      <div className="sx-card sx-c6"><TrendChart movements={movements} /></div>

      <div className="sx-card sx-c6">
        <div className="sx-h"><span>Recent Transactions</span><Link to="/movements"><small>View all</small></Link></div>
        <table className="sx-table"><thead><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>Balance</th></tr></thead>
          <tbody>
            {recent.length === 0 && <tr><td colSpan="5">No movements recorded yet.</td></tr>}
            {recent.map((m, i) => (
              <tr key={`${m.id}-${i}`}><td>{sdate(m.date)}</td><td><span className={`sx-pill ${MOVE[m.type] || "info"}`}>{m.type}</span></td><td>{m.productName}</td>
                <td className={m.change >= 0 ? "up" : "bad"}>{m.change >= 0 ? `+${m.change}` : m.change}</td><td>{m.balanceAfter}</td></tr>
            ))}
          </tbody></table>
      </div>

      <div className="sx-card sx-c6">
        <div className="sx-h"><span>Live Production Status</span><Link to="/production"><small>{counts.Planned} planned · {counts["In Progress"]} in progress · {counts.Completed} done</small></Link></div>
        <table className="sx-table"><thead><tr><th>Order</th><th>Product</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>
            {productions.length === 0 && <tr><td colSpan="4">No production orders yet.</td></tr>}
            {productions.slice(0, 5).map((p) => (
              <tr key={p.id}><td>{p.id}</td><td>{p.finishedProductName}</td><td>{p.targetQty}</td><td><span className={`sx-pill ${PSTAT[p.status] || "info"}`}>{p.status}</span></td></tr>
            ))}
          </tbody></table>
      </div>

      <div className="sx-card sx-c6">
        <div className="sx-h"><span>Demand vs Supply</span><Link to="/customer-orders"><small>View all</small></Link></div>
        {demandSupply.length === 0 && <p className="sx-empty">No finished goods in inventory yet.</p>}
        {demandSupply.map((d) => (
          <div className="sx-ds" key={d.id}><b>{d.name}</b>
            {[["Pending demand", d.demand, "#f59e0b"], ["In stock", d.stock, "#22d3ee"], ["Planned build", d.planned, "#10b981"]].map(([l, v, c]) => (
              <div className="sx-ds-l" key={l}><span>{l}</span><div><i style={{ width: `${Math.round((v / d.max) * 100)}%`, background: c }} /></div><em>{v}</em></div>
            ))}
          </div>
        ))}
      </div>

      <div className="sx-card sx-c12">
        <div className="sx-h"><span>Supplier Orders</span><Link to="/suppliers"><small>View all</small></Link></div>
        <table className="sx-table"><thead><tr><th>Supplier</th><th>Open POs</th><th>Overdue</th><th>Received</th><th>Status</th></tr></thead>
          <tbody>
            {supplierRows.length === 0 && <tr><td colSpan="5">No purchase orders yet.</td></tr>}
            {supplierRows.map((r) => (
              <tr key={r.name}><td>{r.name}</td><td>{r.open}</td><td className={r.overdue ? "bad" : ""}>{r.overdue}</td><td>{r.qty ? Math.round((r.received / r.qty) * 100) : 0}%</td>
                <td><span className={`sx-pill ${r.overdue ? "bad" : r.open ? "info" : "good"}`}>{r.overdue ? "Delayed" : r.open ? "On track" : "Done"}</span></td></tr>
            ))}
          </tbody></table>
      </div>

      <div className="sx-card sx-ai">
        <span className="sx-bot" />
        <div className="sx-ai-t"><b>Hi! I'm your AI Assistant</b><small>Ask about stock, orders or production.</small></div>
        <div className="sx-chips">
          {CHIPS.map((q) => <Link key={q} to="/assistant" state={{ q }}>{q}</Link>)}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;