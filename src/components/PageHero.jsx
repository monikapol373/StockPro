import React from "react";

const HEROES = {
  dashboard: { accent: "#22d3ee", title: "Command Center", sub: "Live view of stock, production and risks",
    icon: <><rect x="8" y="8" width="20" height="20" rx="4"/><rect x="36" y="8" width="20" height="12" rx="4"/><rect x="8" y="36" width="20" height="20" rx="4"/><rect x="36" y="28" width="20" height="28" rx="4"/></> },
  inventory: { accent: "#22d3a0", title: "Inventory", sub: "Every product and stock level in one place",
    icon: <path d="M8 22 32 10l24 12v22L32 56 8 44z M8 22l24 12 24-12 M32 34v22" /> },
  suppliers: { accent: "#f5a524", title: "Suppliers", sub: "Who supplies you, and how reliably",
    icon: <><rect x="4" y="18" width="34" height="24" rx="3"/><path d="M38 26h12l10 10v6H38z"/><circle cx="16" cy="46" r="5"/><circle cx="48" cy="46" r="5"/></> },
  orders: { accent: "#3b82f6", title: "Purchase Orders", sub: "What you ordered and what has arrived",
    icon: <><rect x="14" y="8" width="36" height="48" rx="5"/><path d="M22 22h20 M22 32h20 M22 42h12"/></> },
  movements: { accent: "#a78bfa", title: "Stock Movements", sub: "A full ledger of every stock change",
    icon: <path d="M8 22h40 M38 12l10 10-10 10 M56 42H16 M26 32 16 42l10 10" /> },
  bom: { accent: "#22d3a0", title: "Bill of Materials", sub: "What you can build with the stock you have",
    icon: <path d="M10 10h18v12H10z M36 10h18v12H36z M23 42h18v12H23z M19 22v8h26v-8 M32 30v12" /> },
  production: { accent: "#f5a524", title: "Production", sub: "Plan, start and complete production orders",
    icon: <path d="M6 56V28l16 10V28l16 10V16h14l4 40z" /> },
  customer: { accent: "#22d3ee", title: "Customer Orders", sub: "Orders waiting to be dispatched",
    icon: <path d="M14 6h36v52l-6-4-6 4-6-4-6 4-6-4-6 4z M22 20h20 M22 30h20" /> },
  reports: { accent: "#3b82f6", title: "Reports", sub: "Summaries and CSV exports",
    icon: <><path d="M8 8v48h48"/><rect x="16" y="34" width="8" height="16"/><rect x="30" y="22" width="8" height="28"/><rect x="44" y="28" width="8" height="22"/></> },
  alerts: { accent: "#f0605d", title: "Alert Center", sub: "Risks traced to the customers they affect",
    icon: <path d="M32 8 58 54H6z M32 24v16 M32 47v2" /> },
  settings: { accent: "#7f97b2", title: "Settings", sub: "Stock rules, backup and reset",
    icon: <><circle cx="32" cy="32" r="9"/><circle cx="32" cy="32" r="22" strokeDasharray="6 5"/></> },
  assistant: { accent: "#a78bfa", title: "AI Assistant", sub: "Ask questions, answered from your real data",
    icon: <path d="M8 12h48v30H30l-12 12V42H8z M20 24h24 M20 32h14" /> },
  reality: { accent: "#22d3a0", title: "Reality Check", sub: "Compare system stock with what you physically count",
    icon: <><circle cx="32" cy="32" r="22"/><path d="m21 33 8 8 15-17"/></> },
  bottleneck: { accent: "#fb923c", title: "Bottleneck", sub: "Which stage slows you down the most",
    icon: <path d="M6 10h52L38 34v18l-12-6V34z" /> },
};

const PATH_TO_HERO = {
  "/": "dashboard", "/inventory": "inventory", "/suppliers": "suppliers",
  "/orders": "orders", "/movements": "movements", "/bom": "bom",
  "/production": "production", "/customer-orders": "customer",
  "/reports": "reports", "/alerts": "alerts", "/settings": "settings",
  "/assistant": "assistant", "/bottleneck": "bottleneck", "/reality-check": "reality",
};

const PageHero = ({ pathname }) => {
  const hero = HEROES[PATH_TO_HERO[pathname]];
  if (!hero) return null;
  return (
    <div className="ph" style={{ "--accent": hero.accent }}>
      <div className="ph-text">
        <h1>{hero.title}</h1>
        <p>{hero.sub}</p>
      </div>
      <svg className="ph-art" viewBox="0 0 64 64" fill="none" stroke="currentColor"
           strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {hero.icon}
      </svg>
    </div>
  );
};

export default PageHero;