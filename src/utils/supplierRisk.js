export function calculateSupplierRisk(supplier, orders) {
    const today = new Date();
    const supplierOrders = orders.filter((o) => o.supplierId === supplier.id);

    const totalOrders = supplierOrders.length;

    let lateOrders = 0;
    let completedOrders = 0;

    supplierOrders.forEach((o) => {
        const isReceived = o.receivedQty >= o.quantity;
        const isOverdue = !isReceived && o.expectedDate && new Date(o.expectedDate) < today;

        if (isReceived) completedOrders += 1;
        if (isOverdue) lateOrders += 1;
    });

    const latePercent = totalOrders ? Math.round((lateOrders / totalOrders) * 100) : 0;
    const fulfillmentPercent = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    let riskLevel = "No Orders Yet";
    if (totalOrders > 0) {
        if (latePercent >= 50) riskLevel = "High Risk";
        else if (latePercent >= 20) riskLevel = "Medium Risk";
        else riskLevel = "Low Risk";
    }

    return {
        supplierId: supplier.id,
        totalOrders,
        lateOrders,
        completedOrders,
        latePercent,
        fulfillmentPercent,
        riskLevel,
    };
}