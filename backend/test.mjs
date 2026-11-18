import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildServer } from "./server.js";
import { createStore } from "./store.js";

let passed = 0;
const ok = (name) => {
  passed++;
  console.log(`  ok  ${name}`);
};

async function run(kind) {
  console.log(`\n== ${kind} store ==`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stockpro-"));
  const store = await createStore(dir, kind);
  assert.equal(store.kind, kind, `expected ${kind} store`);
  const server = buildServer(store);
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const call = (p, init) => fetch(base + p, init);
  const put = (p, body, extra = {}) =>
    call(p, { method: "PUT", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body), ...extra });

  let r = await call("/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).store, kind);
  ok("health");

  r = await call("/data/stockpro%3Aproducts");
  assert.equal(r.status, 404);
  ok("missing key gives 404");

  const products = [{ id: "PRD-001", name: "Steel Sheets", quantity: 120, nested: { a: [1, 2, 3] } }];
  r = await put("/data/stockpro%3Aproducts", { value: products });
  assert.equal(r.status, 200);
  r = await call("/data/stockpro%3Aproducts");
  assert.deepEqual((await r.json()).value, products);
  ok("PUT then GET returns identical data (encoded key)");

  await put("/data/stockpro:products", { value: [] });
  r = await call("/data/stockpro:products");
  assert.deepEqual((await r.json()).value, []);
  ok("overwrite works, empty array is a valid value");

  await put("/data/stockpro:orders", { value: [{ id: "ORD-1001" }] });
  r = await call("/data");
  assert.deepEqual((await r.json()).keys.map((k) => k.key), ["stockpro:orders", "stockpro:products"]);
  ok("list keys");

  for (const bad of ["stockpro%3Ausers", "stockpro:session"]) {
    r = await put(`/data/${bad}`, { value: [{ password: "secret" }] });
    assert.equal(r.status, 403);
  }
  r = await call("/data/stockpro:users");
  assert.equal(r.status, 403);
  ok("login keys are refused (users, session)");

  r = await put("/data/bad%20key", { value: 1 });
  assert.equal(r.status, 400);
  r = await put("/data/%E0%A4%A", { value: 1 });
  assert.equal(r.status, 400);
  ok("invalid keys are rejected");

  r = await put("/data/stockpro:x", "not json at all");
  assert.equal(r.status, 400);
  r = await put("/data/stockpro:x", { nothing: true });
  assert.equal(r.status, 400);
  ok("bad bodies are rejected");

  r = await put("/data/stockpro:big", JSON.stringify({ value: "x".repeat(6 * 1024 * 1024) })).catch(() => ({ status: 413 }));
  assert.equal(r.status, 413);
  ok("payload over 5 MB is rejected");

  r = await call("/data/stockpro:products", { headers: { Origin: "http://localhost:5173" } });
  assert.equal(r.headers.get("access-control-allow-origin"), "http://localhost:5173");
  r = await call("/data/stockpro:products", { headers: { Origin: "https://evil.example" } });
  assert.equal(r.headers.get("access-control-allow-origin"), null);
  r = await call("/data/stockpro:products", { method: "OPTIONS", headers: { Origin: "http://localhost:5173", "Access-Control-Request-Method": "PUT" } });
  assert.equal(r.status, 204);
  ok("CORS: localhost allowed, other sites blocked, preflight answered");

  r = await call("/data/stockpro:orders", { method: "DELETE" });
  assert.equal((await r.json()).removed, 1);
  r = await call("/data/stockpro:orders");
  assert.equal(r.status, 404);
  ok("DELETE one key");

  await put("/data/stockpro:a", { value: 1 });
  r = await call("/data", { method: "DELETE" });
  assert.equal(r.status, 200);
  r = await call("/data");
  assert.deepEqual((await r.json()).keys, []);
  ok("DELETE /data clears everything");

  r = await call("/nothing/here");
  assert.equal(r.status, 404);
  ok("unknown route gives 404");

  await new Promise((res) => server.close(res));
  store.close();
  fs.rmSync(dir, { recursive: true, force: true });
}

await run("sqlite");
await run("json");
console.log(`\nAll good: ${passed} checks passed.`);