import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ErrorBoundary from "./ErrorBoundary";

const AppLayout = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // page badalte hi upar scroll (mobile menu link click par khud band hota hai)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Escape se menu band
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="sb-backdrop" onClick={() => setMenuOpen(false)} />}

      <div className="shell-main">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="main-content has-hero">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;