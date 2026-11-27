import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import useAlertCount from "../hooks/useAlertCount";
import AuthContext from "../context/AuthContext";
import InventoryContext from "../context/InventoryContext";
import SuppliersContext from "../context/SuppliersContext";
import OrdersContext from "../context/OrdersContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import BomContext from "../context/BomContext";
import ProductionContext from "../context/ProductionContext";
import {
  getLowStockProducts,
  getOverduePurchaseOrders,
  getBlockedProductionOrders,
  getAtRiskCustomerOrders,
} from "../utils/intelligence";

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
  const { boms = [] } = useContext(BomContext);
  const { productions = [] } = useContext(ProductionContext);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notif_read") || "[]"); } catch { return []; }
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const notifRef = useRef(null);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => t === "dark" ? "light" : "dark");

  // Build notifications from real data
  const notifications = useMemo(() => {
    const list = [];
    try {
      getLowStockProducts(products).forEach((p) => {
        list.push({
          id: `low-${p.id}`,
          type: "warning",
          icon: "⚠️",
          title: "Low Stock Alert",
          message: `${p.name} has only ${p.quantity} ${p.unit || "units"} left`,
          link: "/inventory",
          color: "#f59e0b",
        });
      });
      getOverduePurchaseOrders(orders).forEach((o) => {
        list.push({
          id: `po-${o.id}`,
          type: "error",
          icon: "🕒",
          title: "Overdue Purchase Order",
          message: `${o.id} from ${o.supplierName} is overdue`,
          link: "/orders",
          color: "#ef4444",
        });
      });
      getBlockedProductionOrders(productions, boms, products).forEach((p) => {
        list.push({
          id: `prod-${p.id}`,
          type: "error",
          icon: "🚫",
          title: "Blocked Production",
          message: `${p.productName} production is blocked — materials short`,
          link: "/production",
          color: "#ef4444",
        });
      });
      getAtRiskCustomerOrders(customerOrders, products).forEach((o) => {
        list.push({
          id: `co-${o.id}`,
          type: "warning",
          icon: "📦",
          title: "At-Risk Customer Order",
          message: `${o.id} for ${o.customerName} — stock insufficient`,
          link: "/customer-orders",
          color: "#f59e0b",
        });
      });
    } catch {}
    return list;
  }, [products, orders, productions, boms, customerOrders]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const ids = notifications.map((n) => n.id);
    setReadIds(ids);
    localStorage.setItem("notif_read", JSON.stringify(ids));
  };

  const markRead = (id) => {
    const ids = [...new Set([...readIds, id])];
    setReadIds(ids);
    localStorage.setItem("notif_read", JSON.stringify(ids));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // "/" shortcut
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

  // Search results
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

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[cursor] || results[0]); }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <header className="tb">
      <button type="button" className="tb-menu" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" size={22} />
      </button>

      {/* Search */}
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

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: "none",
            border: "1px solid var(--line, #334155)",
            borderRadius: 20,
            padding: "0.3rem 0.75rem",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--ink, #fff)",
            transition: "all 0.2s",
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            type="button"
            className="tb-bell"
            aria-label={`${unreadCount} notifications`}
            onClick={() => setNotifOpen((o) => !o)}
            style={{ position: "relative" }}
          >
            <Icon name="bell" size={19} />
            {unreadCount > 0 && (
              <span className="tb-bell-count" style={{
                position: "absolute", top: -4, right: -4,
                background: "#ef4444",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                borderRadius: "99px",
                padding: "1px 5px",
                minWidth: 16,
                textAlign: "center",
              }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 360,
              maxHeight: 480,
              overflowY: "auto",
              background: "var(--panel, #0a1b31)",
              border: "1px solid var(--line, #334155)",
              borderRadius: 16,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              zIndex: 1000,
            }}>
              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem 1.25rem 0.75rem",
                borderBottom: "1px solid var(--line, #334155)",
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)" }}>Notifications</h3>
                  <small style={{ color: "var(--mute)" }}>{unreadCount} unread</small>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      style={{
                        background: "none", border: "none",
                        color: "#6366f1", fontSize: "0.75rem",
                        cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    to="/alerts"
                    style={{ color: "#6366f1", fontSize: "0.75rem", fontWeight: 600 }}
                    onClick={() => setNotifOpen(false)}
                  >
                    View all →
                  </Link>
                </div>
              </div>

              {/* Notification List */}
              {notifications.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--mute)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>All caught up! No active alerts.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => { markRead(n.id); navigate(n.link); setNotifOpen(false); }}
                      style={{
                        display: "flex", gap: "0.75rem", alignItems: "flex-start",
                        padding: "0.85rem 1.25rem",
                        borderBottom: "1px solid var(--line-soft, #10263f)",
                        cursor: "pointer",
                        background: isRead ? "transparent" : "rgba(99,102,241,0.04)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = isRead ? "transparent" : "rgba(99,102,241,0.04)"}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `${n.color}22`,
                        border: `1px solid ${n.color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem",
                      }}>
                        {n.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{n.title}</strong>
                          {!isRead && (
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: "#6366f1", flexShrink: 0,
                            }} />
                          )}
                        </div>
                        <p style={{
                          margin: "0.2rem 0 0", fontSize: "0.78rem",
                          color: "var(--mute)", lineHeight: 1.4,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
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