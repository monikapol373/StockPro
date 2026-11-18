import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import CssWarehouse from "../components/CssWarehouse";

const NAV = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const WORDS = ["Inventory.", "Production.", "Suppliers.", "Orders."];

const MODULES = [
  "Inventory", "Suppliers", "Purchase Orders", "Bill of Materials",
  "Production", "Customer Orders", "Stock Movements", "Impact Alerts",
  "Reality Check", "Bottleneck", "Reports", "Backup",
];

const ICONS = {
  box: <path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8" />,
  blocks: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM17 13v7M13 16.5h7" />,
  alert: <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
  truck: <path d="M2 7h12v9H2zM14 10h4l4 4v2h-8M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z" />,
  check: <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />,
  clock: <path d="M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" />,
};

const FEATURES = [
  { icon: "box", title: "Live Inventory", text: "Track every product with stock in, out and adjust. Every change is written to a movement ledger." },
  { icon: "blocks", title: "BOM and Production", text: "See how many units you can build right now and which material is holding you back." },
  { icon: "alert", title: "Impact Chain Alerts", text: "Trace a material shortage to the production order and customer it puts at risk." },
  { icon: "truck", title: "Supplier Risk Score", text: "Rate suppliers on late and fulfilled orders, using your own purchase order history." },
  { icon: "check", title: "Reality Check", text: "Compare system stock with a physical count and apply the correction in one click." },
  { icon: "clock", title: "Bottleneck Detection", text: "Find the slowest stage across procurement, production and dispatch." },
];

const STEPS = [
  { n: "01", title: "Set up your stock", text: "Add products, suppliers and the Bill of Materials for what you build." },
  { n: "02", title: "Run your operations", text: "Place purchase orders, run production, dispatch customer orders. Stock updates itself." },
  { n: "03", title: "Act before it breaks", text: "Alerts, risk scores and bottleneck insights tell you what to fix first." },
];

const ABOUT_POINTS = [
  "One connected flow from supplier to customer",
  "Explainable alerts, no black box",
  "Backup, restore and CSV export built in",
  "Works right in your browser, no setup",
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.7) % 7,
  dur: 6 + (i % 5) * 2,
}));

/* ---------------- hooks ---------------- */
const useTypewriter = (words) => {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = words[idx];
    let delay = deleting ? 45 : 95;
    if (!deleting && text === full) delay = 1500;
    if (deleting && text === "") delay = 350;

    const t = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setIdx((idx + 1) % words.length);
      } else {
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, idx, words]);

  return text;
};

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".ld-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ld-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const useActiveSection = () => {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
};

const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      setVal(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{val}{suffix}</span>;
};

/* ---------------- component ---------------- */
const Landing = () => {
  const active = useActiveSection();
  const typed = useTypewriter(WORDS);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [contactError, setContactError] = useState("");

  useReveal();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 20);
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const parallax = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--rx", `${((0.5 - y) * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(2)}deg`);
  };

  const untilt = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const onContactChange = (e) => setContact({ ...contact, [e.target.name]: e.target.value });

  const onContactSubmit = (e) => {
    e.preventDefault();
    setContactError("");
    if (contact.name.trim().length < 2) return setContactError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) return setContactError("Please enter a valid email.");
    if (contact.message.trim().length < 5) return setContactError("Message is too short.");
    try {
      const old = JSON.parse(localStorage.getItem("sp_contact_messages") || "[]");
      localStorage.setItem(
        "sp_contact_messages",
        JSON.stringify([...old, { ...contact, date: new Date().toISOString() }])
      );
    } catch {
      /* ignore storage errors */
    }
    setSent(true);
    setContact({ name: "", email: "", message: "" });
  };

  return (
    <div className="ld">
      <style>{CSS}</style>
      <div className="ld-progress" style={{ width: `${progress}%` }} />

      {/* ===== NAVBAR ===== */}
      <header className={`ld-nav ${scrolled ? "ld-nav-solid" : ""}`}>
        <a href="#home" onClick={go("home")} className="ld-brand"><Logo size={28} /></a>

        <nav className="ld-links">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)} className={active === n.id ? "ld-active" : ""}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ld-actions">
          <Link to="/login" className="ld-btn ld-btn-ghost">Login</Link>
          <Link to="/register" className="ld-btn ld-btn-primary">Register</Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="home" className="ld-hero" onMouseMove={parallax}>
        <div className="ld-hero-bg" />
        <div className="ld-hero-shade" />
        <div className="ld-orb ld-orb1" />
        <div className="ld-orb ld-orb2" />
        <div className="ld-particles">
          {PARTICLES.map((p, i) => (
            <i key={i} style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
          ))}
        </div>

        <div className="ld-hero-grid">
          <div className="ld-hero-inner">
            <span className="ld-pill"><i /> Inventory and manufacturing control</span>
            <h1>
              Smarter <span className="ld-type">{typed}<em /></span>
              <br />
              Stronger <span className="ld-grad">Production.</span>
            </h1>
            <p>
              StockPro connects your raw materials, suppliers, production and customer orders in one
              platform, so you see a shortage before it becomes a late delivery.
            </p>
            <div className="ld-hero-cta">
              <Link to="/register" className="ld-btn ld-btn-primary ld-lg ld-shine">Get Started Free</Link>
              <a href="#features" onClick={go("features")} className="ld-btn ld-btn-ghost ld-lg">Explore Features</a>
            </div>

            <div className="ld-stats">
              <div><strong><Counter to={13} />+</strong><span>Connected modules</span></div>
              <div><strong><Counter to={6} /></strong><span>Smart insights</span></div>
              <div><strong><Counter to={100} suffix="%" /></strong><span>Movements traced</span></div>
            </div>
          </div>

          <div className="ld-float-wrap">
            <div className="ld-3d">
              <CssWarehouse />
            </div>
            <div className="ld-float ld-f1">
              <span className="ld-dot-r" />
              <div><b>Low stock alert</b><small>Steel Sheets below limit</small></div>
            </div>
            <div className="ld-float ld-f2">
              <div className="ld-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" /><circle cx="18" cy="18" r="15" className="fg" /></svg><b>68%</b></div>
              <div><b>Production</b><small>Overall progress</small></div>
            </div>
            <div className="ld-float ld-f3">
              <span className="ld-dot-g" />
              <div><b>Order dispatched</b><small>CO-2001 shipped</small></div>
            </div>
          </div>
        </div>

        <a href="#features" onClick={go("features")} className="ld-scroll"><span /></a>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="ld-marquee">
        <div className="ld-track">
          {[...MODULES, ...MODULES].map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section id="features" className="ld-section">
        <div className="ld-head ld-reveal">
          <span className="ld-tag">Features</span>
          <h2>Everything your plant needs, in one place</h2>
          <p>Built around the real flow of a small factory, from the supplier's truck to the customer's door.</p>
        </div>
        <div className="ld-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="ld-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="ld-card" onMouseMove={tilt} onMouseLeave={untilt}>
                <span className="ld-icon">
                  <svg viewBox="0 0 24 24">{ICONS[f.icon]}</svg>
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STEPS ===== */}
      <section className="ld-section ld-alt">
        <div className="ld-head ld-reveal">
          <span className="ld-tag">How it works</span>
          <h2>From setup to insight in three steps</h2>
        </div>
        <div className="ld-steps ld-reveal">
          {STEPS.map((s) => (
            <div key={s.n} className="ld-step">
              <span className="ld-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PREVIEW ===== */}
      <section className="ld-section">
        <div className="ld-head ld-reveal">
          <span className="ld-tag">Preview</span>
          <h2>A command center for your plant</h2>
          <p>Sample view of the StockPro dashboard.</p>
        </div>
        <div className="ld-mock-stage">
          <div className="ld-mock-3d">
            <div className="ld-pop ld-pop1"><small>Production</small><b>68%</b></div>
            <div className="ld-pop ld-pop2"><i /><span>Steel Sheets below limit</span></div>
            <div className="ld-mock ld-reveal">
              <div className="ld-mock-bar"><i /><i /><i /><span>stockpro / dashboard</span></div>
              <div className="ld-mock-body">
                <div className="ld-mock-side">
                  <b>StockPro</b>
                  <span className="on">Dashboard</span>
                  <span>Inventory</span>
                  <span>Production</span>
                  <span>Alerts</span>
                  <span>Reports</span>
                </div>
                <div className="ld-mock-main">
                  <div className="ld-mock-cards">
                    <div><small>Stock Value</small><strong>₹ 12.4L</strong></div>
                    <div><small>Open Orders</small><strong>48</strong></div>
                    <div><small>In Production</small><strong>12</strong></div>
                    <div className="warn"><small>Low Stock</small><strong>7</strong></div>
                  </div>
                  <div className="ld-mock-row">
                    <div className="ld-mock-chart">
                      <small>Production vs Demand</small>
                      <div className="bars">
                        {[40, 62, 48, 75, 58, 82, 66].map((h, i) => (
                          <span key={i} style={{ height: `${h}%`, transitionDelay: `${i * 90}ms` }} />
                        ))}
                      </div>
                    </div>
                    <div className="ld-mock-alerts">
                      <small>Critical Alerts</small>
                      <p><i className="r" /> Steel Sheets shortage</p>
                      <p><i className="a" /> PO-1002 delayed</p>
                      <p><i className="g" /> Stock adjusted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="ld-section ld-alt">
        <div className="ld-about">
          <div className="ld-reveal">
            <span className="ld-tag">About</span>
            <h2>Built to remove the guesswork from manufacturing</h2>
            <p>
              Small factories often find out about a shortage when a customer order is already late.
              StockPro links materials, suppliers, production and orders, so the whole chain is visible
              early and every decision is backed by your own data.
            </p>
            <ul>
              {ABOUT_POINTS.map((p) => (
                <li key={p}><span>✓</span>{p}</li>
              ))}
            </ul>
          </div>
          <div className="ld-about-card ld-reveal">
            <h3>The problem we solve</h3>
            <p>Disconnected data, late shortage discovery and no clear root cause.</p>
            <h3>How StockPro helps</h3>
            <p>One connected flow, early warnings through Impact Chain, and clear reasons behind every alert.</p>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="ld-section">
        <div className="ld-head ld-reveal">
          <span className="ld-tag">Contact</span>
          <h2>Get in touch</h2>
          <p>Have a question or feedback? Send a message.</p>
        </div>
        <div className="ld-contact ld-reveal">
          <div className="ld-contact-info">
            <div><span>📧</span><div><b>Email</b><p>monika@gmail.com</p></div></div>
            <div><span>📍</span><div><b>Location</b><p>Pune, Maharashtra, India</p></div></div>
            <div><span>🕘</span><div><b>Working hours</b><p>Mon to Sat, 9 AM to 6 PM</p></div></div>
          </div>

          <form className="ld-form" onSubmit={onContactSubmit}>
            {sent ? (
              <div className="ld-sent">
                <h3>Message sent</h3>
                <p>Thank you for reaching out. We will get back to you soon.</p>
                <button type="button" className="ld-btn ld-btn-ghost" onClick={() => setSent(false)}>Send another</button>
              </div>
            ) : (
              <>
                <input name="name" value={contact.name} onChange={onContactChange} placeholder="Your name" />
                <input name="email" value={contact.email} onChange={onContactChange} placeholder="Your email" />
                <textarea name="message" rows="4" value={contact.message} onChange={onContactChange} placeholder="Your message" />
                {contactError && <p className="ld-form-error">{contactError}</p>}
                <button type="submit" className="ld-btn ld-btn-primary ld-lg ld-shine">Send Message</button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="ld-cta ld-reveal">
        <h2>Ready to take control of your stock?</h2>
        <p>Create your account and see your whole plant in one place.</p>
        <div className="ld-hero-cta" style={{ justifyContent: "center" }}>
          <Link to="/register" className="ld-btn ld-btn-light ld-lg">Get Started</Link>
          <Link to="/login" className="ld-btn ld-btn-ghost ld-lg">Login</Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="ld-footer">
        <div className="ld-footer-top">
          <div>
            <Logo size={24} />
            <p>Inventory and manufacturing control for modern small factories.</p>
          </div>
          <div>
            <b>Product</b>
            <a href="#features" onClick={go("features")}>Features</a>
            <a href="#about" onClick={go("about")}>About</a>
            <a href="#contact" onClick={go("contact")}>Contact</a>
          </div>
          <div>
            <b>Account</b>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <div className="ld-footer-bottom">StockPro v1.0 · Industrial Operations Platform</div>
      </footer>

      <a href="#home" onClick={go("home")} className={`ld-top ${scrolled ? "ld-top-show" : ""}`} aria-label="Back to top">↑</a>
    </div>
  );
};

/* ---------------- styles (kept inside this file on purpose) ---------------- */
const CSS = `
html { scroll-behavior: smooth; }
.ld { background:#060d18; color:#eaf2f8; font-family:"Segoe UI",system-ui,sans-serif; overflow-x:hidden; }
.ld a { color:inherit; text-decoration:none; }
.ld * { box-sizing:border-box; }

.ld-progress { position:fixed; top:0; left:0; height:3px; z-index:100; background:linear-gradient(90deg,#3b82f6,#22d3ee); box-shadow:0 0 12px #22d3ee; transition:width .1s linear; }

/* ---- navbar: always ONE line ---- */
.ld-nav { position:fixed; top:0; left:0; right:0; z-index:60; display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; justify-content:space-between; gap:20px; padding:18px 56px; transition:background .3s,padding .3s,box-shadow .3s; }
.ld-nav-solid { background:rgba(6,13,24,.82); backdrop-filter:blur(16px); padding:11px 56px; box-shadow:0 1px 0 rgba(255,255,255,.08), 0 10px 30px rgba(0,0,0,.35); }
.ld-brand { flex-shrink:0; }
.ld-links { display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:6px; }
.ld-links a { position:relative; white-space:nowrap; padding:9px 18px; color:#b9c7d8; font-size:14.5px; font-weight:500; transition:color .2s; }
.ld-links a::after { content:""; position:absolute; left:18px; right:18px; bottom:3px; height:2px; border-radius:2px; background:linear-gradient(90deg,#3b82f6,#22d3ee); transform:scaleX(0); transform-origin:left; transition:transform .3s; }
.ld-links a:hover, .ld-links a.ld-active { color:#fff; }
.ld-links a:hover::after, .ld-links a.ld-active::after { transform:scaleX(1); }
.ld-actions { display:flex; flex-direction:row; flex-wrap:nowrap; gap:10px; flex-shrink:0; }

.ld-btn { position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; white-space:nowrap; padding:9px 22px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:1px solid transparent; transition:transform .2s,box-shadow .25s,background .2s; }
.ld-btn-primary { background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff !important; }
.ld-btn-primary:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(37,99,235,.55); }
.ld-btn-ghost { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.3); color:#fff !important; }
.ld-btn-ghost:hover { background:rgba(255,255,255,.15); transform:translateY(-3px); }
.ld-btn-light { background:#fff; color:#1d4ed8 !important; }
.ld-btn-light:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(255,255,255,.3); }
.ld-lg { padding:15px 34px; font-size:15.5px; border-radius:12px; }
.ld-shine::after { content:""; position:absolute; top:0; left:-120%; width:60%; height:100%; background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent); transform:skewX(-20deg); animation:ldShine 3.2s ease-in-out infinite; }
@keyframes ldShine { 0%{left:-120%} 55%,100%{left:170%} }

/* ---- hero ---- */
.ld-hero { position:relative; min-height:100vh; display:flex; align-items:center; padding:120px 56px 90px; overflow:hidden; background:#060d18; }
.ld-hero-bg { position:absolute; inset:-4%; background:url('/factory-bg.png') center/cover no-repeat; animation:ldKen 24s ease-in-out infinite alternate; }
@keyframes ldKen { from{transform:scale(1) translateX(0)} to{transform:scale(1.14) translateX(-2%)} }
.ld-hero-shade { position:absolute; inset:0; background:linear-gradient(90deg,rgba(4,9,20,.94) 0%,rgba(4,9,20,.7) 50%,rgba(4,9,20,.3) 100%), linear-gradient(180deg,transparent 65%,#060d18 100%); }
.ld-orb { position:absolute; border-radius:50%; filter:blur(90px); opacity:.45; pointer-events:none; animation:ldOrb 12s ease-in-out infinite; }
.ld-orb1 { width:440px; height:440px; background:#2563eb; top:-120px; left:-100px; }
.ld-orb2 { width:380px; height:380px; background:#06b6d4; bottom:-120px; right:6%; animation-delay:-6s; }
@keyframes ldOrb { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-50px)} }
.ld-particles { position:absolute; inset:0; pointer-events:none; }
.ld-particles i { position:absolute; border-radius:50%; background:#67e8f9; opacity:0; animation:ldRise linear infinite; box-shadow:0 0 8px #22d3ee; }
@keyframes ldRise { 0%{transform:translateY(40px);opacity:0} 20%{opacity:.8} 100%{transform:translateY(-160px);opacity:0} }

.ld-hero-grid { position:relative; z-index:2; width:100%; max-width:1240px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; }
.ld-hero-inner { max-width:660px; animation:ldUp 1s ease both; }
@keyframes ldUp { from{opacity:0;transform:translateY(34px)} to{opacity:1;transform:none} }
.ld-pill { display:inline-flex; align-items:center; gap:9px; padding:8px 17px; border-radius:99px; margin-bottom:24px; background:rgba(59,130,246,.16); border:1px solid rgba(59,130,246,.45); color:#93c5fd; font-size:13px; font-weight:600; }
.ld-pill i { width:8px; height:8px; border-radius:50%; background:#22d3ee; animation:ldPulse 1.6s ease-in-out infinite; }
@keyframes ldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,.7)} 50%{box-shadow:0 0 0 8px rgba(34,211,238,0)} }
.ld-hero h1 { font-size:58px; line-height:1.08; font-weight:800; letter-spacing:-1.5px; margin-bottom:24px; }
.ld-type { color:#fff; border-bottom:3px solid #3b82f6; }
.ld-type em { display:inline-block; width:3px; height:.85em; margin-left:4px; vertical-align:-4px; background:#22d3ee; animation:ldBlink 1s step-end infinite; }
@keyframes ldBlink { 50%{opacity:0} }
.ld-grad { background:linear-gradient(90deg,#3b82f6,#22d3ee,#3b82f6); background-size:200% auto; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:ldFlow 4s linear infinite; }
@keyframes ldFlow { to{background-position:200% center} }
.ld-hero p { font-size:17.5px; line-height:1.75; color:#c3d0e0; max-width:560px; margin-bottom:34px; }
.ld-hero-cta { display:flex; gap:14px; flex-wrap:wrap; }
.ld-stats { display:flex; gap:46px; margin-top:56px; flex-wrap:wrap; }
.ld-stats strong { display:block; font-size:34px; font-weight:800; }
.ld-stats span { color:#94a8bf; font-size:13px; }

.ld-float-wrap { position:relative; height:540px; }
.ld-float { position:absolute; display:flex; align-items:center; gap:14px; padding:16px 20px; border-radius:16px; background:rgba(12,22,40,.7); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.14); box-shadow:0 20px 50px rgba(0,0,0,.5); animation:ldFloat 6s ease-in-out infinite; }
.ld-float b { display:block; font-size:14.5px; }
.ld-float small { color:#94a8bf; font-size:12.5px; }
.ld-f1 { top:6px; right:0; }
.ld-f2 { bottom:110px; left:-18px; animation-delay:-2s; }
.ld-f3 { bottom:6px; right:14px; animation-delay:-4s; }
@keyframes ldFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
.ld-dot-r, .ld-dot-g { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
.ld-dot-r { background:#ef4444; animation:ldRed 1.4s ease-in-out infinite; }
.ld-dot-g { background:#22c55e; box-shadow:0 0 12px #22c55e; }
@keyframes ldRed { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.7)} 50%{box-shadow:0 0 0 10px rgba(239,68,68,0)} }
.ld-ring { position:relative; width:46px; height:46px; flex-shrink:0; }
.ld-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
.ld-ring circle { fill:none; stroke:rgba(255,255,255,.15); stroke-width:4; }
.ld-ring circle.fg { stroke:#22d3ee; stroke-linecap:round; stroke-dasharray:94; stroke-dashoffset:94; animation:ldRing 2.4s ease .6s forwards; }
@keyframes ldRing { to{stroke-dashoffset:30} }
.ld-ring b { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; }

.ld-scroll { position:absolute; bottom:26px; left:50%; transform:translateX(-50%); z-index:3; width:26px; height:42px; border:2px solid rgba(255,255,255,.4); border-radius:14px; }
.ld-scroll span { position:absolute; top:7px; left:50%; width:4px; height:8px; margin-left:-2px; border-radius:2px; background:#22d3ee; animation:ldWheel 1.8s ease-in-out infinite; }
@keyframes ldWheel { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(16px);opacity:0} }

/* ---- marquee ---- */
.ld-marquee { overflow:hidden; border-top:1px solid rgba(255,255,255,.08); border-bottom:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.02); padding:18px 0; }
.ld-track { display:flex; gap:44px; width:max-content; animation:ldScroll 38s linear infinite; }
.ld-track span { white-space:nowrap; color:#9fb3c9; font-size:15px; font-weight:500; }
.ld-marquee:hover .ld-track { animation-play-state:paused; }
@keyframes ldScroll { to{transform:translateX(-50%)} }

/* ---- sections ---- */
.ld-section { padding:110px 56px; max-width:1240px; margin:0 auto; }
.ld-alt { max-width:none; background:linear-gradient(180deg,#08111f,#0a1627); }
.ld-alt > * { max-width:1128px; margin-left:auto; margin-right:auto; }
.ld-head { text-align:center; margin-bottom:56px; }
.ld-tag { display:inline-block; padding:6px 15px; border-radius:99px; margin-bottom:16px; background:rgba(34,211,238,.12); color:#67e8f9; font-size:12.5px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; }
.ld-head h2, .ld-about h2 { font-size:40px; font-weight:800; letter-spacing:-.6px; margin-bottom:14px; }
.ld-head p { color:#94a8bf; font-size:16.5px; max-width:600px; margin:0 auto; }
.ld-reveal { opacity:0; transform:translateY(36px); transition:opacity .8s ease,transform .8s ease; }
.ld-reveal.ld-in { opacity:1; transform:none; }

.ld-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.ld-card { position:relative; overflow:hidden; background:linear-gradient(160deg,rgba(20,34,58,.9),rgba(11,20,36,.9)); border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:30px; transition:opacity .8s ease,transform .3s,border-color .3s,box-shadow .3s; }
.ld-card::before { content:""; position:absolute; inset:0; background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(59,130,246,.28),transparent 70%); opacity:0; transition:opacity .3s; pointer-events:none; }
.ld-card:hover::before { opacity:1; }
.ld-card:hover { border-color:rgba(59,130,246,.7); box-shadow:0 20px 50px rgba(37,99,235,.28); }
.ld-icon { position:relative; display:flex; align-items:center; justify-content:center; width:56px; height:56px; border-radius:14px; font-size:26px; margin-bottom:20px; background:rgba(59,130,246,.16); border:1px solid rgba(59,130,246,.38); transition:transform .4s; }
.ld-card:hover .ld-icon { transform:rotate(-8deg) scale(1.12); }
.ld-card h3 { position:relative; font-size:19px; margin-bottom:10px; }
.ld-card p { position:relative; color:#94a8bf; font-size:14.8px; line-height:1.7; }

.ld-steps { position:relative; display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.ld-steps::before { content:""; position:absolute; top:58px; left:16%; width:0; height:2px; background:linear-gradient(90deg,#3b82f6,#22d3ee); transition:width 1.6s ease .4s; }
.ld-steps.ld-in::before { width:68%; }
.ld-step { position:relative; padding:32px; border-radius:18px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.09); transition:transform .3s,border-color .3s; }
.ld-step:hover { transform:translateY(-6px); border-color:rgba(34,211,238,.5); }
.ld-step-n { display:block; font-size:46px; font-weight:800; margin-bottom:10px; background:linear-gradient(90deg,#3b82f6,#22d3ee); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.ld-step h3 { font-size:20px; margin-bottom:9px; }
.ld-step p { color:#94a8bf; font-size:14.8px; line-height:1.7; }

.ld-mock { border-radius:18px; overflow:hidden; border:1px solid rgba(255,255,255,.12); background:#0a1424; box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 70px rgba(37,99,235,.18); }
.ld-mock-bar { display:flex; align-items:center; gap:7px; padding:13px 16px; background:#0d1a2e; border-bottom:1px solid rgba(255,255,255,.08); }
.ld-mock-bar i { width:10px; height:10px; border-radius:50%; }
.ld-mock-bar i:nth-child(1){background:#ef4444} .ld-mock-bar i:nth-child(2){background:#f59e0b} .ld-mock-bar i:nth-child(3){background:#22c55e}
.ld-mock-bar span { margin-left:12px; color:#6f849c; font-size:12px; }
.ld-mock-body { display:grid; grid-template-columns:190px 1fr; min-height:350px; }
.ld-mock-side { padding:18px 14px; background:#08111f; border-right:1px solid rgba(255,255,255,.07); display:flex; flex-direction:column; gap:6px; }
.ld-mock-side b { color:#3b82f6; font-size:17px; margin-bottom:12px; }
.ld-mock-side span { padding:9px 12px; border-radius:8px; color:#8fa3bb; font-size:13px; }
.ld-mock-side span.on { background:rgba(59,130,246,.22); color:#fff; }
.ld-mock-main { padding:20px; }
.ld-mock-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:14px; }
.ld-mock-cards div { padding:14px; border-radius:12px; background:#0f1d33; border:1px solid rgba(255,255,255,.07); }
.ld-mock-cards small, .ld-mock-chart small, .ld-mock-alerts small { display:block; color:#7f93aa; font-size:11.5px; margin-bottom:6px; }
.ld-mock-cards strong { font-size:22px; }
.ld-mock-cards .warn strong { color:#f87171; }
.ld-mock-row { display:grid; grid-template-columns:1.4fr 1fr; gap:12px; }
.ld-mock-chart, .ld-mock-alerts { padding:14px; border-radius:12px; background:#0f1d33; border:1px solid rgba(255,255,255,.07); min-height:150px; }
.bars { display:flex; align-items:flex-end; gap:10px; height:105px; }
.bars span { flex:1; border-radius:6px 6px 0 0; background:linear-gradient(180deg,#22d3ee,#2563eb); transform:scaleY(0); transform-origin:bottom; transition:transform .9s cubic-bezier(.2,.8,.2,1); }
.ld-mock.ld-in .bars span { transform:scaleY(1); }
.ld-mock-alerts p { font-size:12.5px; color:#c3d0e0; margin:10px 0; display:flex; align-items:center; gap:8px; }
.ld-mock-alerts i { width:8px; height:8px; border-radius:50%; }
.ld-mock-alerts i.r { background:#ef4444; animation:ldRed 1.4s ease-in-out infinite; } .ld-mock-alerts i.a { background:#f59e0b; } .ld-mock-alerts i.g { background:#22c55e; }

.ld-about { display:grid; grid-template-columns:1.2fr 1fr; gap:56px; align-items:center; }
.ld-about h2 { text-align:left; }
.ld-about p { color:#a9b9cc; line-height:1.8; margin-bottom:24px; }
.ld-about ul { list-style:none; margin:0; padding:0; display:grid; gap:14px; }
.ld-about li { display:flex; gap:13px; align-items:center; color:#dbe6f3; }
.ld-about li span { display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:rgba(34,197,94,.2); color:#4ade80; font-size:13px; font-weight:700; }
.ld-about-card { padding:36px; border-radius:18px; background:linear-gradient(160deg,rgba(37,99,235,.22),rgba(11,20,36,.92)); border:1px solid rgba(59,130,246,.38); }
.ld-about-card h3 { color:#93c5fd; font-size:15px; margin:0 0 8px; }
.ld-about-card p { margin-bottom:24px; }
.ld-about-card p:last-child { margin-bottom:0; }

.ld-contact { display:grid; grid-template-columns:1fr 1.3fr; gap:28px; }
.ld-contact-info { display:flex; flex-direction:column; gap:16px; }
.ld-contact-info > div { display:flex; gap:16px; align-items:center; padding:22px; border-radius:16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); transition:transform .3s,border-color .3s; }
.ld-contact-info > div:hover { transform:translateX(8px); border-color:rgba(59,130,246,.6); }
.ld-contact-info > div > span { font-size:22px; width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:13px; background:rgba(59,130,246,.16); }
.ld-contact-info b { display:block; margin-bottom:3px; }
.ld-contact-info p { margin:0; color:#94a8bf; font-size:14px; }
.ld-form { display:flex; flex-direction:column; gap:14px; padding:30px; border-radius:18px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); }
.ld-form input, .ld-form textarea { width:100%; padding:14px 16px; border-radius:10px; font:inherit; font-size:14.5px; background:rgba(5,11,22,.85); color:#eaf2f8; border:1px solid rgba(255,255,255,.14); outline:none; resize:vertical; transition:border-color .2s,box-shadow .2s; }
.ld-form input:focus, .ld-form textarea:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.25); }
.ld-form-error { margin:0; color:#fca5a5; font-size:13.5px; }
.ld-sent { text-align:center; padding:30px 10px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.ld-sent h3 { margin:0; color:#4ade80; font-size:24px; }
.ld-sent p { margin:0; color:#94a8bf; }

.ld-cta { position:relative; overflow:hidden; max-width:1128px; margin:0 auto 100px; padding:72px 30px; text-align:center; border-radius:24px; background:linear-gradient(135deg,#1d4ed8,#0e7490,#1d4ed8); background-size:220% 220%; animation:ldBg 9s ease infinite; border:1px solid rgba(255,255,255,.18); }
@keyframes ldBg { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
.ld-cta h2 { font-size:36px; margin:0 0 12px; }
.ld-cta p { color:#d4e3f8; margin:0 0 30px; }

.ld-footer { background:#040a14; border-top:1px solid rgba(255,255,255,.08); padding:56px 56px 24px; }
.ld-footer-top { max-width:1128px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr; gap:40px; }
.ld-footer-top p { color:#7f93aa; font-size:14px; margin:12px 0 0; max-width:320px; line-height:1.65; }
.ld-footer-top b { display:block; margin-bottom:14px; }
.ld-footer-top a { display:block; color:#8fa3bb; font-size:14px; margin-bottom:10px; transition:color .2s,transform .2s; }
.ld-footer-top a:hover { color:#fff; transform:translateX(4px); }
.ld-footer-bottom { max-width:1128px; margin:38px auto 0; padding-top:22px; border-top:1px solid rgba(255,255,255,.08); text-align:center; color:#5f7389; font-size:13px; }

.ld-top { position:fixed; right:26px; bottom:26px; z-index:70; width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:20px; background:linear-gradient(135deg,#2563eb,#06b6d4); box-shadow:0 10px 26px rgba(37,99,235,.5); opacity:0; transform:translateY(20px); pointer-events:none; transition:opacity .3s,transform .3s; }
.ld-top-show { opacity:1; transform:none; pointer-events:auto; }

@media (max-width:1000px) {
  .ld-nav, .ld-nav-solid { padding-left:18px; padding-right:18px; gap:10px; }
  .ld-hero { padding:110px 20px 80px; }
  .ld-hero-grid { grid-template-columns:1fr; }
  .ld-float-wrap { height:340px; }
  .ld-float { display:none; }
  .ld-hero h1 { font-size:46px; }
  .ld-section { padding:80px 20px; }
  .ld-grid, .ld-steps { grid-template-columns:1fr 1fr; }
  .ld-steps::before { display:none; }
  .ld-about, .ld-contact { grid-template-columns:1fr; }
  .ld-mock-body { grid-template-columns:1fr; }
  .ld-mock-side { display:none; }
  .ld-mock-cards { grid-template-columns:1fr 1fr; }
  .ld-footer { padding:44px 20px 20px; }
}
@media (max-width:680px) {
  .ld-links a { padding:8px 7px; font-size:12.5px; }
  .ld-links { gap:0; }
  .ld-links a::after { left:7px; right:7px; }
  .ld-brand .sp-logo span:last-child { display:none; }
  .ld-btn { padding:8px 13px; font-size:13px; }
  .ld-grid, .ld-steps, .ld-mock-row, .ld-footer-top { grid-template-columns:1fr; }
  .ld-hero h1 { font-size:36px; }
  .ld-head h2, .ld-about h2 { font-size:28px; }
  .ld-stats { gap:26px; }
}
@media (prefers-reduced-motion: reduce) {
  .ld *, .ld *::before, .ld *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
}

/* ---- 3D layer ---- */
.ld-3d { position:absolute; inset:0; transform:rotateX(calc(var(--py,0) * -7deg)) rotateY(calc(var(--px,0) * 11deg)); transition:transform .25s ease-out; }
.ld-3d .cw-stage { --cw-scale:.86; }
.ld-float { translate:calc(var(--px,0) * -28px) calc(var(--py,0) * -20px); }
.ld-track span::before { content:"◆"; color:#22d3ee; margin-right:14px; font-size:9px; vertical-align:2px; }
.ld-grid > div { display:flex; }
.ld-grid > div > .ld-card { width:100%; }
.ld-card { transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transform-style:preserve-3d; transition:transform .18s ease-out,border-color .3s,box-shadow .3s; }
.ld-card:hover { translate:0 -8px; }
.ld-icon svg { width:26px; height:26px; fill:none; stroke:#67e8f9; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.ld-icon { transform:translateZ(34px); }
.ld-card h3 { transform:translateZ(22px); }
.ld-card p { transform:translateZ(14px); }
.ld-card:hover .ld-icon { transform:translateZ(48px) rotate(-8deg) scale(1.12); }
.ld-mock-stage { perspective:1800px; padding:34px 0; }
.ld-mock-3d { position:relative; transform-style:preserve-3d; transform:rotateX(9deg) rotateY(-11deg); transition:transform .7s cubic-bezier(.2,.8,.2,1); }
.ld-mock-stage:hover .ld-mock-3d { transform:rotateX(2deg) rotateY(-2deg); }
.ld-pop { position:absolute; z-index:5; display:flex; flex-direction:column; gap:3px; padding:14px 20px; border-radius:16px; background:rgba(12,22,40,.82); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.18); box-shadow:0 26px 50px rgba(0,0,0,.55); animation:ldFloat 6s ease-in-out infinite; }
.ld-pop b { font-size:26px; } .ld-pop small { color:#94a8bf; font-size:11.5px; }
.ld-pop1 { top:-30px; right:-18px; translate:0 0 90px; }
.ld-pop2 { bottom:34px; left:-26px; flex-direction:row; align-items:center; gap:10px; font-size:13px; translate:0 0 70px; animation-delay:-3s; }
.ld-pop2 i { width:10px; height:10px; border-radius:50%; background:#ef4444; animation:ldRed 1.4s ease-in-out infinite; }
@media (max-width:1000px) { .ld-mock-3d { transform:none; } .ld-pop { display:none; } }
`;

export default Landing;