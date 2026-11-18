import React from "react";

const Logo = ({ size = 26 }) => (
  <span className="sp-logo">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </svg>
    <span>Stock<b>Pro</b></span>
  </span>
);

export default Logo;