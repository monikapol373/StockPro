import { calculateMaxProducible } from "./bom";
import { getOrderStatus } from "./orders";
import { getStockStatus } from "./stock";


//Raw materials currently Low Stock or Out of Stock
export function getLowStockProducts(products) {
    return products.filter((p) => getStockStatus(p) !== 'In Stock');
}

//Purchase Orders past their expected delivery date and not full received
export function getOverduePurchaseOrders(orders) {
    const today = new Date();
    return orders.filter((o) => {
        const status = getOrderStatus(o);
        if (status === 'Received') return false;
        if (!o.expectedDate) return false;
        return new Date(o.expectedDate) < today;
    });
}

//Planned Production Orders that don't have enough materials to actually start
export function getBlockedProductionOrders(productions, boms, products){
    return productions
    .filter((p) => p.status === 'Planned')
    .map((p) => {
        const bom = boms.find((b) => b.id === p.bomId);
        if (!bom) return null;
        const calc = calculateMaxProducible(bom, products);
        if (calc.maxUnits < Number(p.targetQty)) {
            return { order: p, bom, maxUnits: calc.maxUnits, limitingComponent: calc.limitingComponent};
        }
        return null;
    })
    .filter(Boolean);
}

//Pending Customer Orders that can't currently be fulfilled from stock
export function getAtRiskCustomerOrders(customerOrders, products) {
    return customerOrders
    .filter((o) => o.status === 'Pending')
    .map((o) => {
        const product = products.find((p) => p.id === o.productId);
        const available = product ? product.quantity : 0;
        if (available < o.quantity) {
            return { order: o, available };
        }
        return null;
    })
    .filter(Boolean);
}

// The Impact Chain: for one low-stock raw material, trace which BOMs need it,
// which Production Orders are affected, and which Customer Orders are dowmstream.
export function buildImpactChain(product, { boms, productions, customerOrders}) {
    const affectedBoms = boms.filter((b) => 
    (b.components ?? []).some((c) => c.productId === product.id)
);

const chain = [];
affectedBoms.forEach((bom) => {
    const relatedProductions = productions.filter(
        (p) => p.bomId === bom.id && p.status !== 'Completed'
    );
    relatedProductions.forEach((po) => {
        const relatedCustomerOrders = customerOrders.filter(
            (co) => co.productId === bom.finishedProductId && co.status === 'Pending'
        );
        chain.push({ bom, productionOrder: po, customerOrders: relatedCustomerOrders });
    });
});

return chain;
}