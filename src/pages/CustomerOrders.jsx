import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import InventoryContext from "../context/InventoryContext";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const CustomerOrders = () => {
  const ctx = useContext(CustomerOrdersContext);
  const { customerOrders = [], createCustomerOrder } = ctx;
  const dispatchOrder = ctx.dispatchOrder ?? ctx.dispatchorder;
  const { products = [] } = useContext(InventoryContext);

  const toast = useToast();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [formError, setFormError] = useState("");
  const [rowError, setRowError] = useState({});
  const [pending, setPending] = useState(null);
  const [filter, setFilter] = useState("all");

  const finishedGoods = products.filter(
    (product) =>
      String(product.category || "").trim().toLowerCase() ===
      "finished goods"
  );

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setCustomerName("");
    setProductId("");
    setQuantity("");
  };

  const handleCreate = (event) => {
    event.preventDefault();

    const name = customerName.trim();
    const qty = Number(quantity);

    if (!name) {
      setFormError("Customer name is required.");
      return;
    }

    if (!productId) {
      setFormError("Select a product.");
      return;
    }

    if (!Number.isInteger(qty) || qty < 1) {
      setFormError("Quantity must be a whole number of at least 1.");
      return;
    }

    const result = createCustomerOrder({
      customerName: name,
      productId,
      quantity: qty,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    toast.success("Customer order created");
    closeModal();
  };

  const runDispatch = () => {
    if (!pending || typeof dispatchOrder !== "function") {
      toast.error("Dispatch action is unavailable.");
      setPending(null);
      return;
    }

    const order = pending;
    const result = dispatchOrder(order.id);

    setRowError((previous) => ({
      ...previous,
      [order.id]: result.ok ? null : result.error,
    }));

    if (result.ok) {
      toast.success(`${order.id} dispatched. Stock updated`);
    } else {
      toast.error(result.error);
    }

    setPending(null);
  };

  const planProduction = (order) => {
    navigate("/production", {
      state: {
        productId: order.productId,
        targetQty: order.quantity,
        customerOrderId: order.id,
      },
    });
  };

  const pendingStock = pending
    ? products.find((product) => product.id === pending.productId)
        ?.quantity ?? 0
    : 0;

  const rows = customerOrders.map((order) => {
    const product = products.find((item) => item.id === order.productId);
    const availableStock = Number(product?.quantity ?? 0);
    const required = Number(order.quantity) || 0;
    const needsProduction = order.status === "Pending" && availableStock < required;
    return {
      order,
      availableStock,
      required,
      needsProduction,
      ready: order.status === "Pending" && !needsProduction,
      done: order.status !== "Pending",
    };
  });
  const FILTERS = [
    ["all", "All orders"],
    ["ready", "Ready to dispatch"],
    ["production", "Needs production"],
    ["done", "Dispatched"],
  ];
  const countOf = (k) =>
    rows.filter((r) => k === "all" || (k === "ready" && r.ready) || (k === "production" && r.needsProduction) || (k === "done" && r.done)).length;
  const visible = rows.filter(
    (r) =>
      filter === "all" ||
      (filter === "ready" && r.ready) ||
      (filter === "production" && r.needsProduction) ||
      (filter === "done" && r.done)
  );
  const stats = [
    { l: "Total Orders", v: rows.length, c: "#8b5cf6", s: "all time" },
    { l: "Ready to Dispatch", v: countOf("ready"), c: "#34d399", s: "stock available" },
    { l: "Needs Production", v: countOf("production"), c: "#fb923c", s: "stock is short" },
    { l: "Dispatched", v: countOf("done"), c: "#3b82f6", s: "completed" },
  ];

  return (
    <section className="co pg">
      <header className="pg-head">
        <div>
          <h1>Customer Orders</h1>
          <p>Manage customer orders and dispatch finished goods.</p>
        </div>
        <button type="button" className="pg-primary" onClick={() => setShowModal(true)}>
          + New Customer Order
        </button>
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
            {label} <em className="co-n">{countOf(k)}</em>
          </button>
        ))}
      </div>

      {customerOrders.length === 0 && (
        <div className="pg-empty">No customer orders yet. Click "+ New Customer Order" to add one.</div>
      )}
      {customerOrders.length > 0 && visible.length === 0 && (
        <div className="pg-empty">No orders in this view.</div>
      )}

      <div className="co-list">
        {visible.map((r) => {
          const { order } = r;
          const pct = r.required ? Math.min(100, (r.availableStock / r.required) * 100) : 100;
          const initials = String(order.customerName || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          return (
            <article className={`co-row ${r.needsProduction ? "short" : r.ready ? "ready" : "done"}`} key={order.id}>
              <span className="co-av">{initials}</span>
              <div className="co-who">
                <b>{order.customerName}</b>
                <small>{order.id} · {order.orderDate}</small>
              </div>
              <div className="co-prod">
                <b>{order.productName}</b>
                <small>Quantity {order.quantity}</small>
              </div>
              <div className="co-cover">
                {r.done ? (
                  <span className="pg-pill good">Dispatched</span>
                ) : (
                  <>
                    <div className="co-cover-t">
                      <span>In stock <b>{r.availableStock}</b></span>
                      <span>Required <b>{r.required}</b></span>
                    </div>
                    <div className="co-bar"><i className={r.needsProduction ? "warn" : "good"} style={{ width: `${pct}%` }} /></div>
                  </>
                )}
              </div>
              <div className="co-act">
                {r.needsProduction && (
                  <button type="button" className="pg-primary sm" onClick={() => planProduction(order)}>
                    Plan Production
                  </button>
                )}
                {r.ready && (
                  <button type="button" className="pg-primary sm" onClick={() => setPending(order)}>
                    Dispatch
                  </button>
                )}
              </div>
              {rowError[order.id] && <p className="form-error co-err">{rowError[order.id]}</p>}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Dispatch this order?"
        message={`${pending?.quantity} x ${pending?.productName} for ${pending?.customerName} will be deducted from stock (currently ${pendingStock} available).`}
        confirmLabel="Dispatch"
        onConfirm={runDispatch}
        onCancel={() => setPending(null)}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>New Customer Order</h2>
                <p>Record an order to be fulfilled from stock.</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="customer-name">Customer Name</label>

                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="customer-product">Product</label>

                  <select
                    id="customer-product"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    required
                  >
                    <option value="">Select a finished product</option>

                    {finishedGoods.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.quantity} in stock)
                      </option>
                    ))}
                  </select>

                  {finishedGoods.length === 0 && (
                    <small style={{ color: "#dc2626" }}>
                      No Finished Goods found. Add a product with category
                      "Finished Goods" in Inventory.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="customer-quantity">Quantity</label>

                  <input
                    id="customer-quantity"
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    min="1"
                    step="1"
                    required
                  />
                </div>
              </div>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="add-btn">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CustomerOrders;