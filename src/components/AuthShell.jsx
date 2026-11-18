import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import CssWarehouse from "./CssWarehouse";

const ICONS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
};

export const Field = ({ icon, toggle, children }) => (
  <div className="au-field">
    <svg className="ic" viewBox="0 0 24 24">{ICONS[icon]}</svg>
    {children}
    {toggle && (
      <button type="button" className="au-toggle" onClick={toggle.onClick}>
        {toggle.show ? "Hide" : "Show"}
      </button>
    )}
  </div>
);

const POINTS = [
  "One connected flow from supplier to customer",
  "Alerts that trace a shortage to the order at risk",
  "Backup, restore and CSV export built in",
];

const AuthShell = ({ children }) => (
  <div className="au">
    <style>{CSS}</style>

    <aside className="au-vis">
      <div className="au-photo" />
      <div className="au-shade" />
      <Link to="/welcome" className="au-brand"><Logo size={30} /></Link>
      <div className="au-scene"><CssWarehouse /></div>
      <div className="au-copy">
        <h2>Run your plant with <span>full visibility</span></h2>
        <ul>
          {POINTS.map((p) => (
            <li key={p}><i>✓</i>{p}</li>
          ))}
        </ul>
      </div>
    </aside>

    <main className="au-main">
      <Link to="/welcome" className="au-back">← Back to home</Link>
      <div className="au-card">{children}</div>
    </main>
  </div>
);

const CSS = `
.au { min-height:100vh; display:grid; grid-template-columns:1.1fr 1fr; background:#060d18; color:#eaf2f8; font-family:"Segoe UI",system-ui,sans-serif; }
.au * { box-sizing:border-box; }
.au a { color:inherit; text-decoration:none; }
.au-vis { position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:36px 44px; min-height:100vh; }
.au-photo { position:absolute; inset:-4%; background:url('/factory-bg.png') center/cover no-repeat; animation:auKen 24s ease-in-out infinite alternate; }
@keyframes auKen { from { transform:scale(1); } to { transform:scale(1.12) translateX(-2%); } }
.au-shade { position:absolute; inset:0; background:linear-gradient(180deg,rgba(4,9,20,.9),rgba(4,9,20,.5) 45%,rgba(4,9,20,.94)); }
.au-brand, .au-scene, .au-copy { position:relative; z-index:2; }
.au-scene { height:400px; margin:0 -24px; }
.au-copy h2 { font-size:34px; font-weight:800; letter-spacing:-.8px; line-height:1.15; margin-bottom:18px; }
.au-copy h2 span { background:linear-gradient(90deg,#3b82f6,#22d3ee); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.au-copy ul { list-style:none; padding:0; margin:0; display:grid; gap:12px; }
.au-copy li { display:flex; gap:12px; align-items:center; color:#cfdbea; font-size:14.5px; }
.au-copy li i { width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font-style:normal; font-size:12px; font-weight:800; color:#4ade80; background:rgba(34,197,94,.2); }

.au-main { position:relative; display:flex; align-items:center; justify-content:center; padding:40px 28px; background:radial-gradient(600px 400px at 80% 0,rgba(37,99,235,.25),transparent 70%),#07101f; }
.au-back { position:absolute; top:26px; left:30px; font-size:13.5px; color:#9fb3c9; transition:color .2s; }
.au-back:hover { color:#fff; }
.au-card { width:100%; max-width:440px; padding:36px 34px; border-radius:22px; background:linear-gradient(160deg,rgba(24,38,64,.85),rgba(10,18,34,.9)); border:1px solid rgba(255,255,255,.1); box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 60px rgba(37,99,235,.12); backdrop-filter:blur(14px); animation:auUp .7s ease both; }
@keyframes auUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
.au-card h2 { font-size:28px; font-weight:800; letter-spacing:-.5px; margin-bottom:6px; }
.au-sub { color:#94a8bf; font-size:14px; line-height:1.6; margin-bottom:22px; }
.au-field { position:relative; margin-bottom:14px; }
.au-field .ic { position:absolute; left:14px; top:50%; transform:translateY(-50%); width:17px; height:17px; fill:none; stroke:#7f93aa; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.au-field input { width:100%; padding:14px 56px 14px 42px; border-radius:12px; font:inherit; font-size:14.5px; background:rgba(5,11,22,.85); color:#eaf2f8; border:1px solid rgba(255,255,255,.14); outline:none; transition:border-color .2s,box-shadow .2s; }
.au-field input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.25); }
.au-toggle { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:0; color:#7dd3fc; font-size:12.5px; font-weight:600; cursor:pointer; }
.au-remember { display:flex; align-items:center; gap:9px; font-size:13.5px; color:#a9b9cc; margin:4px 0 16px; cursor:pointer; }
.au-error, .au-success { font-size:13.5px; margin:0 0 14px; padding:10px 14px; border-radius:10px; }
.au-error { color:#fca5a5; background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.35); }
.au-success { color:#86efac; background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.35); }
.au-btn { width:100%; min-height:50px; display:flex; justify-content:center; align-items:center; padding:14px; border:0; border-radius:12px; font-size:15.5px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#2563eb,#06b6d4); box-shadow:0 14px 34px rgba(37,99,235,.45); transition:transform .2s,box-shadow .2s; }
.au-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 18px 40px rgba(37,99,235,.6); }
.au-btn:disabled { opacity:.75; cursor:wait; }
.au-spin { width:20px; height:20px; border-radius:50%; border:3px solid rgba(255,255,255,.35); border-top-color:#fff; animation:auSpin .7s linear infinite; }
@keyframes auSpin { to { transform:rotate(360deg); } }
.au-switch { text-align:center; color:#94a8bf; font-size:14px; margin-top:18px; }
.au-switch a { color:#7dd3fc; font-weight:600; }
.au-strength { display:flex; align-items:center; gap:12px; margin:-4px 0 14px; }
.au-bars { display:flex; gap:6px; flex:1; }
.au-bars span { flex:1; height:5px; border-radius:5px; background:rgba(255,255,255,.12); }
.au-bars span.on.s1 { background:#ef4444; } .au-bars span.on.s2 { background:#f59e0b; } .au-bars span.on.s3 { background:#84cc16; } .au-bars span.on.s4 { background:#22c55e; }
.au-strength small { color:#94a8bf; font-size:12px; min-width:62px; text-align:right; }
@media (max-width:900px) { .au { grid-template-columns:1fr; } .au-vis { display:none; } }
@media (prefers-reduced-motion: reduce) { .au-photo, .au-card { animation:none; } }
`;

export default AuthShell;