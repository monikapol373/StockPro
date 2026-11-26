import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { connectDB } from "./db.js";
import { KV } from "./models.js";
import { buildAuthRoutes, verifyToken, requireRole } from "./auth.js";
import { sendEmail, lowStockEmailHtml, delayedOrderEmailHtml } from "./email.js";
import Razorpay from "razorpay";

const HERE = path.dirname(fileURLToPath(import.meta.url));

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

const KEY_RE = /^[A-Za-z0-9:_.-]{1,100}$/;
const MAX_BODY = 5 * 1024 * 1024;

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

export function buildServer({ corsOrigin = "" } = {}) {
  const allow = makeCors(corsOrigin);

  const send = (res, status, body) => {
    const text = body === undefined ? "" : JSON.stringify(body);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(text),
    });
    res.end(text);
  };

  const { handleRegister, handleLogin, handleGetUsers, handleUpdateUser } =
    buildAuthRoutes(readBody, send, HttpError);

  const parseKey = (raw) => {
    let key;
    try { key = decodeURIComponent(raw); } catch {
      throw new HttpError(400, "Invalid key encoding.");
    }
    if (!KEY_RE.test(key))
      throw new HttpError(400, "Invalid key. Use letters, numbers and : _ . - (max 100 chars).");
    return key;
  };

  return http.createServer(async (req, res) => {
    const started = Date.now();
    const origin = req.headers.origin;
    const allowed = allow(origin);

    if (allowed) {
      res.setHeader("Access-Control-Allow-Origin", allowed);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS, POST, PATCH");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
      const parts = url.pathname.split("/").filter(Boolean);

      // health
      if (req.method === "GET" && parts[0] === "health") {
        const count = await KV.countDocuments();
        return send(res, 200, { ok: true, store: "mongodb", keys: count });
      }

      // auth routes
      if (parts[0] === "auth") {
        if (parts[1] === "register" && req.method === "POST")
          return await handleRegister(req, res);
        if (parts[1] === "login" && req.method === "POST")
          return await handleLogin(req, res);
        throw new HttpError(404, "Not found.");
      }

      // email alert routes — admin only
      if (parts[0] === "alerts" && parts[1] === "email") {
        let decoded;
        try { decoded = verifyToken(req); } catch {
          throw new HttpError(401, "Login required.");
        }
        if (decoded.role !== "admin") throw new HttpError(403, "Admin only.");

        const raw = await readBody(req);
        let body;
        try { body = JSON.parse(raw); } catch {
          throw new HttpError(400, "Body must be valid JSON.");
        }

        const { type, to, data } = body || {};
        if (!to || !type) throw new HttpError(400, "to and type are required.");

        let html, subject;
        if (type === "low-stock") {
          subject = `⚠️ Low Stock Alert — ${data?.length || 0} products need attention`;
          html = lowStockEmailHtml(data || []);
        } else if (type === "delayed-orders") {
          subject = `🕒 Delayed Orders Alert — ${data?.length || 0} orders overdue`;
          html = delayedOrderEmailHtml(data || []);
        } else {
          throw new HttpError(400, "Invalid type. Use low-stock or delayed-orders.");
        }

        const result = await sendEmail({ to, subject, html });
        return send(res, 200, result);
      }

      // Razorpay — create payment order
      if (parts[0] === "payment" && parts[1] === "create-qr" && req.method === "POST") {
        let decoded;
        try { decoded = verifyToken(req); } catch {
          throw new HttpError(401, "Login required.");
        }

        const raw = await readBody(req);
        let body;
        try { body = JSON.parse(raw); } catch {
          throw new HttpError(400, "Body must be valid JSON.");
        }

        const { amount, orderId, customerName } = body || {};
        if (!amount || !orderId) throw new HttpError(400, "amount and orderId required.");

        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const rzpOrder = await rzp.orders.create({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: orderId,
          notes: { customerName: customerName || "" },
        });

        return send(res, 200, {
          rzpOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        });
      }

      // admin: users management
      if (parts[0] === "admin" && parts[1] === "users") {
        let decoded;
        try { decoded = verifyToken(req); } catch {
          throw new HttpError(401, "Login required.");
        }
        try { requireRole("admin")(decoded); } catch {
          throw new HttpError(403, "Admin access required.");
        }
        if (req.method === "GET") return await handleGetUsers(req, res);
        if (req.method === "PATCH" && parts[2])
          return await handleUpdateUser(req, res, parts[2]);
        throw new HttpError(405, "Method not allowed.");
      }

      // data routes — token required
      if (parts[0] !== "data" || parts.length > 2)
        throw new HttpError(404, "Not found.");

      let decoded;
      try { decoded = verifyToken(req); } catch {
        throw new HttpError(401, "Login required.");
      }

      // Staff: fakt read access — write blocked
      const isReadOnly = decoded.role === "staff";

      if (parts.length === 1) {
        if (req.method === "GET") {
          const docs = await KV.find({}, { key: 1, updatedAt: 1 });
          return send(res, 200, { keys: docs.map(d => ({ key: d.key, updatedAt: d.updatedAt })) });
        }
        if (req.method === "DELETE") {
          if (isReadOnly) throw new HttpError(403, "Insufficient permissions.");
          const result = await KV.deleteMany({});
          return send(res, 200, { ok: true, removed: result.deletedCount });
        }
        throw new HttpError(405, "Method not allowed.");
      }

      const key = parseKey(parts[1]);

      if (req.method === "GET") {
        const doc = await KV.findOne({ key });
        if (!doc) throw new HttpError(404, "Key not found.");
        return send(res, 200, { value: doc.value, updatedAt: doc.updatedAt });
      }

      if (req.method === "PUT") {
        if (isReadOnly) throw new HttpError(403, "Insufficient permissions.");
        const raw = await readBody(req);
        let body;
        try { body = JSON.parse(raw); } catch {
          throw new HttpError(400, "Body must be valid JSON.");
        }
        if (!body || typeof body !== "object" || body.value === undefined)
          throw new HttpError(400, 'Body must look like { "value": ... }.');
        await KV.findOneAndUpdate(
          { key },
          { key, value: body.value, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        return send(res, 200, { ok: true });
      }

      if (req.method === "DELETE") {
        if (isReadOnly) throw new HttpError(403, "Insufficient permissions.");
        const result = await KV.deleteOne({ key });
        return send(res, 200, { ok: true, removed: result.deletedCount });
      }

      throw new HttpError(405, "Method not allowed.");
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error("Unexpected error:", err);
      return send(res, 500, { error: "Internal server error." });
    }
  });
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  loadEnv();
  await connectDB();
  const PORT = Number(process.env.PORT) || 5000;
  const server = buildServer({ corsOrigin: process.env.CORS_ORIGIN || "" });

  server.listen(PORT, () => {
    console.log(`StockPro server running on http://localhost:${PORT}`);
  });

  const stop = () => {
    console.log("\nShutting down...");
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}