import React from "react";
import * as XLSX from "xlsx";

const GST_RATE = 0.18; // 18% GST

const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const COMPANY = {
  name: "StockPro Industries Pvt. Ltd.",
  address: "123, Industrial Area, Phase 2",
  city: "Pune, Maharashtra - 411001",
  gstin: "27AABCU9603R1ZX",
  phone: "+91 98765 43210",
  email: "billing@stockpro.com",
};

export const generateInvoicePDF = (order, product) => {
  const invoiceNo = `INV-${order.id}`;
  const date = new Date().toLocaleDateString("en-IN");
  const unitPrice = Number(product?.price || 0);
  const qty = Number(order.quantity || 0);
  const subtotal = unitPrice * qty;
  const cgst = subtotal * (GST_RATE / 2);
  const sgst = subtotal * (GST_RATE / 2);
  const total = subtotal + cgst + sgst;

  const ws = XLSX.utils.aoa_to_sheet([
    ["TAX INVOICE"],
    [],
    ["Company:", COMPANY.name],
    ["Address:", COMPANY.address],
    ["City:", COMPANY.city],
    ["GSTIN:", COMPANY.gstin],
    ["Phone:", COMPANY.phone],
    ["Email:", COMPANY.email],
    [],
    ["Invoice No:", invoiceNo, "Date:", date],
    ["Bill To:", order.customerName],
    ["Order ID:", order.id],
    [],
    ["#", "Description", "HSN/SAC", "Qty", "Unit Price", "Amount"],
    [1, product?.name || order.productName, "9988", qty, rupee(unitPrice), rupee(subtotal)],
    [],
    ["", "", "", "", "Subtotal:", rupee(subtotal)],
    ["", "", "", "", `CGST (${GST_RATE * 50}%):`, rupee(cgst)],
    ["", "", "", "", `SGST (${GST_RATE * 50}%):`, rupee(sgst)],
    ["", "", "", "", "Total:", rupee(total)],
    [],
    ["Terms & Conditions:"],
    ["1. Payment due within 30 days of invoice date."],
    ["2. Goods once sold will not be taken back."],
    ["3. Subject to Pune jurisdiction."],
    [],
    ["Thank you for your business!"],
  ]);

  ws["!cols"] = [
    { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 8 },
    { wch: 15 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");
  XLSX.writeFile(wb, `${invoiceNo}.xlsx`);
};

const InvoiceModal = ({ order, product, onClose }) => {
  const invoiceNo = `INV-${order.id}`;
  const date = new Date().toLocaleDateString("en-IN");
  const unitPrice = Number(product?.price || 0);
  const qty = Number(order.quantity || 0);
  const subtotal = unitPrice * qty;
  const cgst = subtotal * (GST_RATE / 2);
  const sgst = subtotal * (GST_RATE / 2);
  const total = subtotal + cgst + sgst;

  return (
    <div className="inv-overlay">
      <div className="inv-modal">
        <div className="inv-modal-header">
          <h2>Tax Invoice Preview</h2>
          <div className="inv-modal-actions">
            <button
              className="inv-download-btn"
              onClick={() => generateInvoicePDF(order, product)}
            >
              ⬇ Download Excel Invoice
            </button>
            <button className="inv-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="inv-paper">
          <div className="inv-paper-header">
            <div className="inv-company">
              <h1>{COMPANY.name}</h1>
              <p>{COMPANY.address}</p>
              <p>{COMPANY.city}</p>
              <p>GSTIN: {COMPANY.gstin}</p>
              <p>{COMPANY.phone} | {COMPANY.email}</p>
            </div>
            <div className="inv-title-box">
              <h2>TAX INVOICE</h2>
              <table>
                <tbody>
                  <tr><td>Invoice No</td><td><b>{invoiceNo}</b></td></tr>
                  <tr><td>Date</td><td><b>{date}</b></td></tr>
                  <tr><td>Order ID</td><td><b>{order.id}</b></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="inv-bill-to">
            <h3>Bill To:</h3>
            <p><b>{order.customerName}</b></p>
          </div>

          <table className="inv-items">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{product?.name || order.productName}</td>
                <td>9988</td>
                <td>{qty}</td>
                <td>{rupee(unitPrice)}</td>
                <td>{rupee(subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-totals-inner">
              <div className="inv-total-row">
                <span>Subtotal</span>
                <span>{rupee(subtotal)}</span>
              </div>
              <div className="inv-total-row">
                <span>CGST ({GST_RATE * 50}%)</span>
                <span>{rupee(cgst)}</span>
              </div>
              <div className="inv-total-row">
                <span>SGST ({GST_RATE * 50}%)</span>
                <span>{rupee(sgst)}</span>
              </div>
              <div className="inv-total-row total">
                <span>Total</span>
                <span>{rupee(total)}</span>
              </div>
            </div>
          </div>

          <div className="inv-terms">
            <h4>Terms & Conditions:</h4>
            <ol>
              <li>Payment due within 30 days of invoice date.</li>
              <li>Goods once sold will not be taken back.</li>
              <li>Subject to Pune jurisdiction.</li>
            </ol>
            <p className="inv-thanks">Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;