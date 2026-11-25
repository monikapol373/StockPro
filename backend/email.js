import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "StockPro <noreply@stockpro.com>";

let transporter = null;

function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn("[email] EMAIL_USER or EMAIL_PASS not set — skipping email.");
    return { ok: false, reason: "not_configured" };
  }
  try {
    await t.sendMail({ from: EMAIL_FROM, to, subject, html });
    console.log(`[email] Sent: ${subject} → ${to}`);
    return { ok: true };
  } catch (err) {
    console.error("[email] Failed:", err.message);
    return { ok: false, reason: err.message };
  }
}

export function lowStockEmailHtml(products) {
  const rows = products.map((p) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${p.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${p.category}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;color:#f43f5e;font-weight:700;">${p.quantity} ${p.unit}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${p.minStock ?? 10}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:Segoe UI,sans-serif;background:#060d18;color:#e2e8f0;padding:32px;border-radius:16px;max-width:600px;margin:auto;">
      <h1 style="color:#f43f5e;margin-bottom:8px;">⚠️ Low Stock Alert</h1>
      <p style="color:#94a3b8;">The following products are at or below their minimum stock level:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#0a1424;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#0f1d33;">
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Product</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Category</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Current Stock</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Min Level</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/inventory"
        style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
        View Inventory →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:24px;">StockPro · Automated Alert System</p>
    </div>
  `;
}

export function delayedOrderEmailHtml(orders) {
  const rows = orders.map((o) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${o.id}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${o.supplierName || "—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;">${o.productName || "—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #1e3a5f;color:#f59e0b;font-weight:700;">${o.expectedDate || "—"}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:Segoe UI,sans-serif;background:#060d18;color:#e2e8f0;padding:32px;border-radius:16px;max-width:600px;margin:auto;">
      <h1 style="color:#f59e0b;margin-bottom:8px;">🕒 Delayed Orders Alert</h1>
      <p style="color:#94a3b8;">The following purchase orders are overdue:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#0a1424;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#0f1d33;">
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Order ID</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Supplier</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Product</th>
            <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;">Expected Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/orders"
        style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#000;border-radius:8px;text-decoration:none;font-weight:600;">
        View Orders →
      </a>
      <p style="color:#475569;font-size:12px;margin-top:24px;">StockPro · Automated Alert System</p>
    </div>
  `;
}