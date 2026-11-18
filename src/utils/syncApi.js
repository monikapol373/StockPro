const API = import.meta.env.VITE_API_URL;

export const apiEnabled = Boolean(API);

const getToken = () => {
  try {
    return sessionStorage.getItem("stockpro:token") || null;
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

export async function apiGet(key) {
  const res = await fetch(`${API}/data/${encodeURIComponent(key)}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) return { found: false, unauthorized: true };
  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error(`GET ${key} failed`);
  const body = await res.json();
  return { found: true, value: body.value };
}

export async function apiPut(key, value) {
  const res = await fetch(`${API}/data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`PUT ${key} failed`);
}

export async function apiClearAll() {
  if (!apiEnabled) return;
  try {
    await fetch(`${API}/data`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch {
    /* server unreachable */
  }
}

export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Registration failed.");
  return body; // { token, name, email }
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Login failed.");
  return body; // { token, name, email }
}