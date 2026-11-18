import React, { useContext, useState } from "react";
import BomContext from "../context/BomContext";
import InventoryContext from "../context/InventoryContext";
import { calculateMaxProducible } from "../utils/bom";
import useCountUp from "../hooks/useCountUp";
import { useToast } from "../context/ToastContext";

const emptyComponent = {
  productId: "",
  quantityPerUnit: "1",
};

const BomCard = ({ bom, products, onEdit }) => {
  const result = calculateMaxProducible(bom, products);
  const count = useCountUp(result.maxUnits, 900);

  return (
    <article className="bm-card">
      <div className="bm-head">
        <div>
          <small>{bom.id}</small>
          <h2>{bom.finishedProductName}</h2>
        </div>
        <button type="button" className="pg-btn" onClick={() => onEdit(bom)}>
          Edit BOM
        </button>
      </div>

      <div className="bm-hero">
        <strong>{count}</strong>
        <span>units can be produced with current stock</span>
      </div>

      {result.maxUnits > 0 && (
        <p className="bm-limit">
          Limited by <b>{result.limitingComponent}</b>
        </p>
      )}

      <div className="bm-parts">
        {result.breakdown.map((component) => {
          const percentage =
            component.possibleUnits === 0
              ? 0
              : Math.min(
                  100,
                  Math.round((result.maxUnits / component.possibleUnits) * 100)
                );

          const isLimit = component.productName === result.limitingComponent;

          return (
            <div
              key={component.productId}
              className={`bm-part ${isLimit ? "limit" : ""}`}
            >
              <div className="bm-part-t">
                <b>{component.productName}</b>
                <span>{component.quantityPerUnit} {component.unit} per unit</span>
              </div>
              <div className="bm-bar">
                <i style={{ width: `${percentage}%` }} />
              </div>
              <small>
                {component.available} {component.unit} available → {component.possibleUnits} units possible
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );
};

const Bom = () => {
  const { boms = [], setBoms } = useContext(BomContext);
  const { products = [] } = useContext(InventoryContext);
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingBomId, setEditingBomId] = useState(null);
  const [finishedProductId, setFinishedProductId] = useState("");
  const [components, setComponents] = useState([{ ...emptyComponent }]);
  const [error, setError] = useState("");

  const finishedProducts = products.filter(
    (product) =>
      String(product.category || "").trim().toLowerCase() ===
      "finished goods"
  );

  const rawMaterials = products.filter(
    (product) =>
      String(product.category || "").trim().toLowerCase() !==
      "finished goods"
  );

  // While editing, keep the selected BOM's finished product available.
  const availableFinishedProducts = finishedProducts.filter(
    (product) =>
      !boms.some(
        (bom) =>
          bom.id !== editingBomId &&
          (bom.finishedProductId === product.id ||
            bom.finishedProductName === product.name)
      )
  );

  const openForm = (bom = null) => {
    setError("");

    if (bom) {
      setEditingBomId(bom.id);
      setFinishedProductId(bom.finishedProductId);
      setComponents(
        bom.components?.length
          ? bom.components.map((component) => ({
              productId: component.productId,
              quantityPerUnit: String(component.quantityPerUnit),
            }))
          : [{ ...emptyComponent }]
      );
    } else {
      setEditingBomId(null);
      setFinishedProductId("");
      setComponents([{ ...emptyComponent }]);
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBomId(null);
    setError("");
  };

  const updateComponent = (index, field, value) => {
    setComponents((previous) =>
      previous.map((component, i) =>
        i === index ? { ...component, [field]: value } : component
      )
    );
  };

  const addComponent = () => {
    setComponents((previous) => [
      ...previous,
      { ...emptyComponent },
    ]);
  };

  const removeComponent = (index) => {
    setComponents((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSave = (event) => {
    event.preventDefault();
    setError("");

    const finishedProduct = finishedProducts.find(
      (product) => product.id === finishedProductId
    );

    if (!finishedProduct) {
      setError(
        "Select a product whose category is Finished Goods. Check Inventory if needed."
      );
      return;
    }

    const duplicateBom = boms.some(
      (bom) =>
        bom.id !== editingBomId &&
        (bom.finishedProductId === finishedProduct.id ||
          bom.finishedProductName === finishedProduct.name)
    );

    if (duplicateBom) {
      setError("A BOM already exists for this finished product.");
      return;
    }

    if (components.length === 0) {
      setError("Add at least one raw material.");
      return;
    }

    const savedComponents = [];

    for (const component of components) {
      const product = rawMaterials.find(
        (item) => item.id === component.productId
      );
      const quantity = Number(component.quantityPerUnit);

      if (!product) {
        setError("Select a valid material for every row.");
        return;
      }

      if (product.id === finishedProduct.id) {
        setError("A finished product cannot be its own raw material.");
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError("Each material quantity must be greater than zero.");
        return;
      }

      if (
        savedComponents.some(
          (item) => item.productId === component.productId
        )
      ) {
        setError(`"${product.name}" has been selected more than once.`);
        return;
      }

      savedComponents.push({
        productId: product.id,
        quantityPerUnit: quantity,
      });
    }

    if (editingBomId) {
      const updatedBom = {
        id: editingBomId,
        finishedProductId: finishedProduct.id,
        finishedProductName: finishedProduct.name,
        components: savedComponents,
      };

      setBoms((previous) =>
        previous.map((bom) =>
          bom.id === editingBomId ? updatedBom : bom
        )
      );

      toast.success(`BOM updated for ${finishedProduct.name}`);
    } else {
      const nextNumber =
        boms.reduce((maximum, bom) => {
          const number = Number(String(bom.id).replace(/\D/g, ""));
          return Number.isFinite(number)
            ? Math.max(maximum, number)
            : maximum;
        }, 0) + 1;

      const newBom = {
        id: `BOM-${String(nextNumber).padStart(3, "0")}`,
        finishedProductId: finishedProduct.id,
        finishedProductName: finishedProduct.name,
        components: savedComponents,
      };

      setBoms((previous) => [...previous, newBom]);
      toast.success(`BOM created for ${finishedProduct.name}`);
    }

    closeForm();
  };

  const results = boms.map((bom) => calculateMaxProducible(bom, products));
  const buildable = results.filter((r) => r.maxUnits > 0).length;
  const totalParts = boms.reduce((s, b) => s + (b.components?.length || 0), 0);
  const stats = [
    { l: "Bills of Material", v: boms.length, c: "#8b5cf6", s: "finished products defined" },
    { l: "Can Build Now", v: buildable, c: "#34d399", s: "enough materials in stock" },
    { l: "Blocked", v: boms.length - buildable, c: "#f43f5e", s: "a material has run out" },
    { l: "Components", v: totalParts, c: "#22d3ee", s: "raw materials used" },
  ];

  return (
    <section className="bm pg">
      <header className="pg-head">
        <div>
          <h1>Bill of Materials</h1>
          <p>See how much you can produce with your available raw material stock.</p>
        </div>
        <button type="button" className="pg-primary" onClick={() => openForm()}>
          + Add BOM
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

      {showForm && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{ width: "min(700px, 95vw)", maxWidth: 700 }}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingBomId ? "Edit Bill of Materials" : "Create Bill of Materials"}
                </h2>
                <p>
                  Define the raw materials required to make one finished unit.
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeForm}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="finished-product">Finished Product</label>

                <select
                  id="finished-product"
                  value={finishedProductId}
                  onChange={(event) =>
                    setFinishedProductId(event.target.value)
                  }
                  required
                >
                  <option value="">Select a finished product</option>

                  {availableFinishedProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                {availableFinishedProducts.length === 0 && (
                  <p style={{ fontSize: 13, color: "#b45309" }}>
                    No available Finished Goods products found in Inventory.
                  </p>
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ margin: 0 }}>Required Raw Materials</h3>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={addComponent}
                    disabled={rawMaterials.length === 0}
                  >
                    + Add Material
                  </button>
                </div>

                {components.map((component, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 120px auto",
                      gap: 10,
                      alignItems: "end",
                      marginBottom: 14,
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor={`raw-material-${index}`}>
                        Raw Material
                      </label>

                      <select
                        id={`raw-material-${index}`}
                        value={component.productId}
                        onChange={(event) =>
                          updateComponent(
                            index,
                            "productId",
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="">Select material</option>

                        {rawMaterials.map((product) => (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={components.some(
                              (other, otherIndex) =>
                                otherIndex !== index &&
                                other.productId === product.id
                            )}
                          >
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`material-quantity-${index}`}>
                        Qty / Unit
                      </label>

                      <input
                        id={`material-quantity-${index}`}
                        type="number"
                        min="0.001"
                        step="any"
                        value={component.quantityPerUnit}
                        onChange={(event) =>
                          updateComponent(
                            index,
                            "quantityPerUnit",
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => removeComponent(index)}
                      disabled={components.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {rawMaterials.length === 0 && (
                  <p>Add inventory materials before creating a BOM.</p>
                )}
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-btn"
                  disabled={
                    availableFinishedProducts.length === 0 ||
                    rawMaterials.length === 0
                  }
                >
                  {editingBomId ? "Update BOM" : "Save BOM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {boms.length === 0 && (
        <div className="pg-empty">No Bills of Materials have been created yet.</div>
      )}

      <div className="bm-grid">
        {boms.map((bom) => (
          <BomCard
            key={bom.id}
            bom={bom}
            products={products}
            onEdit={openForm}
          />
        ))}
      </div>
    </section>
  );
};

export default Bom;