import React, { useContext } from "react";
import OrdersContext from "../context/OrdersContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";

const DAY = 86400000;

const avgDays = (items, startKey, endKey) => {
  const spans = items
    .filter((x) => x[startKey] && x[endKey])
    .map((x) => (new Date(x[endKey]) - new Date(x[startKey])) / DAY)
    .filter((d) => Number.isFinite(d) && d >= 0);
  if (spans.length === 0) return { avg: null, count: 0 };
  return { avg: spans.reduce((s, d) => s + d, 0) / spans.length, count: spans.length };
};

const Bottleneck = () => {
  const { orders = [] } = useContext(OrdersContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);

  const stages = [
    { name: "Procurement", note: "PO created to fully received", ...avgDays(orders, "createdDate", "receivedDate") },
    { name: "Production", note: "Started to completed", ...avgDays(productions, "startedDate", "completedDate") },
    { name: "Dispatch", note: "Customer order to dispatched", ...avgDays(customerOrders, "orderDate", "dispatchedDate") },
  ];

  const withData = stages.filter((s) => s.avg !== null);
  const max = withData.length ? Math.max(...withData.map((s) => s.avg)) : 0;
  const slowest = withData.length >= 2 ? withData.reduce((a, b) => (b.avg > a.avg ? b : a)) : null;

  return (
    <section className="fl pg">
      <header className="pg-head">
        <div>
          <h1>Bottleneck Detection</h1>
          <p>Average time spent in each stage, from your real order data.</p>
        </div>
      </header>

      <div className={`fl-insight ${slowest ? "found" : ""}`}>
        {slowest ? (
          <>
            <b>{slowest.name}</b> is the slowest stage: average <b>{slowest.avg.toFixed(1)} days</b>.
          </>
        ) : (
          "Complete orders in at least two stages (receive a PO, finish production, dispatch an order) to see the bottleneck."
        )}
      </div>

      <div className="fl-flow">
        {stages.map((s, i) => {
          const pct = s.avg !== null && max > 0 ? Math.max((s.avg / max) * 100, 4) : 0;
          const isSlow = slowest && slowest.name === s.name;
          return (
            <React.Fragment key={s.name}>
              {i > 0 && <span className="fl-arrow">→</span>}
              <article className={`fl-node ${isSlow ? "slow" : ""}`}>
                <span className="fl-n">{i + 1}</span>
                <h3>{s.name}</h3>
                <small>{s.note}</small>
                <div className="fl-val">
                  {s.avg !== null ? (
                    <>
                      <strong>{s.avg.toFixed(1)}</strong>
                      <span>days average</span>
                    </>
                  ) : (
                    <span>No data yet</span>
                  )}
                </div>
                <div className="fl-track">
                  <i style={{ width: `${pct}%` }} />
                </div>
                <small>{s.avg !== null ? `${s.count} completed` : "Waiting for completed orders"}</small>
                {isSlow && <span className="fl-tag">Bottleneck</span>}
              </article>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default Bottleneck;