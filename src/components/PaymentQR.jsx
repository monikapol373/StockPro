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
  const [timer, setTimer] = useState(900);
  const [expired, setExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // "paid" | "failed" | null
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const canvasRef = useRef(null);

  const totalAmount = (Number(product?.price) || 0) * Number(order?.quantity || 1);

  // Timer countdown
  useEffect(() => {
    if (qrGenerated && paymentStatus !== "paid") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            clearInterval(pollRef.current);
            setExpired(true);
            setQrGenerated(false);
            setPaymentStatus("failed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [qrGenerated, paymentStatus]);

  // Poll backend every 5 seconds to check payment status
  useEffect(() => {
    if (qrGenerated && paymentStatus !== "paid") {
      pollRef.current = setInterval(async () => {
        try {
          const token = getToken();
          const res = await fetch(`${API}/payment/status/${order.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.status === "paid") {
            clearInterval(pollRef.current);
            clearInterval(timerRef.current);
            setPaymentStatus("paid");
            setQrGenerated(false);
          }
        } catch {}
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [qrGenerated, paymentStatus]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleGenerateQR = () => {
    setLoading(true);
    setError("");
    setExpired(false);
    setTimer(900);
    setPaymentStatus(null);

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
          width: 240,
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
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#6d28d9", marginBottom: "0.25rem" }}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            {order.quantity} × ₹{Number(product?.price || 0).toLocaleString("en-IN")}
          </p>

          {error && <p className="form-error">{error}</p>}

          {/* Payment Success */}
          {paymentStatus === "paid" && (
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

          {/* Payment Failed / Expired */}
          {paymentStatus === "failed" && (
            <div style={{
              background: "#450a0a",
              border: "1px solid #f87171",
              borderRadius: 12,
              padding: "1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>❌</div>
              <p style={{ color: "#f87171", fontWeight: 600, marginBottom: "0.25rem" }}>
                Payment Not Completed
              </p>
              <p style={{ color: "#fca5a5", fontSize: "0.8rem" }}>
                The QR code has expired. Please generate a new QR code and try again.
              </p>
            </div>
          )}

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

          {/* Timer + Scan instruction */}
          {qrGenerated && (
            <>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: timer < 60 ? "#450a0a" : "#1e1b4b",
                border: `1px solid ${timer < 60 ? "#f87171" : "#6d28d9"}`,
                borderRadius: 20,
                padding: "0.3rem 0.9rem",
                marginBottom: "0.75rem",
              }}>
                <span>⏱</span>
                <span style={{ color: timer < 60 ? "#f87171" : "#a78bfa", fontSize: "0.85rem", fontWeight: 600 }}>
                  {timer < 60 ? "Expiring soon — " : "Expires in "}{formatTime(timer)}
                </span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1rem" }}>
                Scan using PhonePe / GPay / Paytm to complete payment
              </p>
              <p style={{ color: "#a78bfa", fontSize: "0.75rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <span>🔄</span> Checking payment status automatically...
              </p>
              <button
                className="pg-ghost"
                style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem" }}
                onClick={() => {
                  clearInterval(timerRef.current);
                  clearInterval(pollRef.current);
                  setQrGenerated(false);
                  setTimer(900);
                }}
              >
                🔄 Regenerate QR
              </button>
            </>
          )}

          {/* Generate Button */}
          {!qrGenerated && paymentStatus !== "paid" && (
            <button
              className="pg-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
              onClick={handleGenerateQR}
              disabled={loading}
            >
              {loading ? "Generating..." : paymentStatus === "failed" ? "🔄 Generate New QR" : "🔳 Generate Payment QR"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;