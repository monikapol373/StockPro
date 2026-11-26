import React, { useState, useRef, useEffect } from "react";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // "success" | "failed" | null
  const [timer, setTimer] = useState(900); // 15 minutes
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  const totalAmount = (Number(product?.price) || 0) * Number(order?.quantity || 1);

  // Timer countdown
  useEffect(() => {
    if (qrGenerated && !paid) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setQrGenerated(false);
            setTimer(900);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [qrGenerated, paid]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleGenerateQR = () => {
    setLoading(true);
    setError("");
    setTimer(900);

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

        const upiString = `upi://pay?pa=polmonika7@okhdfcbank&pn=StockPro&am=${totalAmount}&cu=INR&tn=Order ${order.id}`;

        QRCode.toCanvas(canvasRef.current, upiString, {
          width: 220,
          margin: 2,
          color: { dark: "#1e1b4b", light: "#ffffff" },
        }, (err) => {
          if (err) { setError("Failed to generate QR code."); return; }
          setQrGenerated(true);
        });
      })
      .catch((err) => {
        setLoading(false);
        setError("Payment request failed: " + err.message);
      });
  };

  const handleMarkPaid = () => {
    clearInterval(timerRef.current);
    setPaymentStatus("success");
    setPaid(true);
    setConfirmOpen(false);
  };

  const handleMarkFailed = () => {
    setPaymentStatus("failed");
    setConfirmOpen(false);
    setQrGenerated(false);
    setTimer(900);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440, textAlign: "center" }}>
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

          {/* Payment Success */}
          {paymentStatus === "success" && (
            <div style={{
              background: "linear-gradient(135deg, #064e3b, #065f46)",
              border: "1px solid #34d399",
              borderRadius: 16,
              padding: "1.5rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</div>
              <p style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Payment Successful!
              </p>
              <p style={{ color: "#6ee7b7", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                ₹{totalAmount.toLocaleString("en-IN")} received from {order.customerName}
              </p>
              <p style={{ color: "#a7f3d0", fontSize: "0.8rem" }}>
                Order <strong>{order.id}</strong> has been marked as paid.
              </p>
            </div>
          )}

          {/* Payment Failed */}
          {paymentStatus === "failed" && !qrGenerated && (
            <div style={{
              background: "linear-gradient(135deg, #450a0a, #7f1d1d)",
              border: "1px solid #f87171",
              borderRadius: 16,
              padding: "1.25rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>❌</div>
              <p style={{ color: "#f87171", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Payment Not Completed
              </p>
              <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>
                The payment was not received. Please ask the customer to try again.
              </p>
            </div>
          )}

          {/* Error */}
          {error && <p className="form-error">{error}</p>}

          {/* QR Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              display: qrGenerated ? "block" : "none",
              margin: "0 auto 0.75rem",
              borderRadius: 12,
              border: "2px solid #6d28d9",
            }}
          />

          {/* QR Generated State */}
          {qrGenerated && !confirmOpen && (
            <>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                Customer can scan using PhonePe / GPay / Paytm
              </p>

              {/* Timer */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: timer < 60 ? "#450a0a" : "#1e1b4b",
                border: `1px solid ${timer < 60 ? "#f87171" : "#6d28d9"}`,
                borderRadius: 20,
                padding: "0.3rem 0.9rem",
                marginBottom: "1.25rem",
              }}>
                <span style={{ fontSize: "0.75rem" }}>⏱</span>
                <span style={{ color: timer < 60 ? "#f87171" : "#a78bfa", fontSize: "0.85rem", fontWeight: 600 }}>
                  QR expires in {formatTime(timer)}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  className="pg-primary"
                  style={{ width: "100%", padding: "0.75rem" }}
                  onClick={() => setConfirmOpen(true)}
                >
                  ✅ Payment Received — Mark as Paid
                </button>
                <button
                  className="pg-ghost"
                  style={{ width: "100%", padding: "0.65rem", color: "#f87171" }}
                  onClick={handleMarkFailed}
                >
                  ❌ Payment Not Received
                </button>
                <button
                  className="pg-ghost"
                  style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem" }}
                  onClick={() => { setQrGenerated(false); setTimer(900); }}
                >
                  🔄 Regenerate QR
                </button>
              </div>
            </>
          )}

          {/* Confirm Dialog */}
          {confirmOpen && (
            <div style={{
              background: "#1e1b4b",
              border: "1px solid #6d28d9",
              borderRadius: 12,
              padding: "1.25rem",
            }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>
                ⚠️ Confirm Payment Received
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Please verify that <strong style={{ color: "#a78bfa" }}>₹{totalAmount.toLocaleString("en-IN")}</strong> has been successfully received from <strong style={{ color: "#a78bfa" }}>{order.customerName}</strong> before confirming.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="pg-ghost"
                  style={{ flex: 1, padding: "0.65rem" }}
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="pg-primary"
                  style={{ flex: 1, padding: "0.65rem" }}
                  onClick={handleMarkPaid}
                >
                  ✅ Yes, Confirm
                </button>
              </div>
            </div>
          )}

          {/* Generate QR Button */}
          {!qrGenerated && !confirmOpen && paymentStatus !== "success" && (
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
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;