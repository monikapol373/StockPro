import React, { useState, useRef } from "react";
import QRCode from "qrcode";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return sessionStorage.getItem("stockpro:token") || "";
}

const PaymentQR = ({ order, product, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [paid, setPaid] = useState(false);
  const canvasRef = useRef(null);

  const totalAmount = (Number(product?.price) || 0) * Number(order?.quantity || 1);

  const handleGenerateQR = () => {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      setError("Session expired. Please logout and login again.");
      setLoading(false);
      return;
    }

    fetch(`${API}/payment/create-qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        orderId: order.id,
        customerName: order.customerName,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setLoading(false);
        if (data.error) { setError(data.error); return; }

        const upiString = `upi://pay?pa=your-polmonika7@okhdfcbank&pn=StockPro&am=${totalAmount}&cu=INR&tn=Order ${order.id}`;

        QRCode.toCanvas(canvasRef.current, upiString, {
          width: 220,
          margin: 2,
          color: { dark: "#1e1b4b", light: "#ffffff" },
        }, (err) => {
          if (err) {
            setError("Failed to generate QR code.");
            return;
          }
          setQrGenerated(true);
        });
      })
      .catch((err) => {
        setLoading(false);
        setError("Payment request failed: " + err.message);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420, textAlign: "center" }}>
        <div className="modal-header">
          <div>
            <h2>💳 Customer Payment</h2>
            <p>{order.customerName} — {order.productName}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6d28d9", marginBottom: "0.5rem" }}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            {order.quantity} × ₹{Number(product?.price || 0).toLocaleString("en-IN")}
          </p>

          {paid ? (
            <div style={{ color: "#16a34a", fontSize: "1.2rem", fontWeight: 600 }}>
              ✅ Payment Received!<br />
              <small style={{ color: "#6b7280", fontWeight: 400 }}>Order has been marked as paid.</small>
            </div>
          ) : (
            <>
              {error && <p className="form-error">{error}</p>}

              <canvas
                ref={canvasRef}
                style={{
                  display: qrGenerated ? "block" : "none",
                  margin: "0 auto 1rem",
                  borderRadius: 12,
                  border: "2px solid #6d28d9",
                }}
              />

              {qrGenerated && (
                <>
                  <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Customer can scan using PhonePe / GPay / Paytm
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "1rem" }}>
                    QR code is valid for 15 minutes
                  </p>
                  <button
                    className="pg-primary"
                    style={{ width: "100%", padding: "0.75rem", marginBottom: "0.5rem" }}
                    onClick={() => setPaid(true)}
                  >
                    ✅ Payment Received — Mark as Paid
                  </button>
                  <button
                    className="pg-ghost"
                    style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem" }}
                    onClick={() => { setQrGenerated(false); }}
                  >
                    🔄 Regenerate QR
                  </button>
                </>
              )}

              {!qrGenerated && (
                <>
                  <button
                    className="pg-primary"
                    style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
                    onClick={handleGenerateQR}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "🔳 Generate Payment QR"}
                  </button>
                  <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                    Customer will scan and pay using any UPI app
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;