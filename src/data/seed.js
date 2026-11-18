
export const seedProducts = [
  {
    id: "PRD-001",
    name: "Steel Sheets",
    category: "Raw Material",
    quantity: 120,
    unit: "Sheets",
    price: 2500,
    status: "In Stock",
  },
  {
    id: "PRD-002",
    name: "Industrial Bolts",
    category: "Hardware",
    quantity: 18,
    unit: "Boxes",
    price: 1200,
    status: "Low Stock",
  },
  {
    id: "PRD-003",
    name: "Copper Wire",
    category: "Raw Material",
    quantity: 250,
    unit: "Rolls",
    price: 1800,
    status: "In Stock",
  },
  {
    id: "PRD-004",
    name: "Safety Gloves",
    category: "Safety",
    quantity: 8,
    unit: "Boxes",
    price: 800,
    status: "Low Stock",
  },
  {
    id: "PRD-005",
    name: "Machine Bearings",
    category: "Spare Parts",
    quantity: 65,
    unit: "Pieces",
    price: 1500,
    status: "In Stock",
  },
  {
    id: "PRD-006",
    name: "Industrial Motor",
    category: "Finished Goods",
    quantity: 0,
    unit: "Units",
    price: 18000,
    minStock: 5,
  },
  {
    id: "PRD-007",
    name: "Electric Motor Assembly",
    category: "Finished Goods",
    quantity: 0,
    unit: "Pieces",
    price: 5000,
    minStock: 5,
  },
];

export const seedSuppliers = [
  {
    id: "SUP-001",
    name: "ABC Industrial Suppliers",
    contactPerson: "Rajesh Kumar",
    phone: "9876543210",
    email: "abc@example.com",
    status: "Active",
  },
  {
    id: "SUP-002",
    name: "Global Machine Parts",
    contactPerson: "Amit Sharma",
    phone: "9823456789",
    email: "global@example.com",
    status: "Active",
  },
  {
    id: "SUP-003",
    name: "SafeTech Equipment",
    contactPerson: "Priya Mehta",
    phone: "9765432108",
    email: "safetech@example.com",
    status: "Active",
  },
];

export const seedOrders = [
  {
    id: "ORD-1001",
    supplierId: "SUP-001",
    supplierName: "ABC Industrial Suppliers",
    productId: "PRD-001",
    productName: "Steel Sheets",
    quantity: 50,
    receivedQty: 0,
    expectedDate: "2026-10-12",
    createdDate: "2026-10-05",
  },
  {
    id: "ORD-1002",
    supplierId: "SUP-002",
    supplierName: "Global Machine Parts",
    productId: "PRD-002",
    productName: "Industrial Bolts",
    quantity: 20,
    receivedQty: 8,
    expectedDate: "2026-10-08",
    createdDate: "2026-09-28",
  },
  {
    id: "ORD-1003",
    supplierId: "SUP-001",
    supplierName: "ABC Industrial Suppliers",
    productId: "PRD-003",
    productName: "Copper Wire",
    quantity: 30,
    receivedQty: 30,
    expectedDate: "2026-10-01",
    createdDate: "2026-09-24",
    receivedDate: "2026-10-01",
  },
];

export const seedBoms = [
  {
    id: "BOM-001",
    finishedProductId: "PRD-006",
    finishedProductName: "Industrial Motor",
    components: [
      { productId: "PRD-001", quantityPerUnit: 2 },
      { productId: "PRD-003", quantityPerUnit: 1 },
      { productId: "PRD-005", quantityPerUnit: 2 },
      { productId: "PRD-002", quantityPerUnit: 1 },
    ],
  },
  {
    id: "BOM-002",
    finishedProductId: "PRD-007",
    finishedProductName: "Electric Motor Assembly",
    components: [
      { productId: "PRD-001", quantityPerUnit: 1 },
      { productId: "PRD-002", quantityPerUnit: 1 },
      { productId: "PRD-003", quantityPerUnit: 2 },
      { productId: "PRD-005", quantityPerUnit: 1 },
    ],
  },
];

export const seedCustomerOrders = [
  {
    id: "CO-2001",
    customerName: "Sharma Engineering Works",
    productId: "PRD-006",
    productName: "Industrial Motor",
    quantity: 3,
    status: "Pending",
    orderDate: "2026-10-02",
  },
];
