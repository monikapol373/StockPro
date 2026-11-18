import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OrdersContext from "../context/OrdersContext";
import InventoryContext from "../context/InventoryContext";
import SuppliersContext from "../context/SuppliersContext";
import { getOrderStatus } from "../utils/orders";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  supplierId: "",
  productId: "",
  quantity: "",
  expectedDate: "",
};

const Orders = () => {
  const { orders = [], setOrders } = useContext(OrdersContext);
  const { products = [], recordMovement } = useContext(InventoryContext);
  const { suppliers = [] } = useContext(SuppliersContext);

  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [receivingOrder, setReceivingOrder] = useState(null);
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveError, setReceiveError] = useState("");
  const [search, setSearch] = useState("");

  const purchasable = products.filter(
    (product) => product.category !== "Finished Goods"
  );

  // Prefill product and quantity when arriving from Production Planner.
  useEffect(() => {
    const draft = location.state?.purchaseOrderDraft;
    if (!draft) return;

    const product = purchasable.find(
      (item) => String(item.id) === String(draft.productId)
    );

    if (product) {
      setFormData({
        ...emptyForm,
        productId: String(product.id),
        quantity: String(draft.quantity),
      });
      setFormError("");
      setShowModal(true);
    } else {
      toast.error("Shortage product not found in Inventory.");
    }

    // Clear navigation state so refreshing won't reopen the same draft.
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.key]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError("");
    setFormData(emptyForm);
  };

  const nextOrderId = () => {
    const max = orders.reduce((maximum, order) => {
      const number = parseInt(String(order.id).replace(/\D/g, ""), 10);

      return Number.isNaN(number)
        ? maximum
        : Math.max(maximum, number);
    }, 1000);

    return `ORD-${max + 1}`;
  };

  const handleAddOrder = (event) => {
    event.preventDefault();

    const supplier = suppliers.find(
      (item) => String(item.id) === String(formData.supplierId)
    );

    const product = products.find(
      (item) => String(item.id) === String(formData.productId)
    );

    const quantity = Number(formData.quantity);

    if (!supplier || !product) {
      setFormError("Please select both a supplier and a product.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError("Enter a valid whole-number quantity.");
      return;
    }

    if (!formData.expectedDate) {
      setFormError("Expected delivery date is required.");
      return;
    }

    const newOrder = {
      id: nextOrderId(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      quantity,
      receivedQty: 0,
      expectedDate: formData.expectedDate,
      createdDate: new Date().toISOString(),
    };

    setOrders((previous) => [newOrder, ...previous]);

    toast.success(`${newOrder.id} created`);
    handleCloseModal();
  };

  const openReceive = (order) => {
    setReceivingOrder(order);
    setReceiveQty(
      String(order.quantity - order.receivedQty)
    );
    setReceiveError("");
  };

  const closeReceive = () => {
    setReceivingOrder(null);
    setReceiveError("");
  };

  const handleReceiveSubmit = (event) => {
    event.preventDefault();

    const remaining =
      receivingOrder.quantity - receivingOrder.receivedQty;

    const quantity = Number(receiveQty);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setReceiveError("Enter a valid whole number.");
      return;
    }

    if (quantity > remaining) {
      setReceiveError(`Cannot receive more than ${remaining} remaining.`);
      return;
    }

    const result = recordMovement({
      productId: receivingOrder.productId,
      type: "IN",
      quantity,
      reason: `Received from ${receivingOrder.supplierName} (${receivingOrder.id})`,
    });

    if (!result.ok) {
      setReceiveError(result.error);
      return;
    }

    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== receivingOrder.id) return order;

        const received = order.receivedQty + quantity;

        return {
          ...order,
          receivedQty: received,
          receivedDate:
            received >= order.quantity
              ? new Date().toISOString()
              : order.receivedDate,
        };
      })
    );

    toast.success(
      `Received ${quantity} ${receivingOrder.productName} (${receivingOrder.id})`
    );

    closeReceive();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const q = search.trim().toLowerCase();
  const visible = orders.filter(
    (o) => !q || `${o.id} ${o.supplierName} ${o.productName}`.toLowerCase().includes(q)
  );
  const isOverdue = (o) =>
    getOrderStatus(o) !== "Received" && o.expectedDate && o.expectedDate < todayStr;
  const countBy = (s) => orders.filter((o) => getOrderStatus(o) === s).length;
  const unitsOnOrder = orders.reduce(
    (sum, o) => sum + Math.max(0, o.quantity - o.receivedQty),
    0
  );
  const stats = [
    { l: "Total Orders", v: orders.length, c: "#8b5cf6", s: "all time" },
    {
      l: "Awaiting Delivery",
      v: countBy("Pending") + countBy("Partially Received"),
      c: "#3b82f6",
      s: `${unitsOnOrder.toLocaleString("en-IN")} units on order`,
    },
    { l: "Overdue", v: orders.filter(isOverdue).length, c: "#f43f5e", s: "past expected date" },
    { l: "Completed", v: countBy("Received"), c: "#34d399", s: "fully received" },
  ];
  const COLS = [
    { key: "Pending", title: "Pending", tone: "warn" },
    { key: "Partially Received", title: "Partially received", tone: "info" },
    { key: "Received", title: "Received", tone: "good" },
  ];

  return (
    <section className="orders pg">
      <header className="pg-head">
        <div>
          <h1>Purchase Orders</h1>
          <p>Orders placed with suppliers, and what's been received so far.</p>
        </div>
        <button
          type="button"
          className="pg-primary"
          onClick={() => {
            setFormData(emptyForm);
            setFormError("");
            setShowModal(true);
          }}
        >
          + New Order
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

      <div className="pg-tools">
        <div className="pg-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input
            type="text"
            placeholder="Search order, supplier or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="pg-count" style={{ margin: 0 }}>
          Showing {visible.length} of {orders.length} orders
        </span>
      </div>

      {orders.length === 0 && (
        <div className="pg-empty">No purchase orders yet. Click "+ New Order" to create one.</div>
      )}

      {orders.length > 0 && (
        <div className="pb-board">
          {COLS.map((col) => {
            const list = visible.filter((o) => getOrderStatus(o) === col.key);
            return (
              <div className={`pb-col ${col.tone}`} key={col.key}>
                <div className="pb-col-h">
                  <b>{col.title}</b>
                  <span>{list.length}</span>
                </div>
                <div className="pb-col-body">
                  {list.length === 0 && <p className="pb-none">Nothing here</p>}
                  {list.map((order) => {
                    const status = getOrderStatus(order);
                    const percent = order.quantity
                      ? Math.round((order.receivedQty / order.quantity) * 100)
                      : 0;
                    const late = isOverdue(order);
                    return (
                      <article className="pb-card" key={order.id}>
                        <div className="pb-card-top">
                          <b>{order.id}</b>
                          <span className={`pg-pill ${late ? "bad" : "info"}`}>
                            {late ? "Overdue" : order.expectedDate ? `Due ${order.expectedDate}` : "No date"}
                          </span>
                        </div>
                        <div className="pb-prod">{order.productName}</div>
                        <small className="pb-sup">{order.supplierName}</small>
                        <div className="pb-prog">
                          <div className="pb-bar"><i className={col.tone} style={{ width: `${percent}%` }} /></div>
                          <span>{order.receivedQty} / {order.quantity}</span>
                        </div>
                        <button
                          type="button"
                          className="pb-act"
                          disabled={status === "Received"}
                          onClick={() => openReceive(order)}
                        >
                          {status === "Received" ? "✓ Completed" : "Receive stock"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>New Purchase Order</h2>
                <p>Order stock from a supplier.</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOrder}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Supplier</label>

                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a supplier</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Product</label>

                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a product</option>

                    {purchasable.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expected Delivery</label>

                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
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
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
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

      {receivingOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Receive Stock</h2>

                <p>
                  {receivingOrder.productName} —{" "}
                  {receivingOrder.supplierName}
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeReceive}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReceiveSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    Quantity received now (remaining:{" "}
                    {receivingOrder.quantity - receivingOrder.receivedQty})
                  </label>

                  <input
                    type="number"
                    value={receiveQty}
                    onChange={(event) => setReceiveQty(event.target.value)}
                    min="1"
                    max={
                      receivingOrder.quantity - receivingOrder.receivedQty
                    }
                    step="1"
                    required
                  />
                </div>
              </div>

              {receiveError && (
                <p className="form-error" role="alert">
                  {receiveError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeReceive}
                >
                  Cancel
                </button>

                <button type="submit" className="add-btn">
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Orders;