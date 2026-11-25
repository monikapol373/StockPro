import React, { useRef, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { getDefaultMinStock, setDefaultMinStock } from "../utils/stock";
import { apiEnabled, apiClearAll, apiPut } from "../utils/syncApi";
import { sendLowStockAlert, sendDelayedOrdersAlert } from "../utils/emailApi";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import InventoryContext from "../context/InventoryContext";
import OrdersContext from "../context/OrdersContext";
import { getStockStatus } from "../utils/stock";

const PREFIX = "stockpro:";

const getStoredKeys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));

const ICONS = {
  limit: <path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0" />,
  data: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  down: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  up: <path d="M12 15V3M7 8l5-5 5 5M4 21h16" />,
  reset: <path d="M3 12a9 9 0 109-9M3 4v5h5" />,
};

const Ic = ({ k }) => (
  <span className="st-ic">
    <svg className="st-svg" viewBox="0 0 24 24">{ICONS[k]}</svg>
  </span>
);

const Settings = () => {
  const fileRef = useRef(null);
  const [showReset, setShowReset] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [minStock, setMinStock] = useState(String(getDefaultMinStock()));
  const { isAdmin, user } = useContext(AuthContext);
  const { products = [] } = useContext(InventoryContext);
  const { orders = [] } = useContext(OrdersContext);
  const [alertEmail, setAlertEmail] = useState(user?.email || "");
  const [alertSending, setAlertSending] = useState("");
  const [alertResult, setAlertResult] = useState("");

  const lowStockProducts = products.filter((p) => {
    const min = Number(p.minStock ?? getDefaultMinStock());
    return Number(p.quantity) <= min;
  });

  const delayedOrders = orders.filter((o) => {
    if (o.status === "Received") return false;
    if (!o.expectedDate) return false;
    return new Date(o.expectedDate) < new Date();
  });

  const sendAlert = async (type) => {
    setAlertSending(type);
    setAlertResult("");
    try {
      let result;
      if (type === "low-stock") {
        result = await sendLowStockAlert({ to: alertEmail, products: lowStockProducts });
      } else {
        result = await sendDelayedOrdersAlert({ to: alertEmail, orders: delayedOrders });
      }
      setAlertResult(result.ok ? "✅ Email sent!" : `❌ ${result.reason}`);
    } catch (err) {
      setAlertResult(`❌ ${err.message}`);
    } finally {
      setAlertSending("");
    }
  };

  const keys = getStoredKeys();
  const sizeKB = (
    keys.reduce((sum, k) => sum + (localStorage.getItem(k) || "").length, 0) / 1024
  ).toFixed(1);

  const handleSaveMinStock = () => {
    const n = Number(minStock);
    if (minStock === "" || !Number.isInteger(n) || n < 0) {
      setMessage({ type: "error", text: "Low stock limit must be a whole number, 0 or more." });
      return;
    }
    setDefaultMinStock(n);
    setMessage({
      type: "ok",
      text: `Low stock limit saved: ${n}. Products with their own limit are not affected.`,
    });
  };

  const handleBackup = () => {
    const data = {};
    getStoredKeys().forEach((k) => {
      data[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ type: "ok", text: "Backup downloaded." });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const entries = Object.entries(data);
        if (
          entries.length === 0 ||
          entries.some(([k, v]) => !k.startsWith(PREFIX) || typeof v !== "string")
        ) {
          throw new Error("not a StockPro backup");
        }
        entries.forEach(([, v]) => JSON.parse(v));
        setPendingRestore(data);
      } catch {
        setMessage({ type: "error", text: "This file is not a valid StockPro backup." });
      }
    };
    reader.readAsText(file);
  };

  const confirmRestore = async () => {
    getStoredKeys().forEach((k) => localStorage.removeItem(k));
    Object.entries(pendingRestore).forEach(([k, v]) => localStorage.setItem(k, v));
    if (apiEnabled) {
      await apiClearAll();
      await Promise.all(
        Object.entries(pendingRestore).map(([k, v]) => apiPut(k, JSON.parse(v)).catch(() => {}))
      );
    }
    window.location.reload();
  };

  const confirmReset = async () => {
    getStoredKeys().forEach((k) => localStorage.removeItem(k));
    await apiClearAll();
    window.location.reload();
  };

  return (
    <section className="st pg">
      <header className="pg-head">
        <div>
          <h1>Settings</h1>
          <p>Stock rules, backup, restore and reset.</p>
        </div>
      </header>

      {message.text && (
        <div className={`st-msg ${message.type === "error" ? "bad" : "good"}`}>
          {message.text}
        </div>
      )}

      <div className="st-grid">
        <section className="st-card">
          <Ic k="limit" />
          <h3>Low stock limit</h3>
          <p>A product is marked "Low Stock" when its quantity is at or below this number.</p>
          <div className="st-inline">
            <input
              type="number"
              min="0"
              step="1"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
            <button type="button" className="pg-primary" onClick={handleSaveMinStock}>Save</button>
          </div>
          <small>
            This is the default for all products. You can set a different limit for a single
            product from Inventory (Add or Edit product).
          </small>
        </section>

        <section className="st-card">
          <Ic k="data" />
          <h3>Stored data</h3>
          <div className="st-big">
            <strong>{keys.length}</strong>
            <span>data sets · about {sizeKB} KB</span>
          </div>
          <span className={`pg-pill ${apiEnabled ? "good" : "warn"}`}>
            {apiEnabled ? "Synced with server" : "Browser only"}
          </span>
          <small>
            {apiEnabled
              ? "Data is also synced to your server database."
              : "Data lives only in this browser. Clearing browser data or switching device loses it, so take a backup regularly."}
          </small>
        </section>

        <section className="st-card">
          <Ic k="down" />
          <h3>Backup</h3>
          <p>Download everything (inventory, orders, BOM, production, movements) as one file.</p>
          <button type="button" className="pg-primary" onClick={handleBackup}>Download Backup</button>
        </section>

        <section className="st-card">
          <Ic k="up" />
          <h3>Restore</h3>
          <p>Load a backup file. This replaces all current data.</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <button type="button" className="pg-btn" onClick={() => fileRef.current.click()}>
            Choose Backup File
          </button>
        </section>

        <section className="st-card danger">
          <Ic k="reset" />
          <h3>Reset</h3>
          <p>Delete all your changes and go back to the original demo data.</p>
          <button type="button" className="st-danger" onClick={() => setShowReset(true)}>
            Reset Demo Data
          </button>
        </section>
      </div>

      {isAdmin && (
        <div className="st-card">
          <Ic k="limit"/>
          <div className="st-card-body">
            <h3>Email Alerts</h3>
            <p>Send low stock or delayed order alerts to your email.</p>
            <div style={{display:"flex", gap:"10px", marginTop:"12px", flexWrap:"wrap"}}>
              <input type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Send alert to email"
              style={{flex:1, padding:"10px 14px", borderRadius:"8px", border:"1px solid #334155", background:"#f1f5f9", fontSize:"14px"}} 
              />
            </div>
            <div style={{display:"flex", gap:"10px", marginTop:"10px", flexWrap:"wrap"}}>
              <button
              onClick={() => sendAlert("low-stock")}
              disabled={!!alertSending || lowStockProducts.length === 0}
              className="add-btn"
              style={{fontSize:"13px", padding:"8px 16px"}}>
                {alertSending === "low-stock" ? "Sending..." : `⚠️ Send Low Stock Alert (${lowStockProducts.length})`}
              </button>
              <button 
              onClick={() => sendAlert("delayed-orders")}
              disabled={!!alertSending || delayedOrders.length === 0}
              className="add-btn"
              style={{fontSize:"13px", padding:"8px 16px", background:"#f59e0b"}}>
                {alertSending === "delayed-orders" ? "Sending..." : `🕒 Send Delayed Orders Alert (${delayedOrders.length})`}
              </button>
            </div>
            {alertResult && <p style={{marginTop:"10px", fontSize:"13px"}}>
              {alertResult}</p>}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showReset}
        title="Reset all data?"
        message="Everything will be replaced with the original demo data. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={confirmReset}
        onCancel={() => setShowReset(false)}
      />

      <ConfirmDialog
        open={!!pendingRestore}
        title="Restore this backup?"
        message="All current data will be replaced with the contents of the backup file."
        confirmLabel="Restore"
        onConfirm={confirmRestore}
        onCancel={() => setPendingRestore(null)}
      />
    </section>
  );
};

export default Settings;