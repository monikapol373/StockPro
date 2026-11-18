import React, { useMemo } from "react";

const DAYS = 7;

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const TrendChart = ({ movements = [] }) => {
  const data = useMemo(() => {
    const list = Array.isArray(movements) ? movements : [];
    const days = [];
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      days.push({
        key: dayKey(d),
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        inQty: 0,
        outQty: 0,
      });
    }
    const map = Object.fromEntries(days.map((d) => [d.key, d]));
    list.forEach((m) => {
      if (!m || !m.date) return;
      const dt = new Date(m.date);
      if (isNaN(dt)) return;
      const slot = map[dayKey(dt)];
      if (!slot) return;
      const qty = Math.abs(Number(m.change) || 0);
      if (m.type === "IN") slot.inQty += qty;
      else if (m.type === "OUT") slot.outQty += qty;
    });
    return days;
  }, [movements]);

  const max = Math.max(1, ...data.map((d) => Math.max(d.inQty, d.outQty)));
  const totalIn = data.reduce((s, d) => s + d.inQty, 0);
  const totalOut = data.reduce((s, d) => s + d.outQty, 0);

  const W = 560, H = 190, padL = 34, padB = 26, padT = 10;
  const innerW = W - padL - 8;
  const innerH = H - padB - padT;
  const groupW = innerW / DAYS;
  const barW = Math.min(18, groupW / 3);
  const y = (v) => padT + innerH - (v / max) * innerH;

  return (
    <div className="trend">
      <div className="trend-head">
        <div>
          <h3>Stock Trend</h3>
          <p>Last 7 days, units in vs out</p>
        </div>
        <div className="trend-legend">
          <span><i className="lg-in" /> In {totalIn}</span>
          <span><i className="lg-out" /> Out {totalOut}</span>
        </div>
      </div>

      {totalIn === 0 && totalOut === 0 ? (
        <div className="trend-empty">No stock movement in the last 7 days.</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg" role="img" aria-label="Stock in and out for the last 7 days">
          {[0, 0.5, 1].map((t) => {
            const v = Math.round(max * t);
            return (
              <g key={t}>
                <line x1={padL} x2={W - 8} y1={y(v)} y2={y(v)} className="trend-grid" />
                <text x={padL - 6} y={y(v) + 4} textAnchor="end" className="trend-tick">{v}</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const cx = padL + groupW * i + groupW / 2;
            return (
              <g key={d.key}>
                <rect x={cx - barW - 1} y={y(d.inQty)} width={barW} height={Math.max(0, padT + innerH - y(d.inQty))} rx="3" className="bar-in">
                  <title>{`${d.label}: ${d.inQty} in`}</title>
                </rect>
                <rect x={cx + 1} y={y(d.outQty)} width={barW} height={Math.max(0, padT + innerH - y(d.outQty))} rx="3" className="bar-out">
                  <title>{`${d.label}: ${d.outQty} out`}</title>
                </rect>
                <text x={cx} y={H - 8} textAnchor="middle" className="trend-tick">{d.label}</text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default TrendChart;