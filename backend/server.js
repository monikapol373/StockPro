import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createStore } from "./store.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ---------- tiny .env loader (no dependency) ---------- */
function loadEnv(file = path.join(HERE, ".env")) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}

/* ---------- rules ---------- */
const KEY_RE = /^[A-Za-z0-9:_.-]{1,100}$/;
// Login data must never be stored on the server in this phase (passwords are plain text in the browser).
const BLOCKED_KEYS = new Set(["stockpro:users", "stockpro:session"]);
const MAX_BODY = 5 * 1024 * 1024; // 5 MB

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, "Payload too large (max 5 MB)."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function makeCors(allowedList) {
  const list = (allowedList || "").split(",").map((s) => s.trim()).filter(Boolean);
  const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  return (origin) => {
    if (!origin) return null;
    if (list.includes("*")) return "*";
    if (list.length === 0) return localhost.test(origin) ? origin : null;
    return list.includes(origin) ? origin : null;
  };
}

/* ---------- app ---------- */
export function buildServer(store, { corsOrigin = "" } = {}) {
  const allow = makeCors(corsOrigin);

  const send = (res, status, body) => {
    const text = body === undefined ? "" : JSON.stringify(body);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(text),
    });
    res.end(text);
  };

  const parseKey = (raw) => {
    let key;
    try {
      key = decodeURIComponent(raw);
    } catch {
      throw new HttpError(400, "Invalid key encoding.");
    }
    if (!KEY_RE.test(key)) throw new HttpError(400, "Invalid key. Use letters, numbers and : _ . - (max 100 chars).");
    if (BLOCKED_KEYS.has(key)) throw new HttpError(403, "This key is never stored on the server.");
    return key;
  };

  return http.createServer(async (req, res) => {
    const started = Date.now();
    const origin = req.headers.origin;
    const allowed = allow(origin);

    if (allowed) {
      res.setHeader("Access-Control-Allow-Origin", allowed);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Max-Age", "600");
    }

    res.on("finish", () => {
      console.log(`${new Date().toISOString()}  ${req.method} ${req.url}  ${res.statusCode}  ${Date.now() - started}ms`);
    });

    try {
      if (req.method === "OPTIONS") {
        res.writeHead(allowed ? 204 : 403);
        return res.end();
      }

      const url = new URL(req.url, "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean); // ["data", ":key"]

      if (req.method === "GET" && parts.length === 1 && parts[0] === "health") {
        return send(res, 200, { ok: true, store: store.kind, keys: store.list().length });
      }

      if (parts[0] !== "data" || parts.length > 2) {
        throw new HttpError(404, "Not found.");
      }

      // collection: /data
      if (parts.length === 1) {
        if (req.method === "GET") return send(res, 200, { keys: store.list() });
        if (req.method === "DELETE") return send(res, 200, { ok: true, removed: store.clear() });
        throw new HttpError(405, "Method not allowed.");
      }

      // item: /data/:key
      const key = parseKey(parts[1]);

      if (req.method === "GET") {
        const row = store.get(key);
        if (!row) throw new HttpError(404, "Key not found.");
        return send(res, 200, { value: JSON.parse(row.value), updatedAt: row.updatedAt });
      }

      if (req.method === "PUT") {
        const raw = await readBody(req);
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          throw new HttpError(400, "Body must be valid JSON.");
        }
        if (!body || typeof body !== "object" || body.value === undefined) {
          throw new HttpError(400, 'Body must look like { "value": ... }.');
        }
        store.put(key, JSON.stringify(body.value));
        return send(res, 200, { ok: true });
      }

      if (req.method === "DELETE") {
        return send(res, 200, { ok: true, removed: store.delete(key) ? 1 : 0 });
      }

      throw new HttpError(405, "Method not allowed.");
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error("Unexpected error:", err);
      return send(res, 500, { error: "Internal server error." });
    }
  });
}

/* ---------- start (only when run directly) ---------- */
const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  loadEnv();
  const PORT = Number(process.env.PORT) || 5000;
  const DATA_DIR = path.resolve(HERE, process.env.DATA_DIR || "./data");
  const store = await createStore(DATA_DIR, (process.env.STORE || "sqlite").toLowerCase());
  const server = buildServer(store, { corsOrigin: process.env.CORS_ORIGIN || "" });

  server.listen(PORT, () => {
    console.log(`StockPro server running on http://localhost:${PORT}`);
    console.log(`Database: ${store.kind}  (${store.location})`);
  });

  const stop = () => {
    console.log("\nShutting down...");
    server.close(() => {
      store.close();
      process.exit(0);
    });
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}