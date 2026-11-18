import { getStockStatus } from './stock';
import { getOrderStatus } from './orders';
import { calculateMaxProducible } from './bom';
import { calculateSupplierRisk } from './supplierRisk';
import { getBottleneckStages } from './bottleneck';
import {
  getLowStockProducts,
  getOverduePurchaseOrders,
  getBlockedProductionOrders,
  getAtRiskCustomerOrders,
} from './intelligence';

function answerLowStock(data) {
  const low = getLowStockProducts(data.products);
  if (low.length === 0) return "No materials are currently low on stock. Everything is healthy.";
  const lines = low.map((p) => `• ${p.name} — ${p.quantity} ${p.unit} (${getStockStatus(p)})`);
  return `${low.length} item(s) need attention:\n${lines.join("\n")}`;
}

function answerProducible(data, query) {
  if (data.boms.length === 0) return "No Bill of Materials has been defined yet.";
  const match = data.boms.find((b) =>
    query.toLowerCase().includes(b.finishedProductName.toLowerCase())
  );
  const targets = match ? [match] : data.boms;
  const lines = targets.map((bom) => {
    const calc = calculateMaxProducible(bom, data.products);
    return `• ${bom.finishedProductName}: ${calc.maxUnits} units possible, limited by ${calc.limitingComponent || "N/A"}`;
  });
  return lines.join("\n");
}

function answerRisk(data) {
  const low = getLowStockProducts(data.products);
  const overdue = getOverduePurchaseOrders(data.orders);
  const blocked = getBlockedProductionOrders(data.productions, data.boms, data.products);
  const atRisk = getAtRiskCustomerOrders(data.customerOrders, data.products);

  const parts = [];
  if (low.length) parts.push(`${low.length} material(s) running low`);
  if (overdue.length) parts.push(`${overdue.length} purchase order(s) overdue`);
  if (blocked.length) parts.push(`${blocked.length} production order(s) blocked`);
  if (atRisk.length) parts.push(`${atRisk.length} customer order(s) at risk`);

  if (parts.length === 0) return "Everything looks healthy right now. No active risks.";
  return `Current risks:\n${parts.map((p) => `• ${p}`).join("\n")}\n\nCheck the Alert Center for full details and the Impact Chain.`;
}

function answerSupplierRisk(data) {
  if (data.suppliers.length === 0) return "No suppliers added yet.";
  const scored = data.suppliers.map((s) => calculateSupplierRisk(s, data.orders));
  const lines = scored.map((r) => {
    const supplier = data.suppliers.find((s) => s.id === r.supplierId);
    return `• ${supplier.name}: ${r.riskLevel} (${r.latePercent}% late, ${r.fulfillmentPercent}% fulfilled)`;
  });
  return lines.join("\n");
}

function answerBottleneck(data) {
  const { slowest } = getBottleneckStages(data);
  if (!slowest) {
    return "Not enough completed orders yet to detect a bottleneck. Complete at least two stages (receive a PO, finish production, dispatch an order).";
  }
  return `${slowest.name} is the slowest stage, averaging ${slowest.avg.toFixed(1)} days.`;
}

function answerOrders(data) {
  const pending = data.orders.filter((o) => getOrderStatus(o) !== "Received");
  if (pending.length === 0) return "All purchase orders are fully received.";
  const lines = pending.map((o) => `• ${o.id} — ${o.supplierName}, ${getOrderStatus(o)}`);
  return `${pending.length} open purchase order(s):\n${lines.join("\n")}`;
}

function answerHelp() {
  return [
    "I can answer questions using your real StockPro data. Try asking:",
    "• Which materials are low on stock?",
    "• How many Industrial Motors can we build?",
    "• What's at risk right now?",
    "• Which supplier is risky?",
    "• What's the bottleneck?",
    "• Any open purchase orders?",
  ].join("\n");
}

export function answerQuery(query, data) {
  const q = query.toLowerCase();

  if (/\b(low|shortage|running low|out of stock)\b/.test(q)) return answerLowStock(data);
  if (/\b(how many|build|producible|produce|make)\b/.test(q)) return answerProducible(data, q);
  if (/\b(supplier)\b.*\b(risk|risky|late|delay)\b/.test(q)) return answerSupplierRisk(data);
  if (/\b(bottleneck|slowest|slow stage)\b/.test(q)) return answerBottleneck(data);
  if (/\b(purchase order|po|open order)\b/.test(q)) return answerOrders(data);
  if (/\b(risk|at risk|problem|issue)\b/.test(q)) return answerRisk(data);
  if (/\b(help|what can you|commands)\b/.test(q)) return answerHelp();

  return "I'm not sure how to answer that yet. Try asking about low stock, production capacity, risks, suppliers, or the bottleneck — or type \"help\" to see examples.";
}