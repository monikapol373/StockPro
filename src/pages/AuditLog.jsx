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

const ACTION_ICONS = {
  CREATE: "✚",
  UPDATE: "✎",
  DELETE: "✕",
  LOGIN: "→",
  LOGOUT: "←",
  IMPORT: "↓",
  EXPORT: "↑",
  DISPATCH: "🚚",
};

const ACTION_COLORS = {
  CREATE: "#10b981",
  UPDATE: "#f59e0b",
  DELETE: "#ef4444",
  LOGIN: "#3b82f6",
  LOGOUT: "#64748b",
  IMPORT: "#8b5cf6",
  EXPORT: "#06b6d4",
  DISPATCH: "#ec4899",
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};

const formatDateGroup = (iso) => {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return ""; }
};

const AuditLog = () => {
  const { logs } = useAuditLog();
  const { isAdmin, isManager } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [view, setView] = useState("timeline"); // "timeline" | "table"

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

  // Group by date for timeline
  const grouped = filtered.reduce((acc, log) => {
    const group = formatDateGroup(log.timestamp);
    if (!acc[group]) acc[group] = [];
    acc[group].push(log);
    return acc;
  }, {});

  return (
    <div className="al-wrap">
      {/* Header */}
      <div className="al-header">
        <div>
          <h1>Activity Timeline</h1>
          <p>Track every action performed in StockPro.</p>
        </div>
        <div className="al-stats">
          <div className="al-stat"><strong>{logs.length}</strong><span>Total Events</span></div>
          <div className="al-stat"><strong>{new Set(logs.map(l => l.email)).size}</strong><span>Users</span></div>
          <div className="al-stat"><strong>{logs.filter(l => l.action === "DELETE").length}</strong><span>Deletions</span></div>
          <div className="al-stat"><strong>{logs.filter(l => l.action === "CREATE").length}</strong><span>Created</span></div>
        </div>
      </div>

      {/* Filters */}
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

        {/* View Toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
          <button
            type="button"
            onClick={() => setView("timeline")}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 8,
              border: `1px solid ${view === "timeline" ? "#6366f1" : "var(--line, #334155)"}`,
              background: view === "timeline" ? "rgba(99,102,241,0.15)" : "transparent",
              color: view === "timeline" ? "#6366f1" : "var(--mute)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            ⏱ Timeline
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 8,
              border: `1px solid ${view === "table" ? "#6366f1" : "var(--line, #334155)"}`,
              background: view === "table" ? "rgba(99,102,241,0.15)" : "transparent",
              color: view === "table" ? "#6366f1" : "var(--mute)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            ☰ Table
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="al-empty">
          {logs.length === 0
            ? "No activity recorded yet. Actions will appear here as users work."
            : "No results match your search."}
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && filtered.length > 0 && (
        <div style={{ padding: "0.5rem 0" }}>
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date} style={{ marginBottom: "2rem" }}>
              {/* Date Group Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem",
                marginBottom: "1.25rem",
              }}>
                <div style={{
                  padding: "0.3rem 1rem",
                  borderRadius: 20,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a5b4fc",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}>
                  {date}
                </div>
                <div style={{ flex: 1, height: 1, background: "var(--line, #334155)" }} />
                <span style={{ color: "var(--mute)", fontSize: "0.75rem" }}>
                  {entries.length} event{entries.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Timeline Entries */}
              <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
                {/* Vertical Line */}
                <div style={{
                  position: "absolute", left: "0.9rem", top: 0, bottom: 0,
                  width: 2,
                  background: "linear-gradient(180deg, rgba(99,102,241,0.5), transparent)",
                  borderRadius: 2,
                }} />

                {entries.map((log, i) => {
                  const actionColor = ACTION_COLORS[log.action] || "#6366f1";
                  const moduleColor = MODULE_COLORS[log.module] || "#6366f1";
                  const icon = ACTION_ICONS[log.action] || "•";

                  return (
                    <div key={log.id} style={{
                      position: "relative",
                      marginBottom: i === entries.length - 1 ? 0 : "1rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}>
                      {/* Icon Dot */}
                      <div style={{
                        position: "absolute",
                        left: "-1.6rem",
                        top: "0.75rem",
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `${actionColor}22`,
                        border: `2px solid ${actionColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: actionColor,
                        flexShrink: 0,
                        boxShadow: `0 0 10px ${actionColor}44`,
                      }}>
                        {icon}
                      </div>

                      {/* Card */}
                      <div style={{
                        flex: 1,
                        background: "linear-gradient(135deg, var(--panel, #0a1b31), var(--card, #081528))",
                        border: `1px solid var(--line, #334155)`,
                        borderLeft: `3px solid ${actionColor}`,
                        borderRadius: 12,
                        padding: "0.85rem 1rem",
                        transition: "border-color 0.2s",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            {/* User Avatar */}
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.7rem", fontWeight: 700, color: "#fff",
                              flexShrink: 0,
                            }}>
                              {log.user?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: "var(--ink, #e8f1fa)", fontSize: "0.875rem" }}>
                                {log.user}
                              </span>
                              <span style={{ color: "var(--mute)", fontSize: "0.75rem", marginLeft: "0.4rem" }}>
                                {log.email}
                              </span>
                            </div>

                            {/* Action Badge */}
                            <span style={{
                              padding: "0.15rem 0.6rem",
                              borderRadius: 6,
                              background: `${actionColor}22`,
                              border: `1px solid ${actionColor}44`,
                              color: actionColor,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                            }}>
                              {log.action}
                            </span>

                            {/* Module Badge */}
                            <span style={{
                              padding: "0.15rem 0.6rem",
                              borderRadius: 6,
                              background: `${moduleColor}22`,
                              border: `1px solid ${moduleColor}44`,
                              color: moduleColor,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}>
                              {log.module}
                            </span>

                            {/* Role Badge */}
                            <span style={{
                              padding: "0.15rem 0.6rem",
                              borderRadius: 6,
                              background: log.role === "admin" ? "#ef444422" : log.role === "manager" ? "#f59e0b22" : "#10b98122",
                              color: log.role === "admin" ? "#ef4444" : log.role === "manager" ? "#f59e0b" : "#10b981",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}>
                              {log.role}
                            </span>
                          </div>

                          {/* Timestamp */}
                          <span style={{ color: "var(--mute)", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                            {formatDate(log.timestamp)}
                          </span>
                        </div>

                        {/* Details */}
                        {log.details && (
                          <p style={{
                            margin: "0.5rem 0 0",
                            color: "var(--mute, #7f97b2)",
                            fontSize: "0.82rem",
                            lineHeight: 1.5,
                          }}>
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && filtered.length > 0 && (
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
      )}
    </div>
  );
};

export default AuditLog;