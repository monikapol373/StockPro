import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductionContext from "../context/ProductionContext";
import BomContext from "../context/BomContext";
import InventoryContext from "../context/InventoryContext";
import { calculateMaxProducible } from "../utils/bom";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const Production = () => {
  const {
    productions = [],
    createProductionOrder,
    startProduction,
    completeProduction,
    checkMaterialAvailability,
  } = useContext(ProductionContext);

  const { boms = [] } = useContext(BomContext);
  const { products = [] } = useContext(InventoryContext);
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [bomId, setBomId] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [formError, setFormError] = useState("");
  const [rowError, setRowError] = useState({});
  const [pending, setPending] = useState(null);

  // Auto-fill production details when navigating from Customer Orders / Planner.
  useEffect(() => {
    const request = location.state;

    // Draft coming from the Production Planner.
    const draft = request?.productionOrderDraft;

    if (draft?.bomId) {
      setBomId(draft.bomId);
      setTargetQty(String(draft.targetQty || ""));
      setShowModal(true);
      setFormError("");
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (!request?.productId) return;

    const matchingBom = boms.find(
      (bom) => bom.finishedProductId === request.productId
    );

    setBomId(matchingBom?.id || "");
    setTargetQty(String(request.targetQty || ""));
    setShowModal(true);

    setFormError(
      matchingBom
        ? ""
        : "No BOM exists for this finished product. Create its BOM first."
    );

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, boms, navigate]);

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setBomId("");
    setTargetQty("");
  };

  const selectedBom = boms.find((item) => item.id === bomId);

  const preview = selectedBom
    ? calculateMaxProducible(selectedBom, products)
    : null;

  const materialReport =
    selectedBom &&
    Number.isInteger(Number(targetQty)) &&
    Number(targetQty) > 0
      ? checkMaterialAvailability({
          bom: selectedBom,
          targetQty: Number(targetQty),
        })
      : null;

  const handleCreate = (event) => {
    event.preventDefault();

    const bom = boms.find((item) => item.id === bomId);

    if (!bom) {
      setFormError("Select a BOM.");
      return;
    }

    const quantity = Number(targetQty);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setFormError("Target quantity must be a whole number of at least 1.");
      return;
    }

    const result = createProductionOrder({
      bom,
      targetQty: quantity,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    toast.success("Production order created");
    closeModal();
  };

  const runPending = () => {
    if (!pending) return;

    const { type, order } = pending;
    let result;

    if (type === "start") {
      const bom = boms.find((item) => item.id === order.bomId);

      if (!bom) {
        toast.error("The BOM for this production order was not found.");
        setPending(null);
        return;
      }

      result = startProduction(order.id, bom);
    } else {
      result = completeProduction(order.id);
    }

    setRowError((previous) => ({
      ...previous,
      [order.id]: result.ok ? null : result.error,
    }));

    if (result.ok) {
      toast.success(
        type === "start"
          ? `${order.id} started. Materials deducted from stock`
          : `${order.id} completed. Finished goods added to stock`
      );
    } else {
      toast.error(result.error);
    }

    setPending(null);
  };

  const STAGES = ["Planned", "In Progress", "Completed"];
  const countOf = (s) => productions.filter((p) => p.status === s).length;
  const plannedUnits = productions.reduce((a, p) => a + (Number(p.targetQty) || 0), 0);
  const stats = [
    { l: "Total Orders", v: productions.length, c: "#8b5cf6", s: `${plannedUnits.toLocaleString("en-IN")} units planned` },
    { l: "Planned", v: countOf("Planned"), c: "#fb923c", s: "waiting to start" },
    { l: "In Progress", v: countOf("In Progress"), c: "#60a5fa", s: "materials consumed" },
    { l: "Completed", v: countOf("Completed"), c: "#34d399", s: "added to stock" },
  ];

  return (
    <section className="prod pg">
      <header className="pg-head">
        <div>
          <h1>Production Orders</h1>
          <p>Plan production, check material availability, and release finished goods.</p>
        </div>
        <button type="button" className="pg-primary" onClick={() => setShowModal(true)}>
          + New Production Order
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

      {productions.length === 0 && (
        <div className="pg-empty">No production orders yet. Click "+ New Production Order" to start.</div>
      )}

      <div className="wo-grid">
        {productions.map((order) => {
          const step = Math.max(STAGES.indexOf(order.status), 0);
          return (
            <article className="wo-card" key={order.id}>
              <div className="wo-top">
                <div>
                  <small>{order.id}</small>
                  <h3>{order.finishedProductName}</h3>
                </div>
                <div className="wo-qty">
                  <strong>{order.targetQty}</strong>
                  <small>units</small>
                </div>
              </div>

              <div className="wo-steps">
                {STAGES.map((s, i) => {
                  const cls = order.status === "Completed" || i < step ? "done" : i === step ? "now" : "";
                  return (
                    <div className={`wo-step ${cls}`} key={s}>
                      <span>{cls === "done" ? "✓" : i + 1}</span>
                      <small>{s}</small>
                    </div>
                  );
                })}
              </div>

              <div className="wo-foot">
                {order.status === "Planned" && (
                  <button type="button" className="pg-primary" onClick={() => setPending({ type: "start", order })}>
                    Start production
                  </button>
                )}
                {order.status === "In Progress" && (
                  <button type="button" className="pg-primary" onClick={() => setPending({ type: "complete", order })}>
                    Mark complete
                  </button>
                )}
                {order.status === "Completed" && <span className="pg-pill good">✓ Completed</span>}
              </div>
              {rowError[order.id] && (
                <p className="form-error" role="alert">{rowError[order.id]}</p>
              )}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pending}
        title={
          pending?.type === "start"
            ? "Start production?"
            : "Complete production?"
        }
        message={
          pending?.type === "start"
            ? `Raw materials for ${pending?.order.targetQty} x ${pending?.order.finishedProductName} will be consumed from stock.`
            : `${pending?.order.targetQty} x ${pending?.order.finishedProductName} will be added to finished goods stock.`
        }
        confirmLabel={pending?.type === "start" ? "Start" : "Complete"}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>New Production Order</h2>
                <p>Choose what to build and how many.</p>
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
                  <label htmlFor="production-bom">Bill of Materials</label>

                  <select
                    id="production-bom"
                    value={bomId}
                    onChange={(event) => setBomId(event.target.value)}
                    required
                  >
                    <option value="">Select a product to build</option>

                    {boms.map((bom) => (
                      <option key={bom.id} value={bom.id}>
                        {bom.finishedProductName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="production-quantity">Target Quantity</label>

                  <input
                    id="production-quantity"
                    type="number"
                    value={targetQty}
                    onChange={(event) => setTargetQty(event.target.value)}
                    min="1"
                    step="1"
                    required
                  />

                  {preview && (
                    <small className={`mr-hint ${preview.maxUnits > 0 ? "good" : "bad"}`}>
                      Currently producible: {preview.maxUnits} units (limited
                      by {preview.limitingComponent || "N/A"})
                    </small>
                  )}
                </div>
              </div>

              {materialReport?.ok && (
                <div className={`mr-report ${materialReport.canStart ? "good" : "bad"}`}>
                  <h3>Material Availability Report</h3>
                  <p>
                    {materialReport.canStart
                      ? "✓ Ready to produce — all required materials are available."
                      : `⚠ Material shortage — ${materialReport.shortageCount} component(s) need attention.`}
                  </p>
                  <table className="mr-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Required</th>
                        <th>Available</th>
                        <th>Missing</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialReport.materials.map((material) => (
                        <tr key={material.productId}>
                          <td>{material.productName}</td>
                          <td>{material.requiredQty}</td>
                          <td>{material.availableQty}</td>
                          <td>{material.missingQty}</td>
                          <td>
                            <span className={`pg-pill ${material.sufficient ? "good" : "bad"}`}>
                              {material.sufficient
                                ? "Available"
                                : material.productFound
                                ? "Shortage"
                                : "Not in inventory"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

export default Production;