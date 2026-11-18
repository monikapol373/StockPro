import React, { useContext, useMemo, useState } from "react";
import InventoryContext from "../context/InventoryContext";

const TYPE_LABELS = { IN: "Stock In", OUT: "Stock Out", ADJUST: "Adjustment" };

const toneOf = (m) => (m.type === "ADJUST" ? "warn" : Number(m.change) >= 0 ? "good" : "bad");
const GLYPH = { good: "+", bad: "−", warn: "⇄" };

const dayLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const Movements = () => {
  const { movements = [] } = useContext(InventoryContext);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const types = useMemo(
    () => [...new Set(movements.map((m) => m.type).filter(Boolean))],
    [movements]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return [...movements]
      .sort((a, b) => (new Date(b.date) - new Date(a.date)) || 0)
      .filter((m) => {
        if (filterType !== "All" && m.type !== filterType) return false;
        if (q) {
          const text = `${m.productName ?? ""} ${m.reason ?? ""}`.toLowerCase();
          if (!text.includes(q)) return false;
        }
        const d = new Date(m.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
  }, [movements, search, filterType, fromDate, toDate]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((m) => {
      const key = new Date(m.date).toDateString();
      if (!map.has(key)) map.set(key, { label: dayLabel(m.date), items: [], net: 0 });
      const g = map.get(key);
      g.items.push(m);
      g.net += Number(m.change) || 0;
    });
    return [...map.values()];
  }, [filtered]);

  const stats = useMemo(() => {
    let inUnits = 0, outUnits = 0, adjust = 0;
    movements.forEach((m) => {
      const c = Number(m.change) || 0;
      if (m.type === "ADJUST") adjust++;
      else if (c >= 0) inUnits += c;
      else outUnits += -c;
    });
    return { inUnits, outUnits, adjust };
  }, [movements]);

  const hasFilters = search || filterType !== "All" || fromDate || toDate;

  const clearFilters = () => {
    setSearch("");
    setFilterType("All");
    setFromDate("");
    setToDate("");
  };

  const cards = [
    { l: "Total Entries", v: movements.length, c: "#8b5cf6", s: "all time" },
    { l: "Units Received", v: stats.inUnits.toLocaleString("en-IN"), c: "#34d399", s: "stock in" },
    { l: "Units Issued", v: stats.outUnits.toLocaleString("en-IN"), c: "#f43f5e", s: "stock out" },
    { l: "Adjustments", v: stats.adjust, c: "#fb923c", s: "manual counts" },
  ];

  return (
    <section className="mv pg">
      <header className="pg-head">
        <div>
          <h1>Stock Movements</h1>
          <p>A full record of every stock change, newest first.</p>
        </div>
      </header>

      <div className="pg-stats">
        {cards.map((s) => (
          <div className="pg-stat" key={s.l} style={{ "--c": s.c }}>
            <small>{s.l}</small>
            <strong>{s.v}</strong>
            <span>{s.s}</span>
          </div>
        ))}
      </div>

      <div className="pg-tools">
        <div className="pg-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input
            type="text"
            placeholder="Search product or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="pg-chips">
          {["All", ...types].map((t) => (
            <button
              type="button"
              key={t}
              className={filterType === t ? "on" : ""}
              onClick={() => setFilterType(t)}
            >
              {t === "All" ? "All types" : TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>

        <label className="pg-date">
          From
          <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="pg-date">
          To
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
        </label>
        {hasFilters && (
          <button type="button" className="pg-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <p className="pg-count">Showing {filtered.length} of {movements.length} entries</p>

      {groups.length === 0 && (
        <div className="pg-empty">
          {movements.length === 0 ? "No movements recorded yet." : "No movements match these filters."}
        </div>
      )}

      <div className="mv-timeline">
        {groups.map((g) => (
          <div className="mv-day" key={g.label + g.items[0]?.date}>
            <div className="mv-day-h">
              <b>{g.label}</b>
              <span className={g.net >= 0 ? "good" : "bad"}>
                Net {g.net >= 0 ? `+${g.net}` : g.net} units
              </span>
            </div>

            <div className="mv-list">
              {g.items.map((m, i) => {
                const tone = toneOf(m);
                const change = Number(m.change) || 0;
                return (
                  <div className="mv-item" key={`${m.id}-${i}`}>
                    <span className={`mv-dot ${tone}`}>{GLYPH[tone]}</span>
                    <div className="mv-main">
                      <b>{m.productName}</b>
                      <small>{m.reason || "No reason given"}</small>
                    </div>
                    <span className={`pg-pill ${tone}`}>{TYPE_LABELS[m.type] ?? m.type}</span>
                    <span className="mv-time">
                      {new Date(m.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className={`mv-change ${tone}`}>
                      <strong>{change >= 0 ? `+${change}` : change}</strong>
                      <small>balance {m.balanceAfter}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Movements;