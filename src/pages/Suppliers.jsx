import React, { useContext, useState } from "react";
import SuppliersContext from "../context/SuppliersContext";
import OrdersContext from "../context/OrdersContext";
import ConfirmDialog from "../components/ConfirmDialog";
import { getOrderStatus } from "../utils/orders";
import { calculateSupplierRisk } from "../utils/supplierRisk";
import { useToast } from "../context/ToastContext";

const emptyForm = { name: "", contactPerson: "", phone: "", email: "", status: "Active" };

const Suppliers = () => {
  const { suppliers = [], setSuppliers } = useContext(SuppliersContext);
  const { orders = [] } = useContext(OrdersContext);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextSupplierId = () => {
    const max = suppliers.reduce((m, s) => {
      const n = parseInt(String(s.id).replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `SUP-${String(max + 1).padStart(3, "0")}`;
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData(emptyForm);
    setFormError("");
    setNotice("");
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      status: supplier.status || "Active",
    });
    setFormError("");
    setNotice("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const contactPerson = formData.contactPerson.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();

    if (!name) {
      setFormError("Supplier name is required.");
      return;
    }

    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) {
      setFormError("Enter a valid phone number (7 to 15 digits).");
      return;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    const duplicate = suppliers.some(
      (s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== editingSupplier?.id
    );

    if (duplicate) {
      setFormError("A supplier with this name already exists.");
      return;
    }

    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === editingSupplier.id
            ? { ...s, name, contactPerson, phone, email, status: formData.status }
            : s
        )
      );
    } else {
      setSuppliers([
        ...suppliers,
        { id: nextSupplierId(), name, contactPerson, phone, email, status: formData.status },
      ]);
    }

    toast.success(editingSupplier ? `${name} updated` : `${name} added`);
    handleCloseModal();
  };

  const requestDelete = (supplier) => {
    const openOrders = orders.filter(
      (o) => o.supplierId === supplier.id && getOrderStatus(o) !== "Received"
    );

    if (openOrders.length > 0) {
      setNotice(
        `"${supplier.name}" cannot be deleted: open purchase orders ${openOrders
          .map((o) => o.id)
          .join(", ")}.`
      );
      toast.error(`${supplier.name} has open purchase orders`);
      return;
    }

    setNotice("");
    setDeleteTarget(supplier);
  };

  const confirmDelete = () => {
    setSuppliers(suppliers.filter((s) => s.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contactPerson || "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const riskOf = (s) => calculateSupplierRisk(s, orders);
  const riskTone = (lvl) =>
    lvl === "High Risk" ? "bad" : lvl === "Medium Risk" ? "warn" : lvl === "Low Risk" ? "good" : "info";
  const shown = filtered.filter((s) => statusFilter === "All" || s.status === statusFilter);
  const risks = suppliers.map(riskOf);
  const withOrders = risks.filter((r) => r.totalOrders > 0);
  const avgFulfil = withOrders.length
    ? Math.round(withOrders.reduce((a, r) => a + Number(r.fulfillmentPercent || 0), 0) / withOrders.length)
    : 0;
  const stats = [
    { l: "Total Suppliers", v: suppliers.length, c: "#8b5cf6", s: "in your network" },
    { l: "Active", v: suppliers.filter((s) => s.status === "Active").length, c: "#34d399", s: "currently trading" },
    { l: "High Risk", v: risks.filter((r) => r.riskLevel === "High Risk").length, c: "#f43f5e", s: "late or unreliable" },
    { l: "Avg Fulfilment", v: `${avgFulfil}%`, c: "#22d3ee", s: "suppliers with orders" },
  ];

  return (
    <section className="sup pg">
      <header className="pg-head">
        <div>
          <h1>Suppliers</h1>
          <p>Companies you buy raw materials and parts from, scored on delivery.</p>
        </div>
        <button type="button" className="pg-primary" onClick={openAddModal}>+ Add Supplier</button>
      </header>

      {notice && (
        <div className="inv-notice">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">✕</button>
        </div>
      )}

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
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pg-chips">
          {["All", "Active", "Inactive"].map((f) => (
            <button type="button" key={f} className={statusFilter === f ? "on" : ""} onClick={() => setStatusFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && <div className="pg-empty">No suppliers found.</div>}

      <div className="sp-grid">
        {shown.map((s, i) => {
          const risk = riskOf(s);
          const initials = s.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          return (
            <article className="sp-card" key={s.id}>
              <div className="sp-top">
                <span className={`sp-av h${i % 5}`}>{initials}</span>
                <div className="sp-name">
                  <b>{s.name}</b>
                  <small>{s.id}</small>
                </div>
                <span className={`pg-pill ${s.status === "Active" ? "good" : "warn"}`}>{s.status}</span>
              </div>

              <div className="sp-risk">
                <span className={`pg-pill ${riskTone(risk.riskLevel)}`}>{risk.riskLevel}</span>
                <small>{risk.totalOrders > 0 ? `${risk.totalOrders} order(s) placed` : "No orders yet"}</small>
              </div>

              {risk.totalOrders > 0 && (
                <div className="sp-metrics">
                  <div>
                    <span>Fulfilled <b>{risk.fulfillmentPercent}%</b></span>
                    <div className="sp-bar"><i className="good" style={{ width: `${Math.min(100, risk.fulfillmentPercent || 0)}%` }} /></div>
                  </div>
                  <div>
                    <span>Late <b>{risk.latePercent}%</b></span>
                    <div className="sp-bar"><i className="bad" style={{ width: `${Math.min(100, risk.latePercent || 0)}%` }} /></div>
                  </div>
                </div>
              )}

              <dl className="sp-contact">
                <div><dt>Contact</dt><dd>{s.contactPerson || "—"}</dd></div>
                <div><dt>Phone</dt><dd>{s.phone || "—"}</dd></div>
                <div><dt>Email</dt><dd>{s.email || "—"}</dd></div>
              </dl>

              <div className="sp-actions">
                <button type="button" onClick={() => handleEdit(s)}>Edit</button>
                <button type="button" className="del" onClick={() => requestDelete(s)}>Delete</button>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete supplier?"
        message={`"${deleteTarget?.name}" will be removed from your suppliers. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h2>
                <p>{editingSupplier ? "Update supplier details." : "Add a new supplier."}</p>
              </div>
              <button className="close-btn" onClick={handleCloseModal}> ✕ </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Supplier Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter supplier name" />
                </div>

                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Contact name" />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="supplier@example.com" />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="add-btn">{editingSupplier ? "Update Supplier" : "Add Supplier"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Suppliers;