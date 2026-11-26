import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PaymentQR = ({ order, product, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  const totalAmount = (Number(product?.price) || 0) * Number(order?.quantity || 1);

  const handlePay = () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

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

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "StockPro",
          description: `Order ${order.id} — ${order.productName}`,
          order_id: data.rzpOrderId,
          handler: () => { setPaid(true); },
          prefill: { name: order.customerName },
          theme: { color: "#6d28d9" },
          method: { upi: true, card: false, netbanking: false, wallet: false },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      })
      .catch((err) => {
        setLoading(false);
        setError("Payment failed: " + err.message);
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
              <small style={{ color: "#6b7280", fontWeight: 400 }}>Order marked as paid.</small>
            </div>
          ) : (
            <>
              {error && <p className="form-error">{error}</p>}
              <button
                className="pg-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? "Opening Payment..." : "📱 Pay via UPI / QR"}
              </button>
              <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                Test mode — UPI ID: success@razorpay
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;