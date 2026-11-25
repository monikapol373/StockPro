const API = import.meta.env.VITE_APT_URL;

const getToken = () => {
    try { return sessionStorage.getItem("stockpro:token") || null; } catch { return null; }
};

export async function sendLowStockAlert({ to, products }) {
    if (!API) return { ok: false, reason: "no_api"};
    const res = await fetch(`${API}/alerts/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            type: "low-stock",
            to,
            data: products.map((p) => ({
                name: p.name,
                category: p.category,
                quantity: p.quantity,
                unit: p.unit,
                minStock: p.minStock,
            })),
        }),
    });
    return res.json();
}

export async function sendDelayedOrdersAlert({ to, orders }) {
    if (!API) return { ok: false, reason: "no_api" };
    const res = await fetch(`${API}/alerts/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            type: "delayed-orders",
            to,
            data: orders.map((o) => ({
                id: o.id,
                supplierName: o.supplierName,
                productName: o.productName,
                expectedDate: o.expectedDate,
            })),
        }),
    });
    return res.json();
}