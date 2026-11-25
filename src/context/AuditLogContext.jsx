import React, { createContext, useContext } from "react";
import usePersistentState from "../hooks/usePersistentState";
import AuthContext from "./AuthContext";

const AuditLogContext = createContext();

export const AuditLogProvider = ({ children }) => {
  const [logs, setLogs] = usePersistentState("stockpro:auditlog", []);
  const { user } = useContext(AuthContext);

  const addLog = ({ action, module, details }) => {
    const entry = {
      id: `LOG-${Date.now()}`,
      action,
      module,
      details,
      user: user?.name || "Unknown",
      email: user?.email || "",
      role: user?.role || "staff",
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [entry, ...(prev || []).slice(0, 199)]);
  };

  return (
    <AuditLogContext.Provider value={{ logs: logs || [], addLog }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = () => useContext(AuditLogContext);

export default AuditLogContext;