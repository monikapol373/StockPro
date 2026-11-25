import React, { useContext, useState, useRef } from "react";
import InventoryContext from "../context/InventoryContext";
import BomContext from "../context/BomContext";
import OrdersContext from "../context/OrdersContext";
import ProductionContext from "../context/ProductionContext";
import CustomerOrdersContext from "../context/CustomerOrdersContext";
import { getStockStatus, getDefaultMinStock } from "../utils/stock";
import { getOrderStatus } from "../utils/orders";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import ExcelImport from "../components/ExcelImport";
import { useRoleGuard } from "../hooks/useRoleGuard";
import { useAuditLog } from "../context/AuditLogContext";

const CATEGORIES = [
  "Raw Material",
  "Hardware",
  "Safety",
  "Spare Parts",
  "Finished Goods",
];

const UNITS = [
  "Pieces",
  "Boxes",
  "Sheets",
  "Rolls",
  "Kg",
  "Litres",
  "Units",
];

const emptyForm = {
  name: "",
  category: "Raw Material",
  quantity: "",
  unit: "Pieces",
  price: "",
  minStock: "",
};

const emptyStock = {
  type: "IN",
  quantity: "",
  reason: "",
};

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const parseCSVLine = (line) => {
  const values = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
};

const Inventory = () => {
  const {
    products = [],
    setProducts,
    recordMovement,
  } = useContext(InventoryContext);

  const { boms = [] } = useContext(BomContext);
  const { orders = [] } = useContext(OrdersContext);
  const { productions = [] } = useContext(ProductionContext);
  const { customerOrders = [] } = useContext(CustomerOrdersContext);
  const { canEdit } = useRoleGuard();
  const { addLog } = useAuditLog();

  const toast = useToast();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [stockProduct, setStockProduct] = useState(null);
  const [stockForm, setStockForm] = useState(emptyStock);
  const [stockError, setStockError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextProductId = () => {
    const max = products.reduce((m, p) => {
      const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `PRD-${String(max + 1).padStart(3, "0")}`;
  };

  const handleExportCSV = () => {
    const headers = ["id", "name", "category", "quantity", "unit", "price", "minStock"];
    const rows = products.map((product) =>
      headers.map((header) => escapeCsvValue(product[header])).join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stockpro-inventory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Inventory CSV exported successfully.");
  };

  const handleImportCSV = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = String(reader.result ?? "").replace(/^\uFEFF/, "");
        const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) {
          toast.error("CSV file contains no product rows.");
          return;
        }
        const headers = parseCSVLine(lines[0]).map((header) => header.trim().toLowerCase());
        const requiredHeaders = ["name", "category", "quantity", "unit", "price"];
        const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
        if (missingHeaders.length > 0) {
          toast.error(`Missing columns: ${missingHeaders.join(", ")}`);
          return;
        }
        const existingNames = new Set(
          products.map((product) => String(product.name).trim().toLowerCase())
        );
        const importedProducts = [];
        const errors = [];
        let maxId = products.reduce((max, product) => {
          const number = parseInt(String(product.id).replace(/\D/g, ""), 10);
          return Number.isNaN(number) ? max : Math.max(max, number);
        }, 0);

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: incorrect number of columns`);
            continue;
          }
          const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
          const name = row.name?.trim();
          const categoryName = row.category?.trim();
          const unit = row.unit?.trim();
          const quantity = Number(row.quantity);
          const price = Number(row.price);
          const minStock =
            row.minstock === undefined || row.minstock === ""
              ? undefined
              : Number(row.minstock);

          if (!name || !categoryName || !unit) {
            errors.push(`Row ${i + 1}: name, category and unit are required`);
            continue;
          }
          if (!CATEGORIES.includes(categoryName)) {
            errors.push(`Row ${i + 1}: invalid category "${categoryName}"`);
            continue;
          }
          if (!UNITS.includes(unit)) {
            errors.push(`Row ${i + 1}: invalid unit "${unit}"`);
            continue;
          }
          if (
            !Number.isInteger(quantity) || quantity < 0 ||
            !Number.isFinite(price) || price < 0 ||
            (minStock !== undefined && (!Number.isInteger(minStock) || minStock < 0))
          ) {
            errors.push(`Row ${i + 1}: invalid quantity, price or minStock`);
            continue;
          }
          const normalizedName = name.toLowerCase();
          const duplicateInFile = importedProducts.some(
            (product) => product.name.trim().toLowerCase() === normalizedName
          );
          if (existingNames.has(normalizedName) || duplicateInFile) {
            errors.push(`Row ${i + 1}: "${name}" already exists; skipped`);
            continue;
          }
          maxId++;
          const newProduct = {
            id: `PRD-${String(maxId).padStart(3, "0")}`,
            name, category: categoryName, quantity, unit, price, minStock,
          };
          newProduct.status = getStockStatus(newProduct);
          importedProducts.push(newProduct);
        }

        if (importedProducts.length > 0) {
          setProducts((prev) => [...prev, ...importedProducts]);
          toast.success(`${importedProducts.length} product(s) imported successfully.`);
        }
        if (errors.length > 0) {
          console.warn("CSV import errors:", errors);
          toast.error(`${errors.length} row(s) skipped. Check browser console for details.`);
        }
        if (importedProducts.length === 0 && errors.length === 0) {
          toast.info("No new products to import.");
        }
      } catch (error) {
        console.error("CSV import failed:", error);
        toast.error("Could not read the CSV file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the selected file.");
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleExcelImport = (newProducts) => {
    let maxId = products.reduce((m, p) => {
      const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const withIds = newProducts.map((p) => ({
      ...p,
      id: `PRD-${String(++maxId).padStart(3, "0")}`,
      status: getStockStatus(p),
    }));
    setProducts([...products, ...withIds]);
    toast.success(`${withIds.length} products imported from Excel successfully.`);
    addLog({
      action: "IMPORT",
      module: "Inventory",
      details: `Imported ${withIds.length} products from Excel`,
    });
  };

  const openAddModal = () => {
  if (!canEdit()) return;
  setEditingProduct(null);
  setFormData(emptyForm);
  setFormError("");
  setNotice("");
  setShowModal(true);
};

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const price = Number(formData.price);
    const qty = Number(formData.quantity);
    const minStockRaw = formData.minStock === "" ? undefined : Number(formData.minStock);

    if (!name) { setFormError("Product name is required."); return; }
    if (minStockRaw !== undefined && (!Number.isInteger(minStockRaw) || minStockRaw < 0)) {
      setFormError("Low stock alert level must be a whole number, 0 or more."); return;
    }
    if (!Number.isFinite(price) || price < 0) { setFormError("Price must be 0 or more."); return; }
    if (!editingProduct && (!Number.isInteger(qty) || qty < 0)) {
      setFormError("Quantity must be a whole number, 0 or more."); return;
    }
    const duplicate = products.some(
      (product) => product.name.toLowerCase() === name.toLowerCase() && product.id !== editingProduct?.id
    );
    if (duplicate) { setFormError("A product with this name already exists."); return; }

    if (editingProduct) {
      setProducts(products.map((product) =>
        product.id === editingProduct.id
          ? { ...product, name, category: formData.category, unit: formData.unit, price, minStock: minStockRaw, status: getStockStatus({ ...product, minStock: minStockRaw }) }
          : product
      ));
    } else {
      const newProduct = {
        id: nextProductId(), name, category: formData.category,
        quantity: qty, unit: formData.unit, price, minStock: minStockRaw,
      };
      newProduct.status = getStockStatus(newProduct);
      setProducts([...products, newProduct]);
    }
    toast.success(editingProduct ? `${name} updated` : `${name} added to inventory`);
     addLog({
      action: editingProduct ? "UPDATE" : "CREATE",
      module: "Inventory",
      details: editingProduct ? `Updated product: ${name}` : `Added product: ${name}`,
    });
  };
    handleCloseModal();
    

  const handleEdit = (product) => {
  if (!canEdit()) return;
  setEditingProduct(product);
  setFormData({
    name: product.name, category: product.category, quantity: product.quantity,
    unit: product.unit, price: product.price, minStock: product.minStock ?? "",
  });
  setFormError("");
  setNotice("");
  setShowModal(true);
};

  const requestDelete = (product) => {
    if (!canEdit()) return;
    const reasons = [];
    const usedInBoms = boms.filter(
      (bom) => bom.finishedProductId === product.id ||
        (bom.components ?? []).some((component) => component.productId === product.id)
    );
    if (usedInBoms.length > 0) {
      reasons.push(`used in BOM: ${usedInBoms.map((bom) => bom.finishedProductName).join(", ")}`);
    }
    const openPOs = orders.filter(
      (order) => order.productId === product.id && getOrderStatus(order) !== "Received"
    );
    if (openPOs.length > 0) {
      reasons.push(`open purchase orders: ${openPOs.map((order) => order.id).join(", ")}`);
    }
    const pendingCOs = customerOrders.filter(
      (order) => order.productId === product.id && order.status === "Pending"
    );
    if (pendingCOs.length > 0) {
      reasons.push(`pending customer orders: ${pendingCOs.map((order) => order.id).join(", ")}`);
    }
    const activeProductions = productions.filter(
      (production) => production.status !== "Completed" &&
        boms.some((bom) => bom.id === production.bomId && bom.finishedProductId === product.id)
    );
    if (activeProductions.length > 0) {
      reasons.push(`active production orders: ${activeProductions.map((production) => production.id).join(", ")}`);
    }
    if (reasons.length > 0) {
      setNotice(`"${product.name}" cannot be deleted: ${reasons.join("; ")}.`);
      toast.error(`${product.name} is in use and cannot be deleted`);
      return;
    }
    setNotice("");
    setDeleteTarget(product);
  };

  const confirmDelete = () => {
  setProducts(products.filter((product) => product.id !== deleteTarget.id));
  toast.success(`${deleteTarget.name} deleted`);
  addLog({
    action: "DELETE",
    module: "Inventory",
    details: `Deleted product: ${deleteTarget.name}`,
  });
  setDeleteTarget(null);
};

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(query) || String(product.id).toLowerCase().includes(query);
    const matchesCategory = category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const reorderSuggestions = products
    .map((product) => {
      const reorderLevel = Number(product.minStock ?? getDefaultMinStock());
      const currentQuantity = Number(product.quantity) || 0;
      const suggestedQuantity = Math.max(0, reorderLevel * 2 - currentQuantity);
      return { ...product, reorderLevel, currentQuantity, suggestedQuantity };
    })
    .filter((product) => product.reorderLevel > 0 && product.currentQuantity <= product.reorderLevel)
    .sort((a, b) => a.currentQuantity - b.currentQuantity);

  const openStockModal = (product) => {
  if (!canEdit()) return;
  setStockProduct(product);
  setStockForm(emptyStock);
  setStockError("");
  setNotice("");
};

  const closeStockModal = () => {
    setStockProduct(null);
    setStockError("");
  };

  const handleStockChange = (e) => {
    setStockForm({ ...stockForm, [e.target.name]: e.target.value });
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    const qty = Number(stockForm.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      setStockError("Quantity must be a whole number, 0 or more.");
      return;
    }
    const result = recordMovement({
      productId: stockProduct.id,
      type: stockForm.type,
      quantity: qty,
      reason: stockForm.reason,
    });
    if (!result.ok) { setStockError(result.error); return; }
    toast.success(`Stock updated for ${stockProduct.name}`);
    closeStockModal();
  };

  return (
    <div className="inventory-page">
      <InventoryView
        products={products}
        filtered={filteredProducts}
        suggestions={reorderSuggestions}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        notice={notice}
        clearNotice={() => setNotice("")}
        onExport={handleExportCSV}
        onImportClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onImport={handleImportCSV}
        onShowExcelImport={() => setShowImport(true)}
        onAdd={openAddModal}
        onStock={openStockModal}
        onEdit={handleEdit}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        message={
          deleteTarget?.quantity > 0
            ? `"${deleteTarget?.name}" still has ${deleteTarget?.quantity} ${deleteTarget?.unit} in stock. Deleting it removes that stock from your records. This cannot be undone.`
            : `"${deleteTarget?.name}" will be removed from inventory. This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showImport && (
        <ExcelImport
          onImport={handleExcelImport}
          onClose={() => setShowImport(false)}
        />
      )}

            {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <p>{editingProduct ? "Update product details." : "Add a new item to your inventory."}</p>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" name="name" placeholder="Enter product name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity {editingProduct && "(change via 🔄 Update Stock)"}</label>
                  <input type="number" name="quantity" placeholder="Enter quantity" value={formData.quantity} onChange={handleChange} min="0" step="1" required disabled={!!editingProduct} />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange}>
                    {UNITS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Price (₹)</label>
                  <input type="number" name="price" placeholder="Enter price" value={formData.price} onChange={handleChange} min="0" step="any" required />
                </div>
                <div className="form-group full-width">
                  <label>Low stock alert at (optional, default {getDefaultMinStock()})</label>
                  <input type="number" name="minStock" placeholder="Leave empty to use default" value={formData.minStock} onChange={handleChange} min="0" step="1" />
                </div>
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="add-btn">{editingProduct ? "Update Product" : "Add Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Update Stock</h2>
                <p>{stockProduct.name}: currently {stockProduct.quantity} {stockProduct.unit}</p>
              </div>
              <button className="close-btn" onClick={closeStockModal}>✕</button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={stockForm.type} onChange={handleStockChange}>
                    <option value="IN">Stock In (add)</option>
                    <option value="OUT">Stock Out (remove)</option>
                    <option value="ADJUST">Adjustment (set counted qty)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{stockForm.type === "ADJUST" ? "Counted quantity" : "Quantity"}</label>
                  <input type="number" name="quantity" value={stockForm.quantity} onChange={handleStockChange} min="0" step="1" required />
                </div>
                <div className="form-group full-width">
                  <label>Reason</label>
                  <input type="text" name="reason" value={stockForm.reason} onChange={handleStockChange} placeholder="e.g. Received from supplier" />
                </div>
              </div>
              {stockError && <p className="form-error">{stockError}</p>}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeStockModal}>Cancel</button>
                <button type="submit" className="add-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

const TONE = { "In Stock": "good", "Low Stock": "warn", "Out of Stock": "bad" };
const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const compact = (n) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : rupee(Math.round(n));

const LevelBar = ({ p }) => {
  const min = Number(p.minStock ?? getDefaultMinStock());
  const target = Math.max(min * 3, 1);
  const pct = Math.min(100, ((Number(p.quantity) || 0) / target) * 100);
  return (
    <div className="inv-bar" title={`Minimum level: ${min} ${p.unit}`}>
      <i className={`t-${TONE[getStockStatus(p)] || "good"}`} style={{ width: `${pct}%` }} />
      <s style={{ left: `${Math.min(100, (min / target) * 100)}%` }} />
    </div>
  );
};

const InventoryView = ({
  products, filtered, suggestions, search, setSearch, category, setCategory,
  notice, clearNotice, onExport, onImportClick, fileInputRef, onImport,
  onShowExcelImport, onAdd, onStock, onEdit, onDelete,
}) => {
  const [view, setView] = useState("grid");

  const value = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const out = products.filter((p) => getStockStatus(p) === "Out of Stock").length;
  const low = products.filter((p) => getStockStatus(p) === "Low Stock").length;
  const countOf = (c) => (c === "All" ? products.length : products.filter((p) => p.category === c).length);
  const hue = (c) => Math.max(CATEGORIES.indexOf(c), 0);

  const stats = [
    { l: "Total Products", v: products.length, c: "#8b5cf6", s: `${CATEGORIES.length} categories` },
    { l: "Stock Value", v: compact(value), c: "#22d3ee", s: "across all items" },
    { l: "Low Stock", v: low, c: "#fb923c", s: "need reorder soon" },
    { l: "Out of Stock", v: out, c: "#f43f5e", s: "unavailable now" },
  ];

  return (
    <>
      <header className="inv-head">
        <div>
          <h1>Inventory</h1>
          <p>Every product, every level, in one view.</p>
        </div>
        <div className="inv-head-actions">
          <button type="button" className="inv-ghost" onClick={onExport}>Export CSV</button>
          <button type="button" className="inv-ghost" onClick={onImportClick}>Import CSV</button>
          <button type="button" className="inv-ghost" onClick={onShowExcelImport}>Import Excel</button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onImport} hidden />
          <button type="button" className="inv-primary" onClick={onAdd}>+ Add Product</button>
        </div>
      </header>

      {notice && (
        <div className="inv-notice">
          <span>{notice}</span>
          <button type="button" onClick={clearNotice} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className="inv-stats">
        {stats.map((s) => (
          <div className="inv-stat" key={s.l} style={{ "--c": s.c }}>
            <small>{s.l}</small>
            <strong>{s.v}</strong>
            <span>{s.s}</span>
          </div>
        ))}
      </div>

      <section className="inv-reorder">
        <div className="inv-sec-h">
          <div>
            <h2>Smart Reorder</h2>
            <p>Items at or below their minimum level. Suggested qty restores stock to 2× the minimum.</p>
          </div>
          <span className={`inv-pill ${suggestions.length ? "warn" : "good"}`}>
            {suggestions.length ? `${suggestions.length} need attention` : "All healthy"}
          </span>
        </div>
        {suggestions.length > 0 && (
          <div className="inv-rail">
            {suggestions.map((p) => (
              <div className="inv-rcard" key={`r-${p.id}`}>
                <b>{p.name}</b>
                <small>{p.id} · {p.category}</small>
                <div className="inv-rnums">
                  <span>Now<strong className="bad">{p.currentQuantity}</strong></span>
                  <span>Min<strong>{p.reorderLevel}</strong></span>
                  <span>Order<strong className="good">+{p.suggestedQuantity}</strong></span>
                </div>
                <button type="button" onClick={() => onStock(p)}>Update Stock</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="inv-tools">
        <div className="inv-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="text" placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="inv-chips">
          {["All", ...CATEGORIES].map((c) => (
            <button type="button" key={c} className={category === c ? "on" : ""} onClick={() => setCategory(c)}>
              {c}<em>{countOf(c)}</em>
            </button>
          ))}
        </div>
        <div className="inv-toggle">
          <button type="button" className={view === "grid" ? "on" : ""} onClick={() => setView("grid")}>Cards</button>
          <button type="button" className={view === "table" ? "on" : ""} onClick={() => setView("table")}>Table</button>
        </div>
      </div>

      {filtered.length === 0 && <div className="inv-empty">No products match your search.</div>}

      {view === "grid" && filtered.length > 0 && (
        <div className="inv-grid">
          {filtered.map((p) => {
            const st = getStockStatus(p);
            return (
              <article className="inv-card" key={p.id}>
                <div className="inv-card-top">
                  <span className={`inv-tile h${hue(p.category)}`}>{p.name.charAt(0).toUpperCase()}</span>
                  <div className="inv-card-name">
                    <b>{p.name}</b>
                    <small>{p.id} · {p.category}</small>
                  </div>
                </div>
                <div className="inv-qty">
                  <strong>{p.quantity}</strong><span>{p.unit}</span>
                  <span className={`inv-pill ${TONE[st] || "good"}`}>{st}</span>
                </div>
                <LevelBar p={p} />
                <div className="inv-meta">
                  <span>Price<b>{rupee(p.price)}</b></span>
                  <span>Value<b>{rupee(p.quantity * p.price)}</b></span>
                </div>
                <div className="inv-actions">
                  <button type="button" onClick={() => onStock(p)}>Update Stock</button>
                  <button type="button" onClick={() => onEdit(p)}>Edit</button>
                  <button type="button" className="del" onClick={() => onDelete(p)}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className="inv-tablewrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Stock level</th>
                <th>Qty</th><th>Price</th><th>Value</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = getStockStatus(p);
                return (
                  <tr key={p.id}>
                    <td><b>{p.name}</b><small>{p.id}</small></td>
                    <td>{p.category}</td>
                    <td style={{ width: 150 }}><LevelBar p={p} /></td>
                    <td>{p.quantity} {p.unit}</td>
                    <td>{rupee(p.price)}</td>
                    <td>{rupee(p.quantity * p.price)}</td>
                    <td><span className={`inv-pill ${TONE[st] || "good"}`}>{st}</span></td>
                    <td className="inv-row-actions">
                      <button type="button" onClick={() => onStock(p)}>Stock</button>
                      <button type="button" onClick={() => onEdit(p)}>Edit</button>
                      <button type="button" className="del" onClick={() => onDelete(p)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};