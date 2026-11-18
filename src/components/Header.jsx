import React from 'react'
import { useLocation } from 'react-router-dom';

const titles = {
  "/": {title: "Dashboard", subtitle: "Welcome back! Here's what's happening today."},
  "/inventory": {title: "Inventory", subtitle: "Manage your products and stock."},
  "/suppliers": {title: "Suppliers", subtitle: "manage your suppliers ans vendor information."},
  "/orders": {title: "Purchase Orders", subtitle: "Track orders placed with suppliers."},
  "/reports": {title: "Reports", subtitle: "Business insights and analytics."},
  "/movements": {title: "Stock Movements", subtitle: "Full history of every stock change."},
};

const Header = () => {
  const location = useLocation();
  const current = titles[location.pathname] || {title: "StockPro", subtitle: ""};

  return (
    <header className='header'>
      <div>
        <h1>{current.title}</h1>
        <p>{current.subtitle}</p>
      </div>

      <div className='header-right'>
        <button className='notification'>🔔</button>

        <div className='profile'>
          <div className='avtar'>A</div>
          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
