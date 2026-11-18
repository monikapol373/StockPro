import React, { createContext, useState } from 'react'

const USERS_KEY = "stockpro:users";
const SESSION_KEY = "stockpro:session";

const readUsers = () => {
  try {
    const v = JSON.parse(localStorage.getItem(USERS_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession());

  const register = ({ name, email, password }) => {
    const users = readUsers();
    const mail = email.trim().toLowerCase();
    if (users.some((u) => u.email === mail)) {
      return { ok: false, error: "This email is already registered. Please login." };
    }
    const newUser = { name: name.trim(), email: mail, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const users = readUsers();
    const mail = email.trim().toLowerCase();

    if (users.length === 0) {
      return { ok: false, error: "No account found. Please register first." };
    }
    const account = users.find((u) => u.email === mail);
    if (!account) {
      return { ok: false, error: "No account found with this email. Please register first." };
    }
    if (account.password !== password) {
      return { ok: false, error: "Wrong password. Please try again." };
    }

    const session = { name: account.name, email: account.email };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;