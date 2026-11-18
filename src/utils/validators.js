// Plain object check (array ko object nahi maanta)
const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x)

const isId = (x) => typeof x === "string" || typeof x === "number"

export const isArrayOf = (check) => (v) => Array.isArray(v) && v.every(check)

export const validList = isArrayOf(isObj)

export const validProducts = isArrayOf(
  (p) =>
    isObj(p) &&
    isId(p.id) &&
    typeof p.name === "string" &&
    typeof p.quantity === "number" &&
    typeof p.price === "number"
)

export const validBoms = isArrayOf(
  (b) => isObj(b) && Array.isArray(b.components)
)

export const validOrders = isArrayOf(
  (o) =>
    isObj(o) &&
    typeof o.quantity === "number" &&
    typeof o.receivedQty === "number"
)

export const validSuppliers = isArrayOf(
  (s) => isObj(s) && isId(s.id) && typeof s.name === "string"
)

export const validProductions = isArrayOf(isObj)

export const validCustomerOrders = isArrayOf(
  (o) => isObj(o) && o.productId !== undefined
)

export const validMovements = isArrayOf(isObj)