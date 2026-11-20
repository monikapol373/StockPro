import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

const REQUIRED_COLS = ["name", "category", "quantity", "unit", "price", "minStock"];

const CATEGORIES = [
  "Raw Material", "Hardware", "Safety", "Spare Parts", "Finished Goods",
];

const UNITS = ["Pieces", "Boxes", "Sheets", "Rolls", "Kg", "Litres", "Units"];

const normalize = (str) => String(str ?? "").trim();

const validateRow = (row, i) => {
  const errors = [];
  if (!normalize(row.name)) errors.push(`Row ${i}: name is required`);
  if (!CATEGORIES.includes(normalize(row.category)))
    errors.push(`Row ${i}: invalid category "${row.category}"`);
  if (isNaN(Number(row.quantity)) || Number(row.quantity) < 0)
    errors.push(`Row ${i}: invalid quantity`);
  if (!UNITS.includes(normalize(row.unit)))
    errors.push(`Row ${i}: invalid unit "${row.unit}"`);
  if (isNaN(Number(row.price)) || Number(row.price) < 0)
    errors.push(`Row ${i}: invalid price`);
  return errors;
};

const downloadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["name", "category", "quantity", "unit", "price", "minStock"],
    ["Steel Sheets", "Raw Material", 100, "Sheets", 250, 20],
    ["Safety Gloves", "Safety", 50, "Pieces", 45, 10],
    ["Copper Wire", "Raw Material", 200, "Rolls", 180, 30],
  ]);
  ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "stockpro-import-template.xlsx");
};

const ExcelImport = ({ onImport, onClose }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload"); // upload | preview | done

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rows.length === 0) {
          setErrors(["File is empty or has no data rows."]);
          return;
        }

        // Check required columns
        const cols = Object.keys(rows[0]).map((c) => c.toLowerCase().trim());
        const missing = REQUIRED_COLS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setErrors([`Missing columns: ${missing.join(", ")}`]);
          return;
        }

        // Normalize keys
        const normalized = rows.map((row) => {
          const r = {};
          Object.keys(row).forEach((k) => { r[k.toLowerCase().trim()] = row[k]; });
          return r;
        });

        // Validate
        const allErrors = normalized.flatMap((row, i) => validateRow(row, i + 2));
        setErrors(allErrors);
        setPreview(normalized);
        setStep("preview");
      } catch {
        setErrors(["Could not read file. Please use a valid .xlsx file."]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (!preview || errors.length > 0) return;
    setLoading(true);
    const products = preview.map((row) => ({
      name: normalize(row.name),
      category: normalize(row.category),
      quantity: Number(row.quantity),
      unit: normalize(row.unit),
      price: Number(row.price),
      minStock: Number(row.minstock ?? row.minStock ?? 10),
    }));
    onImport(products);
    setStep("done");
    setLoading(false);
  };

  return (
    <div className="xi-overlay">
      <div className="xi-modal">
        <div className="xi-header">
          <h2>Import Products from Excel</h2>
          <button className="xi-close" onClick={onClose}>✕</button>
        </div>

        {step === "upload" && (
          <div className="xi-body">
            <div className="xi-info">
              <p>Upload an <strong>.xlsx</strong> file with the following columns:</p>
              <code>name, category, quantity, unit, price, minStock</code>
              <p className="xi-hint">Valid categories: {CATEGORIES.join(", ")}</p>
              <p className="xi-hint">Valid units: {UNITS.join(", ")}</p>
            </div>

            <button className="xi-btn-template" onClick={downloadTemplate}>
              ⬇ Download Template
            </button>

            <div className="xi-upload-area" onClick={() => fileRef.current.click()}>
              <span className="xi-upload-icon">📂</span>
              <p>Click to select .xlsx file</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} hidden />
            </div>

            {errors.length > 0 && (
              <div className="xi-errors">
                {errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="xi-body">
            <p className="xi-preview-title">{preview.length} products ready to import</p>

            {errors.length > 0 && (
              <div className="xi-errors">
                <p><strong>Fix these errors before importing:</strong></p>
                {errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}

            <div className="xi-table-wrap">
              <table className="xi-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Min Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      <td>{row.name}</td>
                      <td>{row.category}</td>
                      <td>{row.quantity}</td>
                      <td>{row.unit}</td>
                      <td>{row.price}</td>
                      <td>{row.minstock ?? row.minStock ?? 10}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="xi-more">...and {preview.length - 10} more rows</p>
              )}
            </div>

            <div className="xi-actions">
              <button className="xi-btn-back" onClick={() => { setStep("upload"); setPreview(null); setErrors([]); fileRef.current.value = ""; }}>
                ← Back
              </button>
              <button className="xi-btn-import" onClick={handleImport} disabled={errors.length > 0 || loading}>
                {loading ? "Importing..." : `Import ${preview.length} Products`}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="xi-body xi-done">
            <span className="xi-done-icon">✅</span>
            <h3>Import Successful!</h3>
            <p>{preview.length} products have been added to your inventory.</p>
            <button className="xi-btn-import" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelImport;