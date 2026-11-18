import React, { useContext, useState } from "react";
import InventoryContext from "../context/InventoryContext";

const RealityCheck = () => {
  const { products = [], recordMovement } = useContext(InventoryContext);
  const [counts, setCounts] = useState({});
  const [msg, setMsg] = useState({});
  const [filter, setFilter] = useState("all");

  const setCount = (id, v) => setCounts({ ...counts, [id]: v });

  const rows = products.map((p) => {
    const raw = counts[p.id];
    const entered = raw !== undefined && raw !== "";
    const physical = entered ? Number(raw) : null;
    const valid = entered && Number.isInteger(physical) && physical >= 0;
    const gap = valid ? physical - p.quantity : null;
    return { p, entered, valid, physical, gap };
  });

  const mismatches = rows.filter((r) => r.valid && r.gap !== 0);
  const counted = rows.filter((r) => r.valid);
  const gapValue = mismatches.reduce((s, r) => s + Math.abs(r.gap) * r.p.price, 0);

  const visible =
    filter === "counted"
      ? counted
      : filter === "mismatch"
      ? mismatches
      : rows;

  const apply = (r) => {
    const res = recordMovement({
      productId: r.p.id,
      type: "ADJUST",
      quantity: r.physical,
      reason: `Reality Check: physical count ${r.physical} vs system ${r.p.quantity}`,
    });
    setMsg({ ...msg, [r.p.id]: res.ok ? "Adjusted" : res.error });
    if (res.ok) setCounts({ ...counts, [r.p.id]: "" });
  };

  const tone = (gap) => {
    if (gap === 0) return "ok";
    return Math.abs(gap) <= 5 ? "warn" : "bad";
  };

  const stats = [
    { l: "Products", v: products.length, c: "#8b5cf6", s: "in the system" },
    { l: "Counted", v: counted.length, c: "#22d3ee", s: "physical counts entered" },
    { l: "Mismatches", v: mismatches.length, c: mismatches.length ? "#fb923c" : "#34d399", s: "differ from system" },
    { l: "Gap Value", v: `₹${gapValue.toLocaleString("en-IN")}`, c: "#f43f5e", s: "value of the differences" },
  ];

  const FILTERS = [
    ["all", "All products"],
    ["counted", "Counted"],
    ["mismatch", "Mismatches"],
  ];

  return (
    <section className="ck pg">
      <header className="pg-head">
        <div>
          <h1>Reality Check</h1>
          <p>Compare system stock with what is physically on the shelf.</p>
        </div>
      </header>

      <div className="pg-stats">
        {stats.map((s) => (
          <div className="pg-stat" key={s.l} style={{ "--c": s.c }}>
            <small>{s.l}</small>
            <strong>{s.v}</strong>
            <span>{s.s}</span>
          </div>
        ))}
      </div>

      <div className="pg-chips">
        {FILTERS.map(([k, label]) => (
          <button type="button" key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="pg-empty">
          {filter === "all" ? "No products yet." : "Nothing to show here yet. Enter a physical count first."}
        </div>
      )}

      <div className="ck-list">
        {visible.map((r) => (
          <article
            className={`ck-row ${r.valid ? tone(r.gap) : ""}`}
            key={r.p.id}
          >
            <div className="ck-prod">
              <b>{r.p.name}</b>
              <small>{r.p.id} · {r.p.category}</small>
            </div>

            <div className="ck-sys">
              <small>System</small>
              <strong>{r.p.quantity}</strong>
              <span>{r.p.unit}</span>
            </div>

            <div className="ck-in">
              <label htmlFor={`count-${r.p.id}`}>Physical count</label>
              <input
                id={`count-${r.p.id}`}
                type="number"
                min="0"
                step="1"
                value={counts[r.p.id] ?? ""}
                onChange={(e) => setCount(r.p.id, e.target.value)}
                placeholder="Enter count"
              />
            </div>

            <div className="ck-gap">
              {r.entered && !r.valid && <span className="pg-pill bad">Whole number only</span>}
              {r.valid && r.gap === 0 && <span className="pg-pill good">Matches</span>}
              {r.valid && r.gap !== 0 && (
                <span className={`ck-gapn ${tone(r.gap)}`}>
                  {r.gap > 0 ? "+" : ""}{r.gap}
                </span>
              )}
            </div>

            <div className="ck-act">
              {r.valid && r.gap !== 0 && (
                <button type="button" className="pg-primary sm" onClick={() => apply(r)}>
                  Apply adjustment
                </button>
              )}
              {msg[r.p.id] && <p className="form-error">{msg[r.p.id]}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RealityCheck;