import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Icon from "./Icon";
import Logo from "./Logo";
import useAlertCount from "../hooks/useAlertCount";

const GROUPS = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: "dashboard", end: true },
      { to: "/alerts", label: "Alerts", icon: "alerts", badge: true },
      { to: "/assistant", label: "Assistant", icon: "assistant" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/inventory", label: "Inventory", icon: "inventory" },
      { to: "/reorder", label: "Smart Reorder", icon: "orders" },
      { to: "/suppliers", label: "Suppliers", icon: "suppliers" },
      { to: "/orders", label: "Purchase Orders", icon: "orders" },
      { to: "/bom", label: "Bill of Materials", icon: "bom" },
      { to: "/production", label: "Production", icon: "production" },
      {
        to: "/production-planner",
        label: "Production Planner",
        icon: "production",
      },
      { to: "/customer-orders", label: "Customer Orders", icon: "customer" },
      { to: "/movements", label: "Movements", icon: "movements" },
    ],
  },
  {
    title: "Insights",
    items: [
      { to: "/reports", label: "Reports", icon: "reports" },
      { to: "/bottleneck", label: "Bottleneck", icon: "bottleneck" },
      { to: "/reality-check", label: "Reality Check", icon: "reality" },
    ],
  },
  {
    title: "System",
    items: [{ to: "/settings", label: "Settings", icon: "settings" }],
  },
];

const Sidebar = ({ open, onNavigate }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const alertCount = useAlertCount();

  const handleLogout = () => {
    logout();
    navigate("/welcome", { replace: true });
  };

  return (
    <aside
      className={`sb ${open ? "sb-open" : ""}`}
      aria-label="Main navigation"
    >
      <div className="sb-brand">
        <Logo size={26} />
      </div>

      <nav className="sb-nav">
        {GROUPS.map((group) => (
          <div className="sb-group" key={group.title}>
            <div className="sb-title">{group.title}</div>

            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sb-link ${isActive ? "active" : ""}`
                }
                onClick={onNavigate}
              >
                <Icon name={item.icon} />
                <span className="sb-label">{item.label}</span>

                {item.badge && alertCount > 0 && (
                  <span className="sb-badge">{alertCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sx-aicard">
        <span className="sx-bot" />
        <strong>AI Assistant</strong>
        <p>Ask anything about your stock, orders or production.</p>
        <NavLink to="/assistant" className="sx-chat" onClick={onNavigate}>Chat Now ✦</NavLink>
      </div>
      <button type="button" className="sx-logout" onClick={handleLogout}>
        <Icon name="logout" size={16} /> Logout{user?.name ? ` (${user.name.split(" ")[0]})` : ""}
      </button>
    </aside>
  );
};

export default Sidebar;