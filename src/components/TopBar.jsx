import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import useAlertCount from "../hooks/useAlertCount";
import AuthContext from "../context/AuthContext";
import InventoryContext from "../context/InventoryContext";
import SuppliersContext from "../context/SuppliersContext";
import OrdersContext from "../context/OrdersContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";

const PAGES = [
  { label: "Dashboard", to: "/" },
  { label: "Inventory", to: "/inventory" },
  { label: "Suppliers", to: "/suppliers" },
  { label: "Purchase Orders", to: "/orders" },
  { label: "Stock Movements", to: "/movements" },
  { label: "Bill of Materials", to: "/bom" },
  { label: "Production", to: "/production" },
  { label: "Customer Orders", to: "/customer-orders" },
  { label: "Reports", to: "/reports" },
  { label: "Alert Center", to: "/alerts" },
  { label: "Assistant", to: "/assistant" },
  { label: "Bottleneck", to: "/bottleneck" },
  { label: "Reality Check", to: "/reality-check" },
  { label: "Settings", to: "/settings" },
];

const TopBar = ({ onMenu }) => {
  const navigate = useNavigate();
  const alertCount = useAlertCount();
  const { user } = useContext(AuthContext);
  const { products = [] } = useContext(InventoryContext);
  const { suppliers = [] } = useContext(SuppliersContext);
  const { orders = [] } = useContext(OrdersContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => t === "dark" ? "light" : "dark");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out = [];
    const has = (...vals) => vals.some((v) => String(v ?? "").toLowerCase().includes(term));

    PAGES.forEach((p) => {
      if (has(p.label)) out.push({ key: `p-${p.to}`, type: "Page", label: p.label, to: p.to });
    });
    products.forEach((p) => {
      if (has(p.name, p.id)) out.push({ key: `i-${p.id}`, type: "Product", label: `${p.name} (${p.id})`, to: "/inventory" });
    });
    suppliers.forEach((s) => {
      if (has(s.name, s.id)) out.push({ key: `s-${s.id}`, type: "Supplier", label: s.name, to: "/suppliers" });
    });
    orders.forEach((o) => {
      if (has(o.id, o.productName, o.supplierName)) out.push({ key: `o-${o.id}`, type: "Purchase Order", label: `${o.id} · ${o.productName}`, to: "/orders" });
    });
    customerOrders.forEach((o) => {
      if (has(o.id, o.customerName, o.productName)) out.push({ key: `c-${o.id}`, type: "Customer Order", label: `${o.id} · ${o.customerName}`, to: "/customer-orders" });
    });
    return out.slice(0, 8);
  }, [q, products, suppliers, orders, customerOrders]);

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && !["input", "textarea", "select"].includes(tag)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[cursor] || results[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="tb">
      <button type="button" className="tb-menu" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" size={22} />
      </button>

      <div className="tb-search" ref={boxRef}>
        <Icon name="search" size={16} className="tb-search-icon" />
        <input
          ref={inputRef}
          value={q}
          placeholder="Search pages, products, orders...   ( / )"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setCursor(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Global search"
        />
        {open && q.trim() && (
          <div className="tb-results" role="listbox">
            {results.length === 0 && <div className="tb-empty">No matches for "{q.trim()}"</div>}
            {results.map((r, i) => (
              <button
                type="button"
                key={r.key}
                role="option"
                aria-selected={i === cursor}
                className={`tb-result ${i === cursor ? "active" : ""}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r)}
              >
                <span>{r.label}</span>
                <small>{r.type}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tb-greet">
        <h2>{greeting}, {(user?.name || "there").split(" ")[0]}! 👋</h2>
        <p>Here's what's happening with your business today.</p>
      </div>

      <div className="tb-right">
        <span className="tb-date">
          <Icon name="calendar" size={15} /> {today}
        </span>

        {/* Dark/Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: "none",
            border: "1px solid var(--border, #334155)",
            borderRadius: 20,
            padding: "0.3rem 0.75rem",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text, #fff)",
            transition: "all 0.2s",
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link to="/alerts" className="tb-bell" aria-label={`${alertCount} active alerts`} title="Alert Center">
          <Icon name="bell" size={19} />
          {alertCount > 0 && <span className="tb-bell-count">{alertCount > 99 ? "99+" : alertCount}</span>}
        </Link>
        <div className="tb-avatar">
          {(user?.name || "U").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
        </div>
        <div className="tb-user">
          <strong>{user?.name || "User"}</strong>
          <small>{user?.role || "Admin"}</small>
        </div>
      </div>
    </header>
  );
};

export default TopBar;