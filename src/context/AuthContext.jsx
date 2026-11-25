import React, { createContext, useState } from "react";
import { apiEnabled, apiLogin, apiRegister } from "../utils/syncApi";

const SESSION_KEY = "stockpro:token";
const SESSION_USER = "stockpro:session";

const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_USER));
  } catch {
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession());

  const register = async ({ name, email, password }) => {
    if (apiEnabled) {
      try {
        const data = await apiRegister({ name, email, password });
        sessionStorage.setItem(SESSION_KEY, data.token);
        const session = { name: data.name, email: data.email, role: data.role };
        sessionStorage.setItem(SESSION_USER, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    // fallback
    return { ok: false, error: "Server not available." };
  };

  const login = async ({ email, password }) => {
    if (apiEnabled) {
      try {
        const data = await apiLogin({ email, password });
        sessionStorage.setItem(SESSION_KEY, data.token);
        const session = { name: data.name, email: data.email, role: data.role };
        sessionStorage.setItem(SESSION_USER, JSON.stringify(session));
        setUser(session);
        addLog &&
          addLog({
            action: "LOGIN",
            module: "Auth",
            details: `${data.name} logged in`,
          });
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    return { ok: false, error: "Server not available." };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER);
    setUser(null);
  };

  // Role helpers
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" || user?.role === "admin";
  const isStaff = user?.role === "staff";

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAdmin, isManager, isStaff }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
