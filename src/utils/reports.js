import { getOrderStatus } from "./orders";
import { getStockStatus } from "./stock";

export function getInventoryByCategory(products) {
    const groups = {};
    products.forEach((p) => {
        if (!groups[p.category]) groups[p.category] = { items: 0, value: 0, low: 0 };
        groups[p.category].items += 1;
        groups[p.category].value += p.quantity * p.price;
        if (getStockStatus(p) !== "In Stock") groups[p.category].low += 1;
    });
    return Object.entries(groups).map(([category, g]) => ({ category, ...g }));
}

export function getProductionSummary(productions) {
    const summary = { Planned: 0, "In Progress": 0, Completed: 0, unitsCompleted: 0 };
    productions.forEach((p) => {
        if (summary[p.status] !== undefined) summary[p.status] += 1;
        if (p.status === "Completed") summary.unitsCompleted += Number(p.targetQty) || 0;
    });
    return summary;
}

export function getCustomerOrderSummary(customerOrders) {
    const pending = customerOrders.filter((o) => o.status === "Pending");
    const fulfilled = customerOrders.filter((o) => o.status !== "Pending");
    return {
        total: customerOrders.length,
        pending: pending.length,
        fulfilled: fulfilled.length,
        fulfillmentRate: customerOrders.length
            ? Math.round((fulfilled.length / customerOrders.length) * 100)
            : 0,
    };
}

export function getPurchaseOrderSummary(orders) {
    const summary = { Pending: 0, "Partially Received": 0, Received: 0 };
    orders.forEach((o) => {
        const s = getOrderStatus(o);
        summary[s] = (summary[s] ?? 0) + 1;
    });
    return summary;
}

export function downloadCSV(filename, rows) {
    if (!rows || rows.length === 0) return false;
    const headers = Object.keys(rows[0]);
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}