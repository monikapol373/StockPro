# StockPro

Inventory and manufacturing management app for small factories. Tracks raw
materials, builds finished goods from a Bill of Materials, and warns you
before a shortage turns into a late customer order.

**Live demo:** YOUR-LIVE-LINK

## Features

- **Authentication:** register, login, logout and protected routes
- **Inventory:** products, stock in/out/adjust, per-product low-stock alert
  level, search and filter, delete guard for products still in use
- **Suppliers:** add, edit, delete, with a risk score based on late and
  fulfilled orders
- **Purchase Orders:** partial receiving, auto-updates stock
- **Bill of Materials:** shows how many units you can build right now and
  which material is the limiting one
- **Production Orders:** Planned -> In Progress -> Completed. Consumes raw
  materials and releases finished goods
- **Customer Orders:** dispatch from finished goods stock
- **Stock Movements:** ledger with search, type filter and date range
- **Command Center Dashboard:** KPIs, live alerts, inventory and risk charts
- **Alert Center:** overdue POs, blocked production, at-risk customer orders,
  and an Impact Chain tracing a material shortage to the customers it affects
- **Decision Log:** every acknowledged alert is recorded with time and action
- **Reality Check:** compare system stock with a physical count and apply the
  adjustment to the ledger
- **Bottleneck Detection:** average time in procurement, production and
  dispatch, with the slowest stage highlighted
- **Reports:** summaries plus CSV export (inventory and movements)
- **Settings:** default low-stock limit, backup, restore and reset
- Dark theme, confirm dialogs, form validation, error boundary, responsive tables

## Tech

React, Vite, React Router, Context API. No backend: data is stored in the
browser's localStorage. Login is a frontend demo (passwords are not hashed),
a real deployment would need a backend.

## Run locally

    npm install
    npm run dev

## Notes

- Data lives in your browser only. Use Settings -> Download Backup to save
  it, and Settings -> Reset Demo Data to restore the sample data.
- A product used in a BOM, an open order or a production order cannot be
  deleted until those are cleared.