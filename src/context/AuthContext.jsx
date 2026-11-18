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
        const session = { name: data.name, email: data.email };
        sessionStorage.setItem(SESSION_USER, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    // fallback: browser only
    const USERS_KEY = "stockpro:users";
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
      const mail = email.trim().toLowerCase();
      if (users.some((u) => u.email === mail))
        return { ok: false, error: "This email is already registered." };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, { name: name.trim(), email: mail, password }]));
      return { ok: true };
    } catch {
      return { ok: false, error: "Registration failed." };
    }
  };

  const login = async ({ email, password }) => {
    if (apiEnabled) {
      try {
        const data = await apiLogin({ email, password });
        sessionStorage.setItem(SESSION_KEY, data.token);
        const session = { name: data.name, email: data.email };
        sessionStorage.setItem(SESSION_USER, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    // fallback: browser only
    const USERS_KEY = "stockpro:users";
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
      const mail = email.trim().toLowerCase();
      if (users.length === 0) return { ok: false, error: "No account found. Please register first." };
      const account = users.find((u) => u.email === mail);
      if (!account) return { ok: false, error: "No account found with this email." };
      if (account.password !== password) return { ok: false, error: "Wrong password." };
      const session = { name: account.name, email: account.email };
      sessionStorage.setItem(SESSION_USER, JSON.stringify(session));
      setUser(session);
      return { ok: true };
    } catch {
      return { ok: false, error: "Login failed." };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;