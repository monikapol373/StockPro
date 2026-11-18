export function getOrderStatus(order) {
  if (order.receivedQty <= 0) return "Pending";
  if (order.receivedQty < order.quantity) return "Partially Received";
  return "Received";
}