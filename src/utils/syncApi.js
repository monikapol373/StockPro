const API = import.meta.env.VITE_API_URL;

export const apiEnabled = Boolean(API);

export async function apiGet(key) {
  const res = await fetch(`${API}/data/${encodeURIComponent(key)}`);
  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error(`GET ${key} failed`);
  const body = await res.json();
  return { found: true, value: body.value };
}

export async function apiPut(key, value) {
  const res = await fetch(`${API}/data/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`PUT ${key} failed`);
}

export async function apiClearAll() {
  if (!apiEnabled) return;
  try {
    await fetch(`${API}/data`, { method: "DELETE" });
  } catch {
    /* server unreachable: local reset still works */
  }
}