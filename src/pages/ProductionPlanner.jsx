import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InventoryContext from "../context/InventoryContext";
import BomContext from "../context/BomContext";
import { calculateMaxProducible } from "../utils/bom";

const ProductionPlanner = () => {
  const { products = [] } = useContext(InventoryContext);
  const { boms = [] } = useContext(BomContext);
  const navigate = useNavigate();

  const [bomId, setBomId] = useState("");
  const [targetQty, setTargetQty] = useState("1");

  const selectedBom = boms.find((bom) => bom.id === bomId);
  const quantity = Number(targetQty);
  const validQuantity = Number.isInteger(quantity) && quantity > 0;

  const simulation = useMemo(() => {
    if (!selectedBom || !Array.isArray(selectedBom.components)) {
      return null;
    }

    const maxResult = calculateMaxProducible(selectedBom, products);

    const materials = selectedBom.components.map((component) => {
      const product = products.find(
        (item) => item.id === component.productId
      );

      const perUnit = Number(component.quantityPerUnit);
      const required = perUnit * quantity;
      const available = Number(product?.quantity ?? 0);
      const shortage = Math.max(0, required - available);

      return {
        id: component.productId,
        name: product?.name || component.productId,
        unit: product?.unit || "Units",
        perUnit,
        required,
        available,
        shortage,
        sufficient:
          Boolean(product) &&
          Number.isFinite(required) &&
          required >= 0 &&
          available >= required,
      };
    });

    return {
      maxUnits: maxResult.maxUnits,
      materials,
      canProduce:
        validQuantity &&
        materials.length > 0 &&
        materials.every((material) => material.sufficient),
    };
  }, [selectedBom, products, quantity, validQuantity]);

  const formatNumber = (value) =>
    Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 3,
    });

  const createPurchaseOrder = (material) => {
    const shortageQuantity = Math.ceil(material.shortage);

    if (shortageQuantity <= 0) return;

    navigate("/orders", {
      state: {
        purchaseOrderDraft: {
          productId: material.id,
          quantity: shortageQuantity,
        },
      },
    });
  };

  const createProductionOrder = () => {
    if (!selectedBom || !simulation?.canProduce) return;

    navigate("/production", {
      state: {
        productionOrderDraft: {
          bomId: selectedBom.id,
          targetQty: quantity,
        },
      },
    });
  };

  return (
    <section className="pl pg">
      <header className="pg-head">
        <div>
          <h1>Production Planner</h1>
          <p>Simulate production requirements before creating an order.</p>
        </div>
      </header>

      <div className="pl-layout">
        <aside className="pl-panel">
          <h2>What-if simulator</h2>
          <p>Choose a finished product and planned production quantity.</p>

          <label htmlFor="planner-bom">Finished product / BOM</label>
          <select
            id="planner-bom"
            value={bomId}
            onChange={(event) => setBomId(event.target.value)}
          >
            <option value="">Select a product</option>
            {boms.map((bom) => (
              <option key={bom.id} value={bom.id}>
                {bom.finishedProductName}
              </option>
            ))}
          </select>

          <label htmlFor="planner-quantity">Planned production quantity</label>
          <input
            id="planner-quantity"
            type="number"
            min="1"
            step="1"
            value={targetQty}
            onChange={(event) => setTargetQty(event.target.value)}
            placeholder="Enter quantity"
          />
          <div className="pl-quick">
            {[1, 10, 50, 100].map((n) => (
              <button type="button" key={n} onClick={() => setTargetQty(String(n))}>{n}</button>
            ))}
          </div>

          <small className="pl-note">
            Simulation only. Stock is not deducted and no order is created until you submit or
            start the relevant order.
          </small>
        </aside>

        <div className="pl-result">
          {!boms.length && (
            <div className="pg-empty">No Bill of Materials found. Create a BOM first.</div>
          )}
          {boms.length > 0 && !selectedBom && (
            <div className="pg-empty">Select a finished product to see its material requirements.</div>
          )}

          {selectedBom && simulation && (
            <>
              <div className={`pl-verdict ${validQuantity ? (simulation.canProduce ? "good" : "bad") : "warn"}`}>
                <div className="pl-verdict-main">
                  <span className="pl-verdict-ic">
                    {validQuantity ? (simulation.canProduce ? "✓" : "!") : "?"}
                  </span>
                  <div>
                    {validQuantity ? (
                      <>
                        <h2>{simulation.canProduce ? "Production is feasible" : "Material shortage"}</h2>
                        <p role="status">
                          {simulation.canProduce
                            ? "Sufficient stock for the planned quantity."
                            : "Insufficient stock. Check the shortages below."}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2>Enter a quantity</h2>
                        <p>Enter a whole number greater than zero.</p>
                      </>
                    )}
                  </div>
                </div>

                {validQuantity && (
                  <div className="pl-nums">
                    <div><small>Planned output</small><b>{formatNumber(quantity)}</b></div>
                    <div><small>Max producible now</small><b>{formatNumber(simulation.maxUnits)}</b></div>
                  </div>
                )}

                {simulation.canProduce && (
                  <button type="button" className="pg-primary" onClick={createProductionOrder}>
                    + Create Production Order
                  </button>
                )}
              </div>

              <div className="pl-mats">
                {simulation.materials.length === 0 && (
                  <div className="pg-empty">No material components are configured in this BOM.</div>
                )}
                {simulation.materials.map((material) => {
                  const pct = material.required > 0 ? Math.min(100, (material.available / material.required) * 100) : 100;
                  return (
                    <div className="pl-mat" key={material.id}>
                      <div className="pl-mat-name">
                        <b>{material.name}</b>
                        <small>{formatNumber(material.perUnit)} {material.unit} per finished unit</small>
                      </div>
                      <div className="pl-mat-cover">
                        <div className="pl-mat-t">
                          <span>Available <b>{formatNumber(material.available)}</b></span>
                          <span>Required <b>{formatNumber(material.required)}</b></span>
                        </div>
                        <div className="pl-bar">
                          <i className={material.sufficient ? "good" : "bad"} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="pl-mat-res">
                        <span className={`pg-pill ${material.sufficient ? "good" : "bad"}`}>
                          {material.sufficient ? "Available" : "Shortage"}
                        </span>
                        {material.shortage > 0 && (
                          <small>Short by {formatNumber(material.shortage)} {material.unit}</small>
                        )}
                      </div>
                      <div className="pl-mat-act">
                        {validQuantity && material.shortage > 0 && (
                          <button type="button" className="pg-primary sm" onClick={() => createPurchaseOrder(material)}>
                            Create PO
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductionPlanner;