import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const FEATURES = [
  { icon: "📦", title: "Smart Inventory", text: "Real-time stock tracking with auto alerts before shortages hit your production line.", color: "#6366f1" },
  { icon: "🏭", title: "Production Control", text: "Bill of Materials, production orders and finished goods — all connected automatically.", color: "#06b6d4" },
  { icon: "🚨", title: "Impact Chain Alerts", text: "Trace any shortage to the exact customer order it puts at risk. Act before it's late.", color: "#f43f5e" },
  { icon: "🤝", title: "Supplier Intelligence", text: "Score every supplier on delivery history. Know who to trust before you place the next order.", color: "#f59e0b" },
  { icon: "📊", title: "Live Analytics", text: "Bottleneck detection, reality check and reports — your operations in one dashboard.", color: "#10b981" },
  { icon: "🔐", title: "Role-based Access", text: "Admin, Manager and Staff roles. Everyone sees exactly what they need.", color: "#8b5cf6" },
];

const STATS = [
  { value: "13+", label: "Modules" },
  { value: "100%", label: "Real-time" },
  { value: "0", label: "Setup needed" },
  { value: "∞", label: "Movements tracked" },
];

const STEPS = [
  { n: "01", icon: "⚡", title: "Setup in minutes", text: "Add your products, suppliers and Bill of Materials. No technical knowledge needed." },
  { n: "02", icon: "🔄", title: "Run operations", text: "Place orders, run production, dispatch to customers. Stock updates itself automatically." },
  { n: "03", icon: "🎯", title: "Stay ahead", text: "Alerts, risk scores and bottleneck insights tell you what needs attention right now." },
];

const WORDS = ["Inventory.", "Production.", "Suppliers.", "Delivery."];

const useTypewriter = (words) => {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const full = words[idx];
    let delay = del ? 45 : 95;
    if (!del && text === full) delay = 1800;
    if (del && text === "") delay = 400;
    const t = setTimeout(() => {
      if (!del && text === full) setDel(true);
      else if (del && text === "") { setDel(false); setIdx((idx + 1) % words.length); }
      else setText(del ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);
  return text;
};

const Landing = () => {
  const typed = useTypewriter(WORDS);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [counts, setCounts] = useState({});
  const heroRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? "lp-nav-blur" : ""}`}>
        <Link to="/" className="lp-brand"><Logo size={26} /></Link>

        <div className={`lp-links ${menuOpen ? "lp-links-open" : ""}`}>
          {["home","features","how-it-works","contact"].map((id) => (
            <a key={id} href={`#${id}`} onClick={scrollTo(id)}>
              {id.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
            </a>
          ))}
          <div className="lp-nav-cta-mobile">
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="lp-btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>
        </div>

        <div className="lp-nav-right">
          <Link to="/login" className="lp-btn-ghost">Login</Link>
          <Link to="/register" className="lp-btn-primary">Get Started</Link>
          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
          </button>
        </div>
      </nav>

      {menuOpen && <div className="lp-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* HERO */}
      <section id="home" className="lp-hero" ref={heroRef}>
        <div className="lp-hero-glow lp-glow1" />
        <div className="lp-hero-glow lp-glow2" />
        <div className="lp-hero-glow lp-glow3" />

        <div className="lp-hero-grid">
          {/* grid dots */}
          <div className="lp-grid-dots" />

          <div className="lp-hero-content">
            <div className="lp-badge" data-reveal>
              <span className="lp-badge-dot" />
              Inventory & Manufacturing Platform
            </div>

            <h1 className="lp-hero-h1" data-reveal>
              Smarter<br />
              <span className="lp-gradient-text">{typed}<span className="lp-cursor" /></span>
              <br />
              <span className="lp-white-text">Stronger Results.</span>
            </h1>

            <p className="lp-hero-p" data-reveal>
              StockPro connects raw materials, suppliers, production and customer orders
              in one platform — so you catch shortages before they become late deliveries.
            </p>

            <div className="lp-hero-btns" data-reveal>
              <Link to="/register" className="lp-btn-hero-primary">
                Start for Free
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              </Link>
              <a href="#features" onClick={scrollTo("features")} className="lp-btn-hero-ghost">
                See Features
              </a>
            </div>

            <div className="lp-stats-row" data-reveal>
              {STATS.map((s) => (
                <div key={s.label} className="lp-stat-item">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="lp-hero-preview" data-reveal>
            <div className="lp-preview-card">
              <div className="lp-preview-topbar">
                <div className="lp-preview-dots">
                  <i style={{background:"#ef4444"}} />
                  <i style={{background:"#f59e0b"}} />
                  <i style={{background:"#22c55e"}} />
                </div>
                <span className="lp-preview-url">stockpro / dashboard</span>
              </div>
              <div className="lp-preview-body">
                <div className="lp-preview-sidebar">
                  <b>StockPro</b>
                  {["Dashboard","Inventory","Production","Alerts","Reports"].map((item,i) => (
                    <span key={item} className={i===0?"lp-active-link":""}>{item}</span>
                  ))}
                </div>
                <div className="lp-preview-main">
                  <div className="lp-preview-kpis">
                    {[
                      {label:"Stock Value",value:"₹12.4L",color:"#6366f1"},
                      {label:"Open Orders",value:"48",color:"#06b6d4"},
                      {label:"In Production",value:"12",color:"#10b981"},
                      {label:"Low Stock",value:"7",color:"#f43f5e"},
                    ].map((k) => (
                      <div key={k.label} className="lp-kpi" style={{"--kc":k.color}}>
                        <small>{k.label}</small>
                        <strong>{k.value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="lp-preview-chart">
                    <small>Production vs Demand</small>
                    <div className="lp-bars">
                      {[40,62,48,75,58,82,66].map((h,i) => (
                        <span key={i} style={{height:`${h}%`,animationDelay:`${i*120}ms`}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="lp-float lp-f1">
              <div className="lp-float-dot red" />
              <div>
                <b>Low Stock Alert</b>
                <small>Steel Sheets · 12 left</small>
              </div>
            </div>
            <div className="lp-float lp-f2">
              <div className="lp-float-dot green" />
              <div>
                <b>Order Dispatched</b>
                <small>CO-2001 · Shipped ✓</small>
              </div>
            </div>
            <div className="lp-float lp-f3">
              <span className="lp-ring-wrap">
                <svg viewBox="0 0 36 36" width="40" height="40">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray="88" strokeDashoffset="30" transform="rotate(-90 18 18)"/>
                </svg>
                <b>68%</b>
              </span>
              <div>
                <b>Production</b>
                <small>Overall progress</small>
              </div>
            </div>
          </div>
        </div>

        <a href="#features" onClick={scrollTo("features")} className="lp-scroll-hint">
          <span />
        </a>
      </section>

      {/* MARQUEE */}
      <div className="lp-marquee">
        <div className="lp-marquee-track">
          {[...Array(2)].flatMap(() =>
            ["Inventory","Suppliers","Purchase Orders","Bill of Materials","Production",
             "Customer Orders","Stock Movements","Impact Alerts","Reality Check","Bottleneck","Reports","Backup"]
              .map((m,i) => <span key={`${m}${i}`}><i>◆</i>{m}</span>)
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="lp-section">
        <div className="lp-section-head" data-reveal>
          <span className="lp-tag">Features</span>
          <h2>Everything your plant needs</h2>
          <p>Built around the real flow of a small factory — from supplier to customer door.</p>
        </div>
        <div className="lp-features-grid">
          {FEATURES.map((f,i) => (
            <div key={f.title} className="lp-feature-card" data-reveal style={{"--fc":f.color,"--delay":`${i*80}ms`}}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <div className="lp-feature-line" />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section lp-alt">
        <div className="lp-section-head" data-reveal>
          <span className="lp-tag">How it works</span>
          <h2>From setup to insight in 3 steps</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s,i) => (
            <div key={s.n} className="lp-step" data-reveal style={{"--delay":`${i*120}ms`}}>
              <div className="lp-step-num">{s.n}</div>
              <div className="lp-step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="lp-cta-banner" data-reveal>
        <div className="lp-cta-glow" />
        <h2>Ready to take control?</h2>
        <p>Join and manage your entire plant from one dashboard.</p>
        <div className="lp-cta-btns">
          <Link to="/register" className="lp-btn-hero-primary">Create Free Account</Link>
          <Link to="/login" className="lp-btn-hero-ghost">Login</Link>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="lp-section">
        <div className="lp-section-head" data-reveal>
          <span className="lp-tag">Contact</span>
          <h2>Get in touch</h2>
        </div>
        <div className="lp-contact" data-reveal>
          <div className="lp-contact-info">
            {[
              {icon:"📧",label:"Email",value:"monika@gmail.com"},
              {icon:"📍",label:"Location",value:"Pune, Maharashtra"},
              {icon:"🕘",label:"Hours",value:"Mon–Sat, 9AM–6PM"},
            ].map((c) => (
              <div key={c.label} className="lp-contact-card">
                <span>{c.icon}</span>
                <div><b>{c.label}</b><p>{c.value}</p></div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Logo size={22} />
            <p>Inventory and manufacturing control for modern small factories.</p>
          </div>
          <div className="lp-footer-links">
            <b>Product</b>
            <a href="#features" onClick={scrollTo("features")}>Features</a>
            <a href="#how-it-works" onClick={scrollTo("how-it-works")}>How it works</a>
            <a href="#contact" onClick={scrollTo("contact")}>Contact</a>
          </div>
          <div className="lp-footer-links">
            <b>Account</b>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © 2026 StockPro · Industrial Operations Platform
        </div>
      </footer>
    </div>
  );
};

const ContactForm = () => {
  const [form, setForm] = useState({name:"",email:"",message:""});
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({...form,[e.target.name]:e.target.value});

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email.");
    if (form.message.trim().length < 5) return setError("Message too short.");
    setSent(true);
  };

  if (sent) return (
    <div className="lp-form lp-sent">
      <div className="lp-sent-icon">✅</div>
      <h3>Message sent!</h3>
      <p>We'll get back to you soon.</p>
      <button onClick={() => setSent(false)} className="lp-btn-ghost">Send another</button>
    </div>
  );

  return (
    <form className="lp-form" onSubmit={onSubmit}>
      <input name="name" value={form.name} onChange={onChange} placeholder="Your name" />
      <input name="email" value={form.email} onChange={onChange} placeholder="Your email" type="email" />
      <textarea name="message" value={form.message} onChange={onChange} placeholder="Your message" rows={4} />
      {error && <p className="lp-form-error">{error}</p>}
      <button type="submit" className="lp-btn-hero-primary">Send Message</button>
    </form>
  );
};

const CSS = `
/* ===== BASE ===== */
.lp { background:#060d18; color:#e8f0f8; font-family:"Segoe UI",system-ui,sans-serif; overflow-x:hidden; }
.lp *,.lp *::before,.lp *::after { box-sizing:border-box; margin:0; padding:0; }
.lp a { text-decoration:none; color:inherit; }
.lp button { cursor:pointer; font:inherit; border:none; background:none; }

/* ===== REVEAL ===== */
[data-reveal] { opacity:0; transform:translateY(32px); transition:opacity .7s ease,transform .7s ease; transition-delay:var(--delay,0ms); }
[data-reveal].revealed { opacity:1; transform:none; }

/* ===== NAV ===== */
.lp-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:20px 60px; transition:all .3s; }
.lp-nav-blur { background:rgba(6,13,24,.85); backdrop-filter:blur(20px); padding:14px 60px; border-bottom:1px solid rgba(255,255,255,.07); box-shadow:0 8px 32px rgba(0,0,0,.3); }
.lp-brand { flex-shrink:0; }
.lp-links { display:flex; align-items:center; gap:4px; }
.lp-links a { padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#94a3b8; transition:color .2s,background .2s; white-space:nowrap; }
.lp-links a:hover { color:#fff; background:rgba(255,255,255,.07); }
.lp-nav-cta-mobile { display:none; }
.lp-nav-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.lp-btn-ghost { padding:9px 20px; border-radius:10px; font-size:14px; font-weight:600; color:#e2e8f0; border:1px solid rgba(255,255,255,.2); transition:all .2s; white-space:nowrap; }
.lp-btn-ghost:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.4); }
.lp-btn-primary { padding:9px 20px; border-radius:10px; font-size:14px; font-weight:600; color:#fff; background:linear-gradient(135deg,#4f46e5,#6366f1); transition:all .2s; white-space:nowrap; }
.lp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.5); }
.lp-hamburger { display:none; flex-direction:column; gap:5px; padding:6px; border-radius:8px; background:rgba(255,255,255,.07); }
.lp-hamburger span { display:block; width:22px; height:2px; background:#e2e8f0; border-radius:2px; transition:all .3s; }
.lp-hamburger span.open:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.lp-hamburger span.open:nth-child(2) { opacity:0; }
.lp-hamburger span.open:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.lp-backdrop { position:fixed; inset:0; z-index:90; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); }

/* ===== HERO ===== */
.lp-hero { position:relative; min-height:100vh; display:flex; align-items:center; padding:120px 60px 80px; overflow:hidden; }
.lp-hero-glow { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; }
.lp-glow1 { width:600px; height:600px; background:rgba(99,102,241,.3); top:-200px; left:-200px; animation:lpPulse 8s ease-in-out infinite; }
.lp-glow2 { width:500px; height:500px; background:rgba(6,182,212,.2); bottom:-150px; right:-100px; animation:lpPulse 10s ease-in-out infinite reverse; }
.lp-glow3 { width:300px; height:300px; background:rgba(244,63,94,.15); top:30%; left:40%; animation:lpPulse 12s ease-in-out infinite; }
@keyframes lpPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
.lp-grid-dots { position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px); background-size:36px 36px; pointer-events:none; mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent); }
.lp-hero-grid { position:relative; z-index:2; width:100%; max-width:1280px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
.lp-hero-content { display:flex; flex-direction:column; gap:0; }
.lp-badge { display:inline-flex; align-items:center; gap:10px; padding:8px 18px; border-radius:999px; background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.4); color:#a5b4fc; font-size:13px; font-weight:600; margin-bottom:28px; width:fit-content; }
.lp-badge-dot { width:8px; height:8px; border-radius:50%; background:#6366f1; animation:lpBlink 1.5s ease-in-out infinite; }
@keyframes lpBlink { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.8)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }
.lp-hero-h1 { font-size:60px; font-weight:800; line-height:1.1; letter-spacing:-2px; margin-bottom:24px; }
.lp-gradient-text { background:linear-gradient(90deg,#6366f1,#06b6d4,#6366f1); background-size:200%; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:lpFlow 4s linear infinite; }
@keyframes lpFlow { to{background-position:200%} }
.lp-white-text { color:#fff; }
.lp-cursor { display:inline-block; width:3px; height:.85em; background:#6366f1; margin-left:4px; vertical-align:-4px; border-radius:2px; animation:lpCursor 1s step-end infinite; }
@keyframes lpCursor { 50%{opacity:0} }
.lp-hero-p { font-size:17px; line-height:1.8; color:#94a3b8; max-width:520px; margin-bottom:36px; }
.lp-hero-btns { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:48px; }
.lp-btn-hero-primary { display:inline-flex; align-items:center; gap:8px; padding:14px 30px; border-radius:12px; font-size:15px; font-weight:700; color:#fff; background:linear-gradient(135deg,#4f46e5,#6366f1); transition:all .25s; border:none; cursor:pointer; }
.lp-btn-hero-primary:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(99,102,241,.55); }
.lp-btn-hero-ghost { display:inline-flex; align-items:center; gap:8px; padding:14px 30px; border-radius:12px; font-size:15px; font-weight:700; color:#e2e8f0; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.2); transition:all .25s; cursor:pointer; }
.lp-btn-hero-ghost:hover { background:rgba(255,255,255,.14); transform:translateY(-3px); }
.lp-stats-row { display:flex; gap:40px; flex-wrap:wrap; }
.lp-stat-item strong { display:block; font-size:28px; font-weight:800; color:#fff; }
.lp-stat-item span { font-size:12px; color:#64748b; font-weight:500; text-transform:uppercase; letter-spacing:.5px; }

/* ===== PREVIEW CARD ===== */
.lp-hero-preview { position:relative; }
.lp-preview-card { border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,.1); background:#0a1424; box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(99,102,241,.2); animation:lpFloat 6s ease-in-out infinite; }
@keyframes lpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
.lp-preview-topbar { display:flex; align-items:center; gap:7px; padding:12px 16px; background:#0d1a2e; border-bottom:1px solid rgba(255,255,255,.07); }
.lp-preview-dots { display:flex; gap:6px; }
.lp-preview-dots i { width:10px; height:10px; border-radius:50%; }
.lp-preview-url { margin-left:12px; color:#475569; font-size:11.5px; }
.lp-preview-body { display:grid; grid-template-columns:160px 1fr; min-height:280px; }
.lp-preview-sidebar { padding:16px 12px; background:#08111f; border-right:1px solid rgba(255,255,255,.06); display:flex; flex-direction:column; gap:4px; }
.lp-preview-sidebar b { color:#6366f1; font-size:14px; margin-bottom:10px; display:block; }
.lp-preview-sidebar span { padding:7px 10px; border-radius:7px; color:#64748b; font-size:12px; }
.lp-preview-sidebar span.lp-active-link { background:rgba(99,102,241,.2); color:#a5b4fc; }
.lp-preview-main { padding:16px; }
.lp-preview-kpis { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
.lp-kpi { padding:10px 12px; border-radius:10px; background:#0f1d33; border:1px solid rgba(255,255,255,.06); border-top:2px solid var(--kc); }
.lp-kpi small { display:block; color:#475569; font-size:10px; margin-bottom:4px; }
.lp-kpi strong { font-size:18px; color:#e2e8f0; }
.lp-preview-chart { padding:12px; border-radius:10px; background:#0f1d33; border:1px solid rgba(255,255,255,.06); }
.lp-preview-chart small { display:block; color:#475569; font-size:10px; margin-bottom:8px; }
.lp-bars { display:flex; align-items:flex-end; gap:6px; height:80px; }
.lp-bars span { flex:1; border-radius:4px 4px 0 0; background:linear-gradient(180deg,#6366f1,#06b6d4); animation:lpBar .9s cubic-bezier(.2,.8,.2,1) both; }
@keyframes lpBar { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }

/* Floating cards */
.lp-float { position:absolute; display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; background:rgba(10,20,38,.85); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.12); box-shadow:0 20px 50px rgba(0,0,0,.5); font-size:13px; white-space:nowrap; }
.lp-float b { display:block; font-size:13px; color:#e2e8f0; }
.lp-float small { color:#64748b; font-size:11px; }
.lp-float-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.lp-float-dot.red { background:#ef4444; animation:lpRed 1.5s ease-in-out infinite; }
.lp-float-dot.green { background:#22c55e; box-shadow:0 0 10px #22c55e; }
@keyframes lpRed { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.7)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
.lp-f1 { top:-16px; right:-20px; animation:lpFloat1 7s ease-in-out infinite; }
.lp-f2 { bottom:40px; left:-24px; animation:lpFloat2 8s ease-in-out infinite; }
.lp-f3 { bottom:-16px; right:20px; animation:lpFloat1 9s ease-in-out infinite reverse; }
@keyframes lpFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes lpFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
.lp-ring-wrap { position:relative; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lp-ring-wrap b { position:absolute; font-size:10px; color:#22d3ee; }
.lp-scroll-hint { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); z-index:3; width:24px; height:40px; border:2px solid rgba(255,255,255,.3); border-radius:12px; display:flex; justify-content:center; }
.lp-scroll-hint span { width:3px; height:8px; background:#6366f1; border-radius:2px; margin-top:6px; animation:lpScroll 2s ease-in-out infinite; }
@keyframes lpScroll { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(14px);opacity:0} }

/* ===== MARQUEE ===== */
.lp-marquee { overflow:hidden; border-top:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); padding:16px 0; }
.lp-marquee-track { display:flex; gap:0; width:max-content; animation:lpMarquee 40s linear infinite; }
.lp-marquee-track span { display:flex; align-items:center; gap:0; color:#475569; font-size:14px; font-weight:500; padding:0 24px; white-space:nowrap; }
.lp-marquee-track i { color:#6366f1; margin-right:14px; font-style:normal; font-size:9px; }
@keyframes lpMarquee { to{transform:translateX(-50%)} }

/* ===== SECTIONS ===== */
.lp-section { padding:100px 60px; max-width:1280px; margin:0 auto; }
.lp-alt { max-width:none; background:linear-gradient(180deg,#080f1e,#0a1525); }
.lp-alt .lp-steps { max-width:1200px; margin:0 auto; }
.lp-section-head { text-align:center; margin-bottom:60px; }
.lp-tag { display:inline-block; padding:5px 14px; border-radius:999px; background:rgba(99,102,241,.15); color:#a5b4fc; font-size:12px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; margin-bottom:16px; }
.lp-section-head h2 { font-size:40px; font-weight:800; letter-spacing:-.8px; margin-bottom:14px; color:#f1f5f9; }
.lp-section-head p { color:#64748b; font-size:16px; max-width:560px; margin:0 auto; line-height:1.7; }

/* ===== FEATURES ===== */
.lp-features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.lp-feature-card { position:relative; padding:28px; border-radius:16px; background:linear-gradient(160deg,rgba(15,25,45,.9),rgba(8,14,28,.9)); border:1px solid rgba(255,255,255,.07); transition:all .3s; overflow:hidden; transition-delay:var(--delay,0ms); }
.lp-feature-card::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%,var(--fc,#6366f1)20,transparent 70%); opacity:0; transition:opacity .3s; }
.lp-feature-card:hover { transform:translateY(-6px); border-color:var(--fc,#6366f1); box-shadow:0 20px 50px rgba(0,0,0,.4),0 0 30px color-mix(in srgb,var(--fc,#6366f1) 20%,transparent); }
.lp-feature-card:hover::before { opacity:.08; }
.lp-feature-icon { font-size:32px; margin-bottom:16px; display:block; }
.lp-feature-card h3 { font-size:18px; font-weight:700; color:#f1f5f9; margin-bottom:10px; }
.lp-feature-card p { font-size:14px; color:#64748b; line-height:1.7; }
.lp-feature-line { position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--fc,#6366f1); transform:scaleX(0); transform-origin:left; transition:transform .3s; }
.lp-feature-card:hover .lp-feature-line { transform:scaleX(1); }

/* ===== STEPS ===== */
.lp-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:0 60px; }
.lp-step { padding:36px 28px; border-radius:18px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); transition:all .3s; transition-delay:var(--delay,0ms); }
.lp-step:hover { transform:translateY(-6px); border-color:rgba(99,102,241,.5); background:rgba(99,102,241,.05); }
.lp-step-num { font-size:48px; font-weight:800; background:linear-gradient(90deg,#4f46e5,#06b6d4); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:4px; display:block; }
.lp-step-icon { font-size:28px; margin-bottom:14px; display:block; }
.lp-step h3 { font-size:20px; font-weight:700; color:#f1f5f9; margin-bottom:10px; }
.lp-step p { font-size:14.5px; color:#64748b; line-height:1.7; }

/* ===== CTA BANNER ===== */
.lp-cta-banner { position:relative; overflow:hidden; max-width:1100px; margin:0 auto 100px; padding:80px 40px; text-align:center; border-radius:24px; background:linear-gradient(135deg,#1e1b4b,#1e3a5f,#1e1b4b); background-size:300% 300%; animation:lpBg 8s ease infinite; border:1px solid rgba(99,102,241,.3); }
@keyframes lpBg { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
.lp-cta-glow { position:absolute; inset:-50%; background:radial-gradient(ellipse at center,rgba(99,102,241,.2),transparent 70%); pointer-events:none; }
.lp-cta-banner h2 { position:relative; font-size:38px; font-weight:800; color:#f1f5f9; margin-bottom:14px; }
.lp-cta-banner p { position:relative; color:#94a3b8; margin-bottom:32px; font-size:16px; }
.lp-cta-btns { position:relative; display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

/* ===== CONTACT ===== */
.lp-contact { display:grid; grid-template-columns:1fr 1.4fr; gap:32px; align-items:start; }
.lp-contact-info { display:flex; flex-direction:column; gap:14px; }
.lp-contact-card { display:flex; gap:16px; align-items:center; padding:20px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); transition:all .3s; }
.lp-contact-card:hover { transform:translateX(6px); border-color:rgba(99,102,241,.5); background:rgba(99,102,241,.05); }
.lp-contact-card>span { font-size:22px; width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:rgba(99,102,241,.15); flex-shrink:0; }
.lp-contact-card b { display:block; font-size:14px; color:#e2e8f0; margin-bottom:3px; }
.lp-contact-card p { color:#64748b; font-size:13px; margin:0; }
.lp-form { display:flex; flex-direction:column; gap:12px; padding:28px; border-radius:16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); }
.lp-form input,.lp-form textarea { width:100%; padding:12px 14px; border-radius:10px; background:rgba(5,10,22,.8); color:#e2e8f0; border:1px solid rgba(255,255,255,.12); font:inherit; font-size:14px; outline:none; resize:vertical; transition:border-color .2s,box-shadow .2s; }
.lp-form input:focus,.lp-form textarea:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.2); }
.lp-form-error { color:#f87171; font-size:13px; }
.lp-sent { text-align:center; padding:40px 20px; }
.lp-sent-icon { font-size:48px; margin-bottom:16px; display:block; }
.lp-sent h3 { font-size:22px; color:#4ade80; margin-bottom:8px; }
.lp-sent p { color:#64748b; margin-bottom:20px; }

/* ===== FOOTER ===== */
.lp-footer { background:#040810; border-top:1px solid rgba(255,255,255,.06); padding:60px 60px 28px; }
.lp-footer-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; margin-bottom:40px; }
.lp-footer-brand p { color:#475569; font-size:14px; line-height:1.6; margin-top:12px; max-width:300px; }
.lp-footer-links b { display:block; color:#e2e8f0; margin-bottom:16px; font-size:14px; }
.lp-footer-links a { display:block; color:#475569; font-size:14px; margin-bottom:10px; transition:color .2s,transform .2s; }
.lp-footer-links a:hover { color:#a5b4fc; transform:translateX(4px); }
.lp-footer-bottom { max-width:1200px; margin:0 auto; padding-top:24px; border-top:1px solid rgba(255,255,255,.06); text-align:center; color:#334155; font-size:13px; }

/* ===== MOBILE ===== */
@media (max-width:1024px) {
  .lp-nav,.lp-nav-blur { padding:16px 24px; }
  .lp-links { display:none; position:fixed; top:0; left:0; right:0; bottom:0; z-index:95; flex-direction:column; align-items:center; justify-content:center; gap:24px; background:rgba(6,13,24,.97); backdrop-filter:blur(20px); }
  .lp-links.lp-links-open { display:flex; }
  .lp-links a { font-size:22px; padding:12px 24px; }
  .lp-nav-cta-mobile { display:flex; gap:12px; margin-top:16px; }
  .lp-nav-right .lp-btn-ghost,.lp-nav-right .lp-btn-primary { display:none; }
  .lp-hamburger { display:flex; }
  .lp-hero { padding:100px 24px 70px; }
  .lp-hero-grid { grid-template-columns:1fr; gap:40px; }
  .lp-hero-h1 { font-size:44px; }
  .lp-hero-preview { max-width:500px; margin:0 auto; }
  .lp-f1,.lp-f2,.lp-f3 { display:none; }
  .lp-features-grid { grid-template-columns:1fr 1fr; }
  .lp-steps { grid-template-columns:1fr; padding:0 24px; }
  .lp-section { padding:70px 24px; }
  .lp-contact { grid-template-columns:1fr; }
  .lp-footer { padding:48px 24px 20px; }
  .lp-footer-inner { grid-template-columns:1fr 1fr; gap:32px; }
  .lp-cta-banner { margin:0 24px 80px; padding:60px 24px; }
  .lp-cta-banner h2 { font-size:28px; }
}
@media (max-width:640px) {
  .lp-hero-h1 { font-size:34px; letter-spacing:-1px; }
  .lp-hero-p { font-size:15px; }
  .lp-stats-row { gap:24px; }
  .lp-stat-item strong { font-size:22px; }
  .lp-features-grid { grid-template-columns:1fr; }
  .lp-section-head h2 { font-size:28px; }
  .lp-preview-body { grid-template-columns:1fr; }
  .lp-preview-sidebar { display:none; }
  .lp-preview-kpis { grid-template-columns:1fr 1fr; }
  .lp-footer-inner { grid-template-columns:1fr; gap:24px; }
  .lp-hero-btns { flex-direction:column; }
  .lp-btn-hero-primary,.lp-btn-hero-ghost { width:100%; justify-content:center; }
}
@media (prefers-reduced-motion:reduce) {
  .lp *,.lp *::before,.lp *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
}
`;

export default Landing;