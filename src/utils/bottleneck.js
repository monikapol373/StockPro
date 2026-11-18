const DAY = 86400000;

const avgDays = (items, startKey, endKey) => {
    const  spans = items
        .filter((x) => x[startKey] && x[endKey])
        .map((x) => (new Date(x[endKey]) - new Date(x[startKey])) / DAY)
        .filter((d) => Number.isFinite(d) && d >= 0);
    if (spans.length === 0) return { avg: null, count: 0};
    return { avg: spans.reduce((s, d) => s + d, 0) / spans.length, count: spans.length };
};

export function getBottleneckStages({ orders, productions, customerOrders }) {
    const stages = [
        { name: "Procurement", note: "PO created to fully received", ...avgDays(orders, "createdDate", "receivedDate") },
        { name: "Production", note: "Started to completed", ...avgDays(productions, "startedDate", "completedDate") },
        { name: "Dispatch", note: "Customer order to dispatched", ...avgDays(customerOrders, "orderDate", "dispatchedDate") },
    ];
    const withData = stages.filter((s) => s.avg !== null);
    const slowest = withData.length >= 2 ? withData.reduce((a, b) => (b.avg > a.avg ? b : a)) : null;
    return { stages, slowest };
}