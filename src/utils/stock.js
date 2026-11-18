export  const DEFAULT_MIN_STOCK = 20;

// "stockpro:" prefix hai, isiliye Settings ka backup, restore aur reset isse apne aap cover karte hain
const MIN_STOCK_KEY = "stockpro:minStock";

export function getDefaultMinStock() {
    try {
        const raw = localStorage.getItem(MIN_STOCK_KEY);
        if (raw === null) return DEFAULT_MIN_STOCK;
        const n = Number (JSON.parse(raw));
        return Number.isInteger(n) && n >= 0 ? n : DEFAULT_MIN_STOCK;
    } catch {
        return DEFAULT_MIN_STOCK
    }
}

export function setDefaultMinStock(n) {
    localStorage.setItem(MIN_STOCK_KEY, JSON.stringify(n));
}

export function getStockStatus(product) {
    const min = Number.isFinite(product.minStock) ? product.minStock : getDefaultMinStock();
    if (product.quantity <= 0) return "Out of Stock";
    if (product.quantity <= min) return "Low Stock";
    return "In Stock"
}