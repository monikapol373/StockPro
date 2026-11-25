import React, { useContext, useState } from "react";
import { useAuditLog } from "../context/AuditLogContext";
import AuthContext from "../context/AuthContext";

const MODULE_COLORS = {
  Inventory: "#6366f1",
  Orders: "#3b82f6",
  Production: "#10b981",
  Suppliers: "#f59e0b",
  "Customer Orders": "#ec4899",
  BOM: "#8b5cf6",
  Settings: "#64748b",
  Auth: "#ef4444",
};

const ACTION_COLORS = {
  CREATE: "#10b981",
  UPDATE: "#f59e0b",
  DELETE: "#ef4444",
  LOGIN: "#3b82f6",
  LOGOUT: "#64748b",
  IMPORT: "#8b5cf6",
  EXPORT: "#06b6d4",
};

const AuditLog = () => {
  const { logs } = useAuditLog();
  const { isAdmin, isManager } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  if (!isAdmin && !isManager) {
    return (
      <div className="al-wrap">
        <div className="al-denied">
          <h2>Access Denied</h2>
          <p>Only Admins and Managers can view the audit log.</p>
        </div>
      </div>
    );
  }

  const modules = ["All", ...new Set(logs.map((l) => l.module))];
  const actions = ["All", ...new Set(logs.map((l) => l.action))];

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.user?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.module?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q);
    const matchModule = moduleFilter === "All" || l.module === moduleFilter;
    const matchAction = actionFilter === "All" || l.action === actionFilter;
    return matchSearch && matchModule && matchAction;
  });

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  return (
    <div className="al-wrap">
      <div className="al-header">
        <div>
          <h1>Audit Log</h1>
          <p>Track every action performed in StockPro.</p>
        </div>
        <div className="al-stats">
          <div className="al-stat"><strong>{logs.length}</strong><span>Total Events</span></div>
          <div className="al-stat"><strong>{new Set(logs.map(l => l.email)).size}</strong><span>Users</span></div>
          <div className="al-stat"><strong>{logs.filter(l => l.action === "DELETE").length}</strong><span>Deletions</span></div>
        </div>
      </div>

      <div className="al-filters">
        <div className="al-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>
          </svg>
          <input
            type="text"
            placeholder="Search by user, action, module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="al-select">
          {modules.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="al-select">
          {actions.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="al-empty">
          {logs.length === 0 ? "No activity recorded yet. Actions will appear here as users work." : "No results match your search."}
        </div>
      )}

      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Module</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="al-time">{formatDate(log.timestamp)}</td>
                <td>
                  <div className="al-user">
                    <span className="al-avatar">{log.user?.[0]?.toUpperCase() || "?"}</span>
                    <div>
                      <b>{log.user}</b>
                      <small>{log.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="al-role" style={{
                    background: log.role === "admin" ? "#ef444422" : log.role === "manager" ? "#f59e0b22" : "#10b98122",
                    color: log.role === "admin" ? "#ef4444" : log.role === "manager" ? "#f59e0b" : "#10b981",
                  }}>
                    {log.role}
                  </span>
                </td>
                <td>
                  <span className="al-module" style={{
                    background: `${MODULE_COLORS[log.module] || "#6366f1"}22`,
                    color: MODULE_COLORS[log.module] || "#6366f1",
                  }}>
                    {log.module}
                  </span>
                </td>
                <td>
                  <span className="al-action" style={{
                    background: `${ACTION_COLORS[log.action] || "#6366f1"}22`,
                    color: ACTION_COLORS[log.action] || "#6366f1",
                  }}>
                    {log.action}
                  </span>
                </td>
                <td className="al-details">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;