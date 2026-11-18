import React from "react";

// Chhote, line-style SVG icons. Koi library nahi chahiye.
const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4.5" rx="1.5" />
      <rect x="14" y="11.5" width="7" height="9.5" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  inventory: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  suppliers: (
    <>
      <path d="M2 6h12v10H2zM14 10h4l4 4v2h-8z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  orders: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  movements: (
    <>
      <path d="M4 8h13m0 0-3-3m3 3-3 3" />
      <path d="M20 16H7m0 0 3-3m-3 3 3 3" />
    </>
  ),
  bom: (
    <>
      <rect x="3" y="3" width="7" height="6" rx="1.5" />
      <rect x="14" y="3" width="7" height="6" rx="1.5" />
      <rect x="8.5" y="15" width="7" height="6" rx="1.5" />
      <path d="M6.5 9v3h11V9M12 12v3" />
    </>
  ),
  reports: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  production: (
    <>
      <path d="M3 21V11l6 4v-4l6 4V6h4l2 15z" />
    </>
  ),
  customer: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M17 11.5a3 3 0 1 0 0-5M18.5 14.7c1.7.6 2.8 2.2 3 4.8" />
    </>
  ),
  alerts: (
    <>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </>
  ),
  reality: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.9 2.9L16.3 9.5" />
    </>
  ),
  bottleneck: (
    <>
      <path d="M3 4h18l-7 9v6l-4 2v-8z" />
    </>
  ),
  assistant: (
    <>
      <path d="M4 5h16v11H11l-4.5 4v-4H4z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  logout: (
    <>
      <path d="M9 3H4v18h5" />
      <path d="M16 8l4 4-4 4M20 12H9" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
      <path d="M10 21h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
};

const Icon = ({ name, size = 18, className = "", strokeWidth = 1.8 }) => (
  <svg
    className={`icon ${className}`.trim()}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name] || null}
  </svg>
);

export default Icon;
