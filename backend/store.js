import fs from "node:fs";
import path from "node:path";

/**
 * Storage layer. The server only talks to this interface, so the database can
 * be swapped later (PostgreSQL / MongoDB) without touching server.js.
 *
 *   get(key)        -> { value: <json string>, updatedAt } | null
 *   put(key, json)  -> void
 *   delete(key)     -> boolean (true if something was removed)
 *   clear()         -> number of removed keys
 *   list()          -> [{ key, bytes, updatedAt }]
 */

function sqliteStore(DatabaseSync, file) {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const qGet = db.prepare("SELECT value, updated_at FROM kv WHERE key = ?");
  const qPut = db.prepare(
    `INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  );
  const qDel = db.prepare("DELETE FROM kv WHERE key = ?");
  const qClear = db.prepare("DELETE FROM kv");
  const qList = db.prepare("SELECT key, length(value) AS bytes, updated_at FROM kv ORDER BY key");

  return {
    kind: "sqlite",
    location: file,
    get(key) {
      const row = qGet.get(key);
      return row ? { value: row.value, updatedAt: row.updated_at } : null;
    },
    put(key, json) {
      qPut.run(key, json, new Date().toISOString());
    },
    delete(key) {
      return Number(qDel.run(key).changes) > 0;
    },
    clear() {
      return Number(qClear.run().changes);
    },
    list() {
      return qList.all().map((r) => ({ key: r.key, bytes: Number(r.bytes), updatedAt: r.updated_at }));
    },
    close() {
      db.close();
    },
  };
}

function jsonStore(file) {
  let data = {};
  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      throw new Error(`Cannot read ${file}. Fix or delete the file and restart.`);
    }
  }

  // write to a temp file first, then rename: a crash can never leave a half-written file
  const save = () => {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, file);
  };

  return {
    kind: "json",
    location: file,
    get(key) {
      const row = data[key];
      return row ? { value: row.value, updatedAt: row.updatedAt } : null;
    },
    put(key, json) {
      data[key] = { value: json, updatedAt: new Date().toISOString() };
      save();
    },
    delete(key) {
      if (!(key in data)) return false;
      delete data[key];
      save();
      return true;
    },
    clear() {
      const n = Object.keys(data).length;
      data = {};
      save();
      return n;
    },
    list() {
      return Object.keys(data)
        .sort()
        .map((key) => ({ key, bytes: data[key].value.length, updatedAt: data[key].updatedAt }));
    },
    close() {},
  };
}

export async function createStore(dir, preferred = "sqlite") {
  fs.mkdirSync(dir, { recursive: true });

  if (preferred !== "json") {
    try {
      const { DatabaseSync } = await import("node:sqlite");
      return sqliteStore(DatabaseSync, path.join(dir, "stockpro.db"));
    } catch (err) {
      console.warn(`[store] SQLite not available (${err.message}). Using JSON file instead.`);
    }
  }
  return jsonStore(path.join(dir, "stockpro.json"));
}