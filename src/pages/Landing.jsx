import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const T = {
  en: {
    words: ["Inventory.", "Production.", "Suppliers.", "Orders.", "Growth."],
    tagline: "NEXT-GEN INVENTORY INTELLIGENCE",
    headline1: "Control Your",
    subtext: "Connect raw materials, suppliers, production and customer orders in one intelligent platform. See every problem before it becomes a crisis.",
    explore: "Explore Platform",
    exploreFeatures: "Explore Features",
    getStarted: "Get Started ↗",
    getStartedFree: "Get Started Free →",
    login: "Login",
    scrollExplore: "SCROLL TO EXPLORE",
    modules: "Modules",
    traceability: "Traceability",
    live: "Live",
    liveStock: "Stock Updates",
    inv01: "01 / 05 — INVENTORY",
    inv_h: "Intelligence.",
    inv_p: "Track. Manage. Optimize.",
    inv_sm: "Interactive stock visualization. Every cube represents a product, every movement updates your inventory.",
    inv_btn: "Explore Inventory →",
    prod01: "02 / 05 — PRODUCTION",
    prod_h: "Automation.",
    prod_p: "Automate. Accelerate. Scale.",
    prod_sm: "Watch your production pipeline with real-time progress tracking and smart manufacturing insights.",
    prod_btn: "Explore Production →",
    supply01: "03 / 05 — SUPPLY CHAIN",
    supply_h: "One connected",
    supply_h2: "ecosystem.",
    supply_p: "Connect. Collaborate. Deliver.",
    supplyNodes: [["🏭", "Suppliers", "Procurement"], ["📦", "Inventory", "Stock Management"], ["⚙️", "Production", "Manufacturing"], ["🚚", "Orders", "Delivery"]],
    ai01: "04 / 05 — AI ASSISTANT",
    ai_h: "Meet your",
    ai_h2: "AI Assistant.",
    ai_p: "Ask. Analyze. Act.",
    ai_sm: "Get intelligent insights, demand forecasts and operational recommendations.",
    ai_activate: "Activate AI →",
    ai_deactivate: "Deactivate AI →",
    feat01: "05 / 05 — PLATFORM FEATURES",
    feat_h: "Everything your business",
    feat_h2: "needs.",
    feat_p: "Powerful tools designed for modern manufacturing workflows.",
    features: [
      { icon: "📦", title: "Live Inventory", text: "Real-time stock tracking with every movement recorded.", color: "#00c8ff" },
      { icon: "🏭", title: "BOM & Production", text: "Build smarter with complete production visibility.", color: "#a78bfa" },
      { icon: "⚡", title: "Impact Alerts", text: "Find shortages before they affect customer orders.", color: "#ff9d42" },
      { icon: "🚚", title: "Supplier Risk", text: "Track supplier performance and delivery reliability.", color: "#00e5a0" },
      { icon: "📊", title: "Smart Reports", text: "PDF, Excel, GST invoices and business analytics.", color: "#ed70e8" },
      { icon: "🔍", title: "Bottleneck Detection", text: "Identify operational bottlenecks instantly.", color: "#818cf8" },
    ],
    how_num: "HOW IT WORKS",
    how_h: "Three steps.",
    how_h2: "Total control.",
    steps: [
      { n: "01", icon: "🗂️", title: "Set up your stock", text: "Add products, suppliers and bills of materials." },
      { n: "02", icon: "⚙️", title: "Run operations", text: "Manage orders, production and dispatch." },
      { n: "03", icon: "🎯", title: "Act on insights", text: "Use alerts and analytics to make smarter decisions." },
    ],
    about_num: "ABOUT STOCKPRO",
    about_h: "Built to remove the",
    about_h2: "guesswork.",
    about_p: "Small factories often discover shortages when customer orders are already late. StockPro connects every part of your operation so you stay one step ahead.",
    about_points: ["One connected flow from supplier to customer", "Explainable alerts — no black box", "PDF, Excel & GST reports built in", "Multi-user roles — Admin, Manager, Staff", "Real-time sync across devices"],
    contact_num: "CONTACT",
    contact_h: "Let's build something",
    contact_h2: "great.",
    contact_p: "Have a question or want to collaborate? We'd love to hear from you.",
    contactInfo: [["✉", "Email", "polmonika7@gmail.com"], ["⌖", "Location", "Pune, Maharashtra, India"], ["◷", "Hours", "Mon–Sat, 9 AM to 6 PM"]],
    name_ph: "Your name",
    email_ph: "Your email",
    msg_ph: "Your message",
    send: "Send Message →",
    sent_h: "Message saved!",
    sent_p: "Your message has been saved in this browser.",
    send_another: "Send another",
    cta_num: "READY FOR THE NEXT LEVEL?",
    cta_h: "Take control of your",
    cta_h2: "entire operation.",
    cta_p: "Everything connected. Every decision smarter. Every operation under control.",
    footer_p: "Inventory and manufacturing control for modern businesses.",
    footer_platform: "Platform",
    footer_account: "Account",
    footer_features: "Features",
    footer_how: "How it works",
    footer_about: "About",
    footer_contact: "Contact",
    footer_copy: `© ${new Date().getFullYear()} StockPro · Industrial Operations Platform · Made with ❤️ in Pune`,
    navLinks: [["features", "Features"], ["how-it-works", "How it works"], ["about", "About"], ["contact", "Contact"]],
  },
  hi: {
    words: ["इन्वेंटरी।", "उत्पादन।", "सप्लायर।", "ऑर्डर।", "विकास।"],
    tagline: "नेक्स्ट-जेन इन्वेंटरी इंटेलिजेंस",
    headline1: "नियंत्रण करें अपना",
    subtext: "कच्चे माल, सप्लायर, उत्पादन और ग्राहक ऑर्डर को एक स्मार्ट प्लेटफॉर्म में जोड़ें। हर समस्या को संकट बनने से पहले देखें।",
    explore: "प्लेटफॉर्म देखें",
    exploreFeatures: "फीचर्स देखें",
    getStarted: "शुरू करें ↗",
    getStartedFree: "मुफ्त शुरू करें →",
    login: "लॉगिन",
    scrollExplore: "नीचे स्क्रॉल करें",
    modules: "मॉड्यूल",
    traceability: "ट्रेसेबिलिटी",
    live: "लाइव",
    liveStock: "स्टॉक अपडेट",
    inv01: "01 / 05 — इन्वेंटरी",
    inv_h: "इंटेलिजेंस।",
    inv_p: "ट्रैक। प्रबंधन। ऑप्टिमाइज़।",
    inv_sm: "इंटरएक्टिव स्टॉक विज़ुअलाइज़ेशन। हर क्यूब एक उत्पाद है, हर मूवमेंट आपका इन्वेंटरी अपडेट करता है।",
    inv_btn: "इन्वेंटरी देखें →",
    prod01: "02 / 05 — उत्पादन",
    prod_h: "ऑटोमेशन।",
    prod_p: "स्वचालित। त्वरित। स्केल।",
    prod_sm: "रियल-टाइम प्रोग्रेस ट्रैकिंग के साथ अपनी उत्पादन पाइपलाइन देखें।",
    prod_btn: "उत्पादन देखें →",
    supply01: "03 / 05 — सप्लाई चेन",
    supply_h: "एक जुड़ा हुआ",
    supply_h2: "इकोसिस्टम।",
    supply_p: "जोड़ें। सहयोग करें। डिलीवर करें।",
    supplyNodes: [["🏭", "सप्लायर", "खरीद"], ["📦", "इन्वेंटरी", "स्टॉक प्रबंधन"], ["⚙️", "उत्पादन", "निर्माण"], ["🚚", "ऑर्डर", "डिलीवरी"]],
    ai01: "04 / 05 — AI असिस्टेंट",
    ai_h: "मिलिए अपने",
    ai_h2: "AI असिस्टेंट से।",
    ai_p: "पूछें। विश्लेषण करें। काम करें।",
    ai_sm: "स्मार्ट इनसाइट, डिमांड फोरकास्ट और ऑपरेशनल रेकमेंडेशन पाएं।",
    ai_activate: "AI सक्रिय करें →",
    ai_deactivate: "AI बंद करें →",
    feat01: "05 / 05 — प्लेटफॉर्म फीचर्स",
    feat_h: "आपके व्यवसाय की हर",
    feat_h2: "जरूरत।",
    feat_p: "आधुनिक विनिर्माण के लिए शक्तिशाली टूल्स।",
    features: [
      { icon: "📦", title: "लाइव इन्वेंटरी", text: "हर मूवमेंट रिकॉर्ड के साथ रियल-टाइम स्टॉक ट्रैकिंग।", color: "#00c8ff" },
      { icon: "🏭", title: "BOM और उत्पादन", text: "पूर्ण उत्पादन दृश्यता के साथ स्मार्ट निर्माण।", color: "#a78bfa" },
      { icon: "⚡", title: "इम्पैक्ट अलर्ट", text: "कमी को ग्राहक ऑर्डर प्रभावित करने से पहले खोजें।", color: "#ff9d42" },
      { icon: "🚚", title: "सप्लायर रिस्क", text: "सप्लायर प्रदर्शन और डिलीवरी विश्वसनीयता ट्रैक करें।", color: "#00e5a0" },
      { icon: "📊", title: "स्मार्ट रिपोर्ट", text: "PDF, Excel, GST इनवॉइस और बिजनेस एनालिटिक्स।", color: "#ed70e8" },
      { icon: "🔍", title: "बॉटलनेक डिटेक्शन", text: "ऑपरेशनल बाधाओं को तुरंत पहचानें।", color: "#818cf8" },
    ],
    how_num: "यह कैसे काम करता है",
    how_h: "तीन चरण।",
    how_h2: "पूरा नियंत्रण।",
    steps: [
      { n: "01", icon: "🗂️", title: "स्टॉक सेट करें", text: "उत्पाद, सप्लायर और BOM जोड़ें।" },
      { n: "02", icon: "⚙️", title: "ऑपरेशन चलाएं", text: "ऑर्डर, उत्पादन और डिस्पैच प्रबंधित करें।" },
      { n: "03", icon: "🎯", title: "इनसाइट पर काम करें", text: "स्मार्ट निर्णय के लिए अलर्ट और एनालिटिक्स उपयोग करें।" },
    ],
    about_num: "StockPro के बारे में",
    about_h: "बनाया गया अनुमान हटाने के लिए।",
    about_h2: "",
    about_p: "छोटी फैक्ट्रियां अक्सर कमी तब पता करती हैं जब ग्राहक ऑर्डर पहले से देर हो चुके होते हैं। StockPro आपके हर ऑपरेशन को जोड़ता है।",
    about_points: ["सप्लायर से ग्राहक तक एक जुड़ा हुआ प्रवाह", "समझाने योग्य अलर्ट — कोई ब्लैक बॉक्स नहीं", "PDF, Excel और GST रिपोर्ट बिल्ट-इन", "मल्टी-यूजर रोल — Admin, Manager, Staff", "डिवाइस में रियल-टाइम सिंक"],
    contact_num: "संपर्क",
    contact_h: "मिलकर बनाएं कुछ",
    contact_h2: "शानदार।",
    contact_p: "कोई सवाल है या सहयोग करना चाहते हैं? हम सुनना चाहेंगे।",
    contactInfo: [["✉", "ईमेल", "polmonika7@gmail.com"], ["⌖", "स्थान", "पुणे, महाराष्ट्र, भारत"], ["◷", "समय", "सोम–शनि, सुबह 9 से शाम 6 बजे"]],
    name_ph: "आपका नाम",
    email_ph: "आपका ईमेल",
    msg_ph: "आपका संदेश",
    send: "संदेश भेजें →",
    sent_h: "संदेश सहेजा गया!",
    sent_p: "आपका संदेश इस ब्राउज़र में सहेजा गया है।",
    send_another: "और भेजें",
    cta_num: "अगले स्तर के लिए तैयार हैं?",
    cta_h: "नियंत्रण लें अपने",
    cta_h2: "पूरे ऑपरेशन का।",
    cta_p: "सब कुछ जुड़ा हुआ। हर निर्णय स्मार्ट। हर ऑपरेशन नियंत्रण में।",
    footer_p: "आधुनिक व्यवसायों के लिए इन्वेंटरी और विनिर्माण नियंत्रण।",
    footer_platform: "प्लेटफॉर्म",
    footer_account: "अकाउंट",
    footer_features: "फीचर्स",
    footer_how: "यह कैसे काम करता है",
    footer_about: "के बारे में",
    footer_contact: "संपर्क",
    footer_copy: `© ${new Date().getFullYear()} StockPro · औद्योगिक संचालन प्लेटफॉर्म · पुणे में ❤️ के साथ बनाया`,
    navLinks: [["features", "फीचर्स"], ["how-it-works", "कैसे काम करता है"], ["about", "के बारे में"], ["contact", "संपर्क"]],
  },
};

const CUBE = ({ color = "#00c8ff", size = 48, delay = "0s" }) => (
  <div className="sp-cube-float" style={{ width: size, height: size, animationDelay: delay }}>
    <div className="sp-cube" style={{ "--cube-color": color }}>
      <i className="front" /><i className="back" /><i className="right" />
      <i className="left" /><i className="top" /><i className="bottom" />
    </div>
  </div>
);

const Landing = () => {
  const [lang, setLang] = useState(() => localStorage.getItem("sp_lang") || "en");
  const t = T[lang];
  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("sp_lang", next);
  };

  const [typed, setTyped] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    setTyped("");
    setWordIndex(0);
    setDeleting(false);
  }, [lang]);

  useEffect(() => {
    const word = t.words[wordIndex];
    const delay = deleting ? 45 : typed === word ? 1600 : 95;
    const timer = setTimeout(() => {
      if (!deleting && typed === word) { setDeleting(true); }
      else if (deleting && typed === "") { setDeleting(false); setWordIndex((i) => (i + 1) % t.words.length); }
      else { setTyped(deleting ? word.slice(0, typed.length - 1) : word.slice(0, typed.length + 1)); }
    }, delay);
    return () => clearTimeout(timer);
  }, [typed, deleting, wordIndex, t.words]);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("sp-visible"); }); }, { threshold: 0.12 });
    document.querySelectorAll(".sp-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id) => (e) => { e.preventDefault(); setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  const submitContact = (e) => {
    e.preventDefault();
    try {
      const old = JSON.parse(localStorage.getItem("sp_contacts") || "[]");
      localStorage.setItem("sp_contacts", JSON.stringify([...old, { ...contact, date: new Date().toISOString() }]));
      setSent(true);
      setContact({ name: "", email: "", message: "" });
    } catch {}
  };

  const tilt = { transform: `perspective(1200px) rotateY(${mouse.x * 5}deg) rotateX(${-mouse.y * 4}deg)` };

  return (
    <div className="stockpro">
      <style>{CSS}</style>
      <div className="sp-progress" style={{ width: `${progress}%` }} />

      {/* NAVIGATION */}
      <nav className={`sp-nav ${scrolled ? "sp-nav-solid" : ""}`}>
        <Link to="/" className="sp-logo"><Logo size={32} /></Link>
        <div className={`sp-nav-links ${menuOpen ? "sp-menu-open" : ""}`}>
          {t.navLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={go(id)}>{label}</a>
          ))}
        </div>
        <div className="sp-nav-actions">
          <button onClick={toggleLang} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "0.35rem 0.9rem", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            {lang === "en" ? "🇮🇳 हिंदी" : "🇬🇧 English"}
          </button>
          <Link to="/login" className="sp-login">{t.login}</Link>
          <Link to="/register" className="sp-button sp-small-btn">{t.getStarted}</Link>
        </div>
        <button className="sp-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* HERO */}
      <section id="home" className="sp-hero">
        <div className="sp-grid-bg" />
        <div className="sp-glow sp-glow-one" />
        <div className="sp-glow sp-glow-two" />
        <div className="sp-stars">
          {Array.from({ length: 35 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, animationDelay: `${(i % 7) * 0.4}s` }} />
          ))}
        </div>
        <div className="sp-hero-inner">
          <div className="sp-hero-copy">
            <div className="sp-eyebrow sp-reveal">
              <span className="sp-live-dot" />{t.tagline}
            </div>
            <h1 className="sp-hero-title sp-reveal">
              Stock<span>Pro</span><br />{t.headline1}<br />
              <span className="sp-gradient-text">{typed}<b className="sp-cursor">|</b></span>
            </h1>
            <p className="sp-hero-desc sp-reveal">{t.subtext}</p>
            <div className="sp-hero-buttons sp-reveal">
              <Link to="/register" className="sp-button sp-big-btn">{t.explore} <span>→</span></Link>
              <a href="#features" onClick={go("features")} className="sp-watch">
                <span>▶</span> {t.exploreFeatures}
              </a>
            </div>
            <div className="sp-hero-stats sp-reveal">
              <div><strong>13+</strong><small>{t.modules}</small></div>
              <div><strong>100%</strong><small>{t.traceability}</small></div>
              <div><strong>{t.live}</strong><small>{t.liveStock}</small></div>
            </div>
          </div>

          <div className="sp-hero-visual sp-reveal" ref={dashboardRef}>
            <div className="sp-orbit orbit-one" />
            <div className="sp-orbit orbit-two" />
            <div className="sp-dashboard" style={tilt}>
              <div className="sp-dash-top">
                <div className="sp-dash-brand"><span className="sp-live-dot" /> LIVE OVERVIEW</div>
                <span className="sp-dash-date">Real-time Analytics ↗</span>
              </div>
              <div className="sp-dash-kpis">
                <div><small>Total Stock</small><strong>24,850</strong><em>↑ 12.5%</em></div>
                <div><small>Orders Today</small><strong>3,240</strong><em>↑ 18%</em></div>
                <div><small>Production</small><strong>92%</strong><em>↑ 5%</em></div>
              </div>
              <div className="sp-chart-area">
                <div className="sp-chart-heading"><strong>Business Performance</strong><span>Last 7 days</span></div>
                <svg viewBox="0 0 500 170" className="sp-chart-svg">
                  <defs>
                    <linearGradient id="spLine" x1="0" x2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#00d9ff" /></linearGradient>
                    <linearGradient id="spArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00c8ff" stopOpacity=".3" /><stop offset="100%" stopColor="#00c8ff" stopOpacity="0" /></linearGradient>
                  </defs>
                  {[35, 75, 115, 155].map(y => <line key={y} x1="0" x2="500" y1={y} y2={y} stroke="#294064" strokeDasharray="4 6" />)}
                  <path d="M0 130 L65 95 L130 112 L195 65 L260 82 L325 45 L390 60 L455 15 L500 25 L500 170 L0 170Z" fill="url(#spArea)" />
                  <path className="sp-chart-line" d="M0 130 L65 95 L130 112 L195 65 L260 82 L325 45 L390 60 L455 15 L500 25" fill="none" stroke="url(#spLine)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="sp-dash-bottom">
                <div className="sp-mini-bars">
                  {[45, 75, 55, 90, 65, 100, 80, 115].map((h, i) => <span key={i} style={{ height: h, animationDelay: `${i * .12}s` }} />)}
                </div>
                <div className="sp-production-ring"><div><strong>92%</strong><small>Production</small></div></div>
              </div>
            </div>
            <div className="sp-floating-alert alert-left"><span>⚠️</span><div><strong>Low Stock Alert</strong><small>12 units remaining</small></div></div>
            <div className="sp-floating-alert alert-right"><span>✓</span><div><strong>Order Dispatched</strong><small>Delivery successful</small></div></div>
            <div className="sp-cube-cluster">
              <CUBE color="#00c8ff" size={43} /><CUBE color="#8b5cf6" size={43} delay=".5s" /><CUBE color="#00c8ff" size={43} delay="1s" />
            </div>
          </div>
        </div>
        <a href="#inventory" onClick={go("inventory")} className="sp-scroll"><span>↓</span> {t.scrollExplore}</a>
      </section>

      {/* INVENTORY */}
      <section id="inventory" className="sp-scene sp-inventory">
        <div className="sp-section-inner sp-inventory-layout">
          <div className="sp-scene-copy sp-reveal">
            <span className="sp-section-number">{t.inv01}</span>
            <h2>Inventory<br /><span className="sp-gradient-text">{t.inv_h}</span></h2>
            <p>{t.inv_p}</p>
            <small>{t.inv_sm}</small>
            <Link to="/register" className="sp-outline-btn">{t.inv_btn}</Link>
          </div>
          <div className="sp-inventory-world sp-reveal">
            <div className="sp-platform" />
            <div className="sp-cube-grid">
              {[["#00c8ff", 0], ["#8b5cf6", 1], ["#00c8ff", 2], ["#8b5cf6", 3], ["#00c8ff", 4], ["#00e5a0", 5], ["#8b5cf6", 6], ["#00c8ff", 7], ["#00c8ff", 8]].map(([color, i]) => (
                <CUBE key={i} color={color} size={55} delay={`${i * .15}s`} />
              ))}
            </div>
            <div className="sp-stock-tooltip"><span>💻</span><div><strong>Laptop Pro 16"</strong><small>Stock: 120 units</small><em>● Healthy</em></div></div>
            <div className="sp-low-stock"><span>⚠</span><div><strong>Smartphone X1</strong><small>Stock: 5 units</small><em>Low Stock</em></div></div>
          </div>
        </div>
      </section>

      {/* PRODUCTION */}
      <section className="sp-scene sp-production">
        <div className="sp-section-inner sp-production-layout">
          <div className="sp-production-visual sp-reveal">
            <div className="sp-production-ring"><div><strong>92%</strong><small>Production</small></div></div>
            <div className="sp-factory">
              <div className="sp-factory-building">
                <div className="sp-factory-window" /><div className="sp-factory-door" />
                <div className="sp-smoke smoke-one" /><div className="sp-smoke smoke-two" />
              </div>
              <div className="sp-conveyor">
                <div className="sp-belt">{Array.from({ length: 7 }).map((_, i) => <span key={i} />)}</div>
                <div className="sp-moving-products"><CUBE color="#ff9d42" size={28} /><CUBE color="#00c8ff" size={28} delay=".7s" /><CUBE color="#8b5cf6" size={28} delay="1.4s" /></div>
              </div>
              <div className="sp-robot-arm">⚙</div>
            </div>
          </div>
          <div className="sp-scene-copy sp-reveal">
            <span className="sp-section-number">{t.prod01}</span>
            <h2>Production<br /><span className="sp-gradient-text">{t.prod_h}</span></h2>
            <p>{t.prod_p}</p>
            <small>{t.prod_sm}</small>
            <Link to="/register" className="sp-outline-btn">{t.prod_btn}</Link>
          </div>
        </div>
      </section>

      {/* SUPPLY CHAIN */}
      <section className="sp-scene sp-supply">
        <div className="sp-section-inner">
          <div className="sp-section-heading sp-reveal">
            <span className="sp-section-number">{t.supply01}</span>
            <h2>{t.supply_h} <span className="sp-gradient-text">{t.supply_h2}</span></h2>
            <p>{t.supply_p}</p>
          </div>
          <div className="sp-supply-flow sp-reveal">
            <div className="sp-flow-line"><i /></div>
            {t.supplyNodes.map(([icon, title, sub], i) => (
              <div className="sp-flow-node" key={title} style={{ animationDelay: `${i * .4}s` }}>
                <div className="sp-flow-icon">{icon}</div>
                <strong>{title}</strong><small>{sub}</small><span className="sp-flow-check">✓</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT */}
      <section className="sp-scene sp-ai">
        <div className="sp-section-inner sp-ai-layout">
          <div className="sp-scene-copy sp-reveal">
            <span className="sp-section-number">{t.ai01}</span>
            <h2>{t.ai_h}<br /><span className="sp-gradient-text">{t.ai_h2}</span></h2>
            <p>{t.ai_p}</p>
            <small>{t.ai_sm}</small>
            <button className="sp-outline-btn" onClick={() => setAiActive(!aiActive)}>
              {aiActive ? t.ai_deactivate : t.ai_activate}
            </button>
          </div>
          <div className="sp-ai-world sp-reveal">
            <div className={`sp-ai-orb ${aiActive ? "sp-ai-active" : ""}`}>
              <div className="sp-ai-ring ring-a" /><div className="sp-ai-ring ring-b" /><div className="sp-ai-ring ring-c" />
              <div className="sp-ai-core"><span>✧</span><strong>StockPro</strong><small>AI CORE</small></div>
            </div>
            <div className="sp-ai-card ai-card-one"><span>◈</span><strong>Stock Forecast</strong><small>+18% expected demand</small></div>
            <div className="sp-ai-card ai-card-two"><span>⚡</span><strong>Low Stock Alert</strong><small>2 items need reorder</small></div>
            <div className="sp-ai-card ai-card-three"><span>✦</span><strong>Smart Insights</strong><small>Optimize your operations</small></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="sp-content-section">
        <div className="sp-section-heading sp-reveal">
          <span className="sp-section-number">{t.feat01}</span>
          <h2>{t.feat_h} <span className="sp-gradient-text">{t.feat_h2}</span></h2>
          <p>{t.feat_p}</p>
        </div>
        <div className="sp-features-grid">
          {t.features.map((f, i) => (
            <div key={f.title} className={`sp-feature-card sp-reveal ${activeFeature === i ? "sp-feature-active" : ""}`}
              style={{ "--feature-color": f.color, transitionDelay: `${i * .08}s` }}
              onMouseEnter={() => setActiveFeature(i)} onMouseLeave={() => setActiveFeature(null)}>
              <div className="sp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3><p>{f.text}</p>
              <span className="sp-feature-arrow">↗</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="sp-content-section sp-dark-section">
        <div className="sp-section-heading sp-reveal">
          <span className="sp-section-number">{t.how_num}</span>
          <h2>{t.how_h} <span className="sp-gradient-text">{t.how_h2}</span></h2>
        </div>
        <div className="sp-steps-grid">
          {t.steps.map((s, i) => (
            <div className="sp-step-card sp-reveal" key={s.n}>
              <div className="sp-step-icon">{s.icon}</div>
              <span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p>
              {i !== 2 && <div className="sp-step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="sp-content-section">
        <div className="sp-about-layout">
          <div className="sp-reveal">
            <span className="sp-section-number">{t.about_num}</span>
            <h2>{t.about_h} <span className="sp-gradient-text">{t.about_h2}</span></h2>
            <p className="sp-about-desc">{t.about_p}</p>
            {t.about_points.map(p => <div className="sp-about-point" key={p}>✓ <span>{p}</span></div>)}
          </div>
          <div className="sp-about-visual sp-reveal">
            <div className="sp-about-glass">
              <div className="sp-about-orb">✧</div>
              <h3>One platform.</h3>
              <h3 className="sp-gradient-text">Infinite control.</h3>
              <div className="sp-tech-tags">
                {["React", "Node.js", "MongoDB", "JWT Auth", "Railway", "Vercel"].map(tech => <span key={tech}>{tech}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="sp-content-section sp-dark-section">
        <div className="sp-section-heading sp-reveal">
          <span className="sp-section-number">{t.contact_num}</span>
          <h2>{t.contact_h} <span className="sp-gradient-text">{t.contact_h2}</span></h2>
          <p>{t.contact_p}</p>
        </div>
        <div className="sp-contact-layout">
          <div className="sp-contact-info sp-reveal">
            {t.contactInfo.map(([icon, title, value]) => (
              <div className="sp-contact-item" key={title}>
                <span>{icon}</span><div><strong>{title}</strong><small>{value}</small></div>
              </div>
            ))}
          </div>
          <form className="sp-contact-form sp-reveal" onSubmit={submitContact}>
            {sent ? (
              <div className="sp-success">
                <span>✓</span><h3>{t.sent_h}</h3><p>{t.sent_p}</p>
                <button type="button" className="sp-outline-btn" onClick={() => setSent(false)}>{t.send_another}</button>
              </div>
            ) : (
              <>
                <input placeholder={t.name_ph} required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
                <input type="email" placeholder={t.email_ph} required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                <textarea placeholder={t.msg_ph} required value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} />
                <button className="sp-button sp-big-btn" type="submit">{t.send}</button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sp-final-cta sp-reveal">
        <div className="sp-cta-glow" />
        <span className="sp-section-number">{t.cta_num}</span>
        <h2>{t.cta_h} <span className="sp-gradient-text">{t.cta_h2}</span></h2>
        <p>{t.cta_p}</p>
        <div>
          <Link to="/register" className="sp-button sp-big-btn">{t.getStartedFree}</Link>
          <Link to="/login" className="sp-outline-btn">{t.login}</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sp-footer">
        <div className="sp-footer-inner">
          <div>
            <Logo size={30} />
            <p>{t.footer_p}</p>
          </div>
          <div>
            <strong>{t.footer_platform}</strong>
            <a href="#features" onClick={go("features")}>{t.footer_features}</a>
            <a href="#how-it-works" onClick={go("how-it-works")}>{t.footer_how}</a>
            <a href="#about" onClick={go("about")}>{t.footer_about}</a>
          </div>
          <div>
            <strong>{t.footer_account}</strong>
            <Link to="/login">{t.login}</Link>
            <Link to="/register">{t.getStarted}</Link>
            <a href="#contact" onClick={go("contact")}>{t.footer_contact}</a>
          </div>
        </div>
        <div className="sp-footer-bottom">{t.footer_copy}</div>
      </footer>
    </div>
  );
};

const CSS = `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: #030712; }
.stockpro {
  --bg: #030712; --panel: #0a1429; --blue: #00c8ff; --purple: #895cff; --text: #f1f5ff; --muted: #94a3b8;
  background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
}
.stockpro a { text-decoration: none; color: inherit; }
.stockpro button, .stockpro input, .stockpro textarea { font: inherit; }
.sp-progress { position: fixed; z-index: 300; top: 0; left: 0; height: 3px; background: linear-gradient(90deg,#895cff,#00c8ff); box-shadow: 0 0 14px #00c8ff; transition: width .1s; }
.sp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; display: flex; justify-content: space-between; align-items: center; padding: 20px 6%; transition: .3s; }
.sp-nav-solid { background: rgba(3,7,18,.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,200,255,.12); padding-top: 13px; padding-bottom: 13px; }
.sp-logo { display: flex; align-items: center; }
.sp-nav-links { display: flex; gap: 28px; }
.sp-nav-links a { color: #b8c5dc; font-size: 13px; transition: .3s; }
.sp-nav-links a:hover { color: var(--blue); }
.sp-nav-actions { display: flex; align-items: center; gap: 12px; }
.sp-login { color: #cbd5e1; font-size: 13px; }
.sp-button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; color: white; font-weight: 700; border: 1px solid #4d71ff; background: linear-gradient(120deg,#6637ee,#087cfa); border-radius: 40px; box-shadow: 0 0 25px #583dff55; transition: .3s; cursor: pointer; }
.sp-button:hover { transform: translateY(-4px); box-shadow: 0 0 35px #00bfff88; }
.sp-small-btn { padding: 11px 22px; font-size: 12px; }
.sp-big-btn { padding: 15px 28px; font-size: 14px; }
.sp-menu-btn { display: none; color: white; background: none; border: 0; font-size: 24px; }
.sp-hero { min-height: 850px; min-height: max(850px,100vh); position: relative; display: flex; align-items: center; padding: 125px 6% 90px; overflow: hidden; background: radial-gradient(ellipse at 75% 45%,#102b67 0%,transparent 45%),radial-gradient(ellipse at 10% 90%,#20114a 0%,transparent 40%),#030712; }
.sp-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(#2671c10c 1px,transparent 1px),linear-gradient(90deg,#2671c10c 1px,transparent 1px); background-size: 55px 55px; mask-image: linear-gradient(to bottom,black,transparent); }
.sp-glow { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }
.sp-glow-one { width: 450px; height: 450px; background: #4432ff44; top: -100px; left: -150px; animation: spGlow 8s infinite alternate; }
.sp-glow-two { width: 450px; height: 450px; background: #00aaff30; right: -150px; bottom: -100px; animation: spGlow 7s infinite alternate-reverse; }
.sp-stars span { position: absolute; width: 3px; height: 3px; background: #b2eaff; border-radius: 50%; box-shadow: 0 0 9px #00c8ff; animation: spTwinkle 3s infinite alternate; }
.sp-hero-inner { position: relative; z-index: 2; width: 100%; max-width: 1450px; margin: auto; display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 45px; }
.sp-eyebrow { display: inline-flex; align-items: center; gap: 9px; border: 1px solid #5543b866; background: #4834a322; color: #c5c2ff; padding: 9px 15px; border-radius: 30px; font-size: 10px; letter-spacing: 1.3px; font-weight: 700; }
.sp-live-dot { width: 7px; height: 7px; background: #00e5a0; border-radius: 50%; box-shadow: 0 0 12px #00e5a0; display: inline-block; animation: spPulse 1.5s infinite; }
.sp-hero-title { font-size: clamp(48px,5.6vw,82px); line-height: 1.08; font-weight: 850; letter-spacing: -3px; margin: 28px 0 20px; }
.sp-hero-title > span:first-child { background: linear-gradient(90deg,#00c8ff,#8b5cf6); background-clip: text; -webkit-text-fill-color: transparent; }
.sp-gradient-text { background: linear-gradient(100deg,#a78bfa,#00c8ff,#8b5cf6); background-clip: text; -webkit-background-clip: text; color: transparent; }
.sp-cursor { color: #00c8ff; animation: spBlink .8s infinite; }
.sp-hero-desc { max-width: 480px; font-size: 15px; line-height: 1.9; color: #9aabc5; }
.sp-hero-buttons { display: flex; align-items: center; gap: 25px; margin-top: 30px; flex-wrap: wrap; }
.sp-watch { font-size: 13px; color: #d4def0; display: flex; align-items: center; gap: 10px; }
.sp-watch span { border: 1px solid #687cba; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; color: var(--blue); }
.sp-hero-stats { display: flex; gap: 32px; margin-top: 55px; }
.sp-hero-stats div { display: flex; flex-direction: column; gap: 5px; }
.sp-hero-stats strong { font-size: 24px; color: white; }
.sp-hero-stats small { color: #7284a2; font-size: 11px; }
.sp-hero-visual { position: relative; min-height: 520px; display: grid; place-items: center; perspective: 1200px; }
.sp-dashboard { position: relative; z-index: 3; width: min(100%,580px); padding: 25px; border-radius: 23px; border: 1px solid #5a90ff66; background: linear-gradient(145deg,#132c58eF,#08152deF); box-shadow: 0 35px 100px #000a,0 0 60px #176bff35,inset 0 1px #ffffff22; transform-style: preserve-3d; transition: transform .15s ease-out; animation: spDashboardFloat 6s ease-in-out infinite; }
.sp-dash-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; font-size: 11px; }
.sp-dash-brand { color: #8ddfff; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.sp-dash-date { color: #8299bd; }
.sp-dash-kpis { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.sp-dash-kpis div { background: #ffffff08; border: 1px solid #ffffff12; padding: 14px 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 7px; }
.sp-dash-kpis small { color: #8da4c4; font-size: 10px; }
.sp-dash-kpis strong { font-size: 23px; }
.sp-dash-kpis em { font-size: 10px; color: #00e5a0; font-style: normal; }
.sp-chart-area { margin-top: 25px; background: #030c1d88; border: 1px solid #ffffff12; border-radius: 15px; padding: 15px; }
.sp-chart-heading { display: flex; justify-content: space-between; font-size: 11px; }
.sp-chart-heading span { color: #758bab; }
.sp-chart-svg { width: 100%; margin-top: 12px; overflow: visible; }
.sp-chart-line { stroke-dasharray: 800; stroke-dashoffset: 800; animation: spDraw 3s ease forwards infinite alternate; }
.sp-chart-area-fill { opacity: .8; animation: spFade 3s infinite alternate; }
.sp-dash-bottom { display: flex; align-items: center; justify-content: space-around; padding-top: 20px; }
.sp-mini-bars { height: 90px; display: flex; align-items: end; gap: 9px; }
.sp-mini-bars span { width: 20px; background: linear-gradient(#00c8ff,#704bff); border-radius: 5px 5px 0 0; transform-origin: bottom; animation: spBar .9s ease both infinite alternate; }
.sp-production-ring { width: 85px; height: 85px; border-radius: 50%; background: conic-gradient(#00e5c2 92%,#24385e 0); display: grid; place-items: center; }
.sp-production-ring > div { background: #0a1831; width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.sp-production-ring strong { font-size: 17px; color: #00dfff; }
.sp-production-ring small { font-size: 8px; color: #9aabc5; }
.sp-orbit { position: absolute; width: 110%; height: 45%; border: 1px solid #5d52ff88; border-radius: 50%; transform: rotate(-22deg); box-shadow: 0 0 20px #5844ff44; animation: spOrbit 12s linear infinite; }
.orbit-two { width: 100%; height: 70%; transform: rotate(55deg); border-color: #00bfff77; animation-duration: 18s; }
.sp-floating-alert { position: absolute; z-index: 5; display: flex; gap: 10px; align-items: center; background: #101e39ee; border: 1px solid #526da866; padding: 12px; border-radius: 12px; box-shadow: 0 15px 35px #0008; animation: spFloat 5s ease-in-out infinite; }
.sp-floating-alert span { font-size: 21px; }
.sp-floating-alert div { display: flex; flex-direction: column; gap: 5px; }
.sp-floating-alert strong { font-size: 11px; }
.sp-floating-alert small { font-size: 9px; color: #91a5c5; }
.alert-left { left: -4%; top: 15%; }
.alert-right { right: -3%; bottom: 13%; animation-delay: -2s; }
.sp-cube-cluster { position: absolute; z-index: 4; right: 3%; bottom: 8%; display: flex; gap: 8px; }
.sp-cube-float { position: relative; display: grid; place-items: center; animation: spCubeFloat 4s ease-in-out infinite; }
.sp-cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transform: rotateX(-25deg) rotateY(35deg); animation: spCubeRotate 12s linear infinite; }
.sp-cube i { position: absolute; inset: 0; display: block; background: color-mix(in srgb,var(--cube-color) 30%,transparent); border: 1px solid var(--cube-color); box-shadow: inset 0 0 15px var(--cube-color),0 0 15px color-mix(in srgb,var(--cube-color) 40%,transparent); }
.sp-cube .front { transform: translateZ(24px); }
.sp-cube .back { transform: rotateY(180deg) translateZ(24px); }
.sp-cube .right { transform: rotateY(90deg) translateZ(24px); }
.sp-cube .left { transform: rotateY(-90deg) translateZ(24px); }
.sp-cube .top { transform: rotateX(90deg) translateZ(24px); }
.sp-cube .bottom { transform: rotateX(-90deg) translateZ(24px); }
.sp-scroll { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); color: #8297ba; font-size: 10px; letter-spacing: 2px; display: flex; gap: 10px; align-items: center; }
.sp-scroll span { font-size: 20px; color: var(--blue); animation: spBounce 1s infinite; }
.sp-scene { position: relative; padding: 110px 6%; overflow: hidden; border-top: 1px solid #16264a66; }
.sp-scene:before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(#174b8510 1px,transparent 1px),linear-gradient(90deg,#174b8510 1px,transparent 1px); background-size: 60px 60px; pointer-events: none; }
.sp-section-inner { position: relative; z-index: 2; max-width: 1250px; margin: auto; }
.sp-inventory { background: radial-gradient(ellipse at 65% 50%,#122b593d,transparent 55%),#040a18; }
.sp-inventory-layout,.sp-production-layout,.sp-ai-layout { display: grid; grid-template-columns: .8fr 1.2fr; align-items: center; gap: 60px; }
.sp-section-number { font-size: 10px; letter-spacing: 2px; color: #7d9ac3; font-weight: 700; }
.sp-scene-copy h2 { font-size: clamp(36px,4.5vw,58px); line-height: 1.1; margin: 25px 0 12px; letter-spacing: -1.5px; }
.sp-scene-copy p { color: #d9e6ff; font-size: 16px; font-weight: 600; }
.sp-scene-copy > small { display: block; max-width: 390px; color: #8294b3; line-height: 1.9; font-size: 13px; margin: 18px 0 27px; }
.sp-outline-btn { display: inline-flex; padding: 12px 20px; border: 1px solid #7163ff; color: #c4c4ff; background: #5c4aff13; border-radius: 30px; cursor: pointer; font-size: 12px; transition: .3s; }
.sp-outline-btn:hover { background: #6450ff33; box-shadow: 0 0 25px #635bff55; transform: translateY(-3px); }
.sp-inventory-world { min-height: 420px; position: relative; display: flex; align-items: center; justify-content: center; perspective: 900px; }
.sp-platform { position: absolute; width: 75%; height: 95px; bottom: 50px; background: linear-gradient(120deg,#172d62,#10214a); border: 1px solid #388bff; border-radius: 18px; transform: rotateX(60deg) rotateZ(-8deg); box-shadow: 0 25px 50px #006bff55,inset 0 0 25px #007bff55; }
.sp-cube-grid { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(3,55px); gap: 8px; transform: rotateX(8deg) rotateY(-12deg); }
.sp-cube-grid .sp-cube-float:nth-child(2),.sp-cube-grid .sp-cube-float:nth-child(4),.sp-cube-grid .sp-cube-float:nth-child(6) { transform: translateY(-30px); }
.sp-stock-tooltip,.sp-low-stock { position: absolute; z-index: 5; display: flex; align-items: center; gap: 10px; padding: 13px; background: #101d38ee; border: 1px solid #5479bc88; border-radius: 12px; animation: spFloat 5s infinite; }
.sp-stock-tooltip { top: 30px; right: -3%; }
.sp-low-stock { bottom: 20px; right: 3%; border-color: #ff626c99; animation-delay: -2s; }
.sp-stock-tooltip > span,.sp-low-stock > span { font-size: 23px; }
.sp-stock-tooltip div,.sp-low-stock div { display: flex; flex-direction: column; gap: 5px; }
.sp-stock-tooltip strong,.sp-low-stock strong { font-size: 11px; }
.sp-stock-tooltip small,.sp-low-stock small { color: #a0aec4; font-size: 10px; }
.sp-stock-tooltip em { color: #00e5a0; font-size: 9px; font-style: normal; }
.sp-low-stock em { color: #ff666e; font-size: 9px; font-style: normal; }
.sp-production { background: radial-gradient(ellipse at 30% 50%,#1d164c66,transparent 50%),#030916; }
.sp-production-layout { grid-template-columns: 1.2fr .8fr; }
.sp-production-visual { min-height: 380px; position: relative; display: flex; align-items: center; justify-content: center; perspective: 700px; }
.sp-factory { width: 90%; position: relative; height: 240px; }
.sp-factory-building { position: absolute; right: 10%; top: 15px; width: 55%; height: 145px; background: linear-gradient(140deg,#293b6e,#101e3d); border: 2px solid #657fff; box-shadow: 0 0 30px #3d65ff66; transform: skewY(-4deg); }
.sp-factory-building:before { content: ""; position: absolute; width: 100%; height: 18px; background: #506bba; top: -18px; }
.sp-factory-window { position: absolute; top: 25px; left: 15%; width: 65%; height: 65px; background: linear-gradient(120deg,#0aa9f7,#4936aa); border: 3px solid #8099ff; box-shadow: 0 0 20px #00aaff; }
.sp-factory-door { position: absolute; bottom: 0; right: 15%; width: 25%; height: 55px; background: #090f25; border: 1px solid #718aff; }
.sp-conveyor { position: absolute; bottom: 25px; left: 0; width: 90%; height: 50px; background: linear-gradient(#4861aa,#17254b); border: 2px solid #5a8cff; transform: skewY(-5deg); box-shadow: 0 0 30px #226aff88; }
.sp-belt { height: 100%; display: flex; align-items: center; justify-content: space-around; }
.sp-belt span { width: 10px; height: 10px; border-radius: 50%; background: #0a1530; border: 1px solid #00c8ff; }
.sp-moving-products { position: absolute; left: 10%; top: -38px; width: 80%; display: flex; justify-content: space-around; }
.sp-robot-arm { position: absolute; left: 18%; top: 35px; font-size: 65px; color: #a4b7ff; text-shadow: 0 0 20px #377cff; transform-origin: bottom; animation: spRobot 3s ease-in-out infinite alternate; }
.sp-smoke { position: absolute; top: -35px; width: 20px; height: 20px; border-radius: 50%; background: #a4c6ff66; filter: blur(7px); animation: spSmoke 3s infinite; }
.smoke-one { left: 20%; }
.smoke-two { left: 50%; animation-delay: 1.2s; }
.sp-production-visual > .sp-production-ring { position: absolute; left: -2%; top: 5%; width: 105px; height: 105px; z-index: 3; }
.sp-supply { background: radial-gradient(ellipse at center,#11265366,transparent 65%),#040a18; }
.sp-section-heading { text-align: center; margin: 0 auto 65px; max-width: 800px; }
.sp-section-heading h2 { font-size: clamp(32px,4vw,52px); margin: 22px 0 12px; letter-spacing: -1.5px; }
.sp-section-heading p { color: #93a7c5; font-size: 14px; }
.sp-supply-flow { position: relative; display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; padding: 25px 0; }
.sp-flow-line { position: absolute; left: 12%; right: 12%; height: 2px; top: 80px; background: #23446b; }
.sp-flow-line i { position: absolute; height: 3px; width: 25%; background: linear-gradient(90deg,transparent,#00dfff,transparent); animation: spFlow 3s linear infinite; }
.sp-flow-node { position: relative; z-index: 2; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; animation: spFloat 5s ease-in-out infinite; }
.sp-flow-node:nth-child(even) { animation-delay: -2s; }
.sp-flow-icon { width: 105px; height: 105px; display: grid; place-items: center; font-size: 39px; background: linear-gradient(145deg,#172e5a,#0b1833); border: 1px solid #4378c9; border-radius: 24px; box-shadow: 0 0 30px #087fff30; }
.sp-flow-node strong { font-size: 14px; }
.sp-flow-node small { color: #8296b6; font-size: 10px; }
.sp-flow-check { color: #00e5a0; font-size: 12px; }
.sp-ai { background: radial-gradient(ellipse at 70% 50%,#33206c55,transparent 55%),#030712; }
.sp-ai-world { min-height: 420px; position: relative; display: grid; place-items: center; }
.sp-ai-orb { position: relative; width: 220px; height: 220px; display: grid; place-items: center; }
.sp-ai-core { width: 145px; height: 145px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at 35% 25%,#5e60df,#111a54 60%,#050b24); border: 2px solid #8e81ff; box-shadow: 0 0 35px #604cff,inset 0 0 30px #00aaff55; animation: spCore 3s infinite alternate; z-index: 2; }
.sp-ai-core span { font-size: 36px; color: #b9eaff; }
.sp-ai-core strong { font-size: 18px; }
.sp-ai-core small { color: #00dfff; font-size: 9px; letter-spacing: 3px; margin-top: 5px; }
.sp-ai-ring { position: absolute; inset: 0; border: 2px solid #8275ff; border-radius: 50%; transform: rotateX(65deg); box-shadow: 0 0 15px #5b54ff; animation: spOrbit 8s linear infinite; }
.ring-b { transform: rotateY(65deg) rotateX(25deg); border-color: #00dfff; animation-duration: 11s; }
.ring-c { inset: -25px; transform: rotateX(75deg) rotateZ(50deg); border-color: #b56cff; animation-duration: 14s; }
.sp-ai-active .sp-ai-core { box-shadow: 0 0 80px #00c8ff,0 0 120px #804cff; }
.sp-ai-card { position: absolute; display: flex; flex-direction: column; gap: 7px; padding: 13px; background: #111d3cdd; border: 1px solid #6a70cb88; border-radius: 12px; box-shadow: 0 15px 30px #0008; animation: spFloat 5s infinite; }
.sp-ai-card span { color: #00c8ff; }
.sp-ai-card strong { font-size: 11px; }
.sp-ai-card small { font-size: 9px; color: #9bacc9; }
.ai-card-one { top: 20px; left: -3%; }
.ai-card-two { right: -4%; top: 25%; animation-delay: -2s; }
.ai-card-three { bottom: 15px; left: 4%; animation-delay: -3s; }
.sp-content-section { padding: 105px 6%; max-width: 1450px; margin: auto; }
.sp-dark-section { max-width: none; background: linear-gradient(180deg,#071226,#030712); }
.sp-dark-section > .sp-section-heading,.sp-dark-section > .sp-steps-grid { max-width: 1250px; margin-left: auto; margin-right: auto; }
.sp-features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.sp-feature-card { position: relative; padding: 30px; background: linear-gradient(145deg,#101c35,#080f20); border: 1px solid #263b60; border-radius: 18px; transition: .35s; overflow: hidden; }
.sp-feature-card:hover { transform: translateY(-9px); border-color: var(--feature-color); box-shadow: 0 15px 50px #0008,0 0 25px color-mix(in srgb,var(--feature-color) 20%,transparent); }
.sp-feature-icon { width: 55px; height: 55px; display: grid; place-items: center; font-size: 25px; border-radius: 15px; background: color-mix(in srgb,var(--feature-color) 13%,transparent); border: 1px solid color-mix(in srgb,var(--feature-color) 35%,transparent); margin-bottom: 22px; }
.sp-feature-card h3 { font-size: 17px; }
.sp-feature-card p { color: #8fa0bc; font-size: 13px; line-height: 1.8; }
.sp-feature-arrow { color: var(--feature-color); position: absolute; right: 24px; top: 25px; font-size: 20px; }
.sp-steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 25px; }
.sp-step-card { position: relative; padding: 35px; background: #ffffff06; border: 1px solid #ffffff16; border-radius: 18px; text-align: center; }
.sp-step-icon { font-size: 35px; margin-bottom: 18px; }
.sp-step-card > span { font-size: 36px; font-weight: 800; color: #00c8ff; }
.sp-step-card h3 { font-size: 19px; }
.sp-step-card p { color: #8fa0bc; font-size: 13px; line-height: 1.7; }
.sp-step-arrow { position: absolute; right: -21px; top: 50%; color: #00c8ff; font-size: 23px; z-index: 2; }
.sp-about-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.sp-about-layout h2 { font-size: clamp(34px,4vw,48px); margin: 22px 0; }
.sp-about-desc { color: #91a2bd; font-size: 14px; line-height: 1.9; margin-bottom: 25px; }
.sp-about-point { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #00d9bd; font-size: 15px; }
.sp-about-point span { color: #cbd5e1; font-size: 13px; }
.sp-about-visual { min-height: 340px; display: grid; place-items: center; }
.sp-about-glass { width: 100%; padding: 55px 35px; border-radius: 25px; background: linear-gradient(145deg,#162b54,#0a1430); border: 1px solid #5874bf88; box-shadow: 0 30px 70px #0008,0 0 45px #473aff33; text-align: center; }
.sp-about-orb { width: 95px; height: 95px; margin: auto auto 25px; display: grid; place-items: center; font-size: 50px; border-radius: 50%; background: radial-gradient(circle,#7564ff,#101c58); box-shadow: 0 0 45px #645aff; animation: spCore 3s infinite alternate; }
.sp-about-glass h3 { font-size: 25px; margin: 8px; }
.sp-tech-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; margin-top: 25px; }
.sp-tech-tags span { padding: 7px 12px; border: 1px solid #5c67a566; background: #ffffff08; color: #aab9d6; font-size: 10px; border-radius: 30px; }
.sp-contact-layout { display: grid; grid-template-columns: .8fr 1.2fr; gap: 35px; max-width: 1050px; margin: auto; }
.sp-contact-item { display: flex; gap: 17px; align-items: center; padding: 22px; margin-bottom: 15px; border: 1px solid #ffffff13; border-radius: 15px; background: #ffffff05; }
.sp-contact-item > span { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; background: #4238a844; color: #00dfff; font-size: 23px; }
.sp-contact-item div { display: flex; flex-direction: column; gap: 7px; }
.sp-contact-item strong { font-size: 13px; }
.sp-contact-item small { color: #8fa0bc; font-size: 12px; }
.sp-contact-form { padding: 28px; display: flex; flex-direction: column; gap: 15px; border: 1px solid #ffffff16; background: #ffffff06; border-radius: 20px; }
.sp-contact-form input,.sp-contact-form textarea { width: 100%; border: 1px solid #35496d; background: #071226; color: white; border-radius: 10px; padding: 14px; outline: none; font-size: 13px; }
.sp-contact-form input:focus,.sp-contact-form textarea:focus { border-color: #00c8ff; box-shadow: 0 0 15px #00c8ff22; }
.sp-contact-form textarea { min-height: 125px; resize: vertical; }
.sp-success { text-align: center; padding: 30px; }
.sp-success > span { font-size: 50px; color: #00e5a0; }
.sp-success p { color: #8fa0bc; font-size: 13px; }
.sp-final-cta { position: relative; margin: 30px 6% 90px; padding: 80px 25px; text-align: center; border: 1px solid #6070ff77; border-radius: 25px; background: linear-gradient(120deg,#171c55,#0b2850,#27134e); overflow: hidden; }
.sp-final-cta h2 { position: relative; font-size: clamp(30px,4vw,48px); max-width: 800px; margin: 25px auto 15px; }
.sp-final-cta p { position: relative; color: #a5b7d4; font-size: 14px; margin-bottom: 30px; }
.sp-final-cta > div:last-child { position: relative; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; }
.sp-cta-glow { position: absolute; width: 350px; height: 350px; border-radius: 50%; background: #00bfff33; filter: blur(100px); left: 35%; top: -150px; }
.sp-footer { padding: 55px 6% 20px; background: #02050d; border-top: 1px solid #ffffff12; }
.sp-footer-inner { max-width: 1200px; margin: auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 50px; }
.sp-footer-inner > div { display: flex; flex-direction: column; align-items: flex-start; gap: 13px; }
.sp-footer-inner p { color: #71829e; max-width: 260px; font-size: 12px; line-height: 1.8; }
.sp-footer-inner strong { font-size: 13px; color: #d5e1f5; margin-bottom: 5px; }
.sp-footer-inner a:not(:first-child) { font-size: 12px; color: #71829e; transition: .2s; }
.sp-footer-inner a:hover { color: #00c8ff; }
.sp-footer-bottom { text-align: center; border-top: 1px solid #ffffff10; margin-top: 35px; padding-top: 22px; color: #53637c; font-size: 11px; }
.sp-reveal { opacity: 0; transform: translateY(35px); transition: opacity .8s ease,transform .8s ease; }
.sp-reveal.sp-visible { opacity: 1; transform: translateY(0); }
@keyframes spBlink { 50% { opacity: 0; } }
@keyframes spPulse { 50% { opacity: .35; box-shadow: 0 0 3px #00e5a0; } }
@keyframes spTwinkle { to { opacity: .2; transform: scale(.5); } }
@keyframes spGlow { to { transform: translate(70px,40px) scale(1.2); } }
@keyframes spDashboardFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -13px; } }
@keyframes spFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -13px; } }
@keyframes spCubeFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -13px; } }
@keyframes spCubeRotate { to { rotate: 0 1 0 360deg; } }
@keyframes spOrbit { to { rotate: 360deg; } }
@keyframes spDraw { to { stroke-dashoffset: 0; } }
@keyframes spFade { to { opacity: .3; } }
@keyframes spBar { to { transform: scaleY(.7); } }
@keyframes spBounce { 50% { transform: translateY(7px); } }
@keyframes spFlow { from { left: -30%; } to { left: 100%; } }
@keyframes spRobot { to { transform: rotate(12deg); } }
@keyframes spSmoke { 0% { opacity: 0; transform: translateY(20px) scale(.5); } 50% { opacity: .8; } 100% { opacity: 0; transform: translateY(-35px) scale(2); } }
@keyframes spCore { to { transform: scale(1.07); filter: brightness(1.3); } }
@media(max-width:1050px) {
  .sp-hero-inner { grid-template-columns: 1fr; }
  .sp-hero { padding-top: 140px; }
  .sp-hero-copy { text-align: center; }
  .sp-hero-desc { margin-left: auto; margin-right: auto; }
  .sp-hero-buttons,.sp-hero-stats { justify-content: center; }
  .sp-hero-visual { max-width: 650px; width: 100%; margin: 30px auto 0; }
  .sp-inventory-layout,.sp-production-layout,.sp-ai-layout { gap: 35px; }
  .sp-floating-alert { transform: scale(.85); }
  .sp-nav-links { gap: 13px; }
}
@media(max-width:700px) {
  .sp-nav { padding: 14px 5%; }
  .sp-nav-actions { margin-left: auto; margin-right: 15px; gap: 8px; }
  .sp-nav-actions .sp-login { display: none; }
  .sp-small-btn { padding: 9px 13px; font-size: 10px; }
  .sp-menu-btn { display: block; }
  .sp-nav-links { display: none; position: absolute; top: 65px; left: 4%; right: 4%; padding: 20px; flex-direction: column; gap: 18px; background: #0b1630f5; border: 1px solid #41568a; border-radius: 15px; }
  .sp-menu-open { display: flex; }
  .sp-nav-links a { padding: 5px; }
  .sp-hero { padding: 120px 5% 85px; }
  .sp-hero-title { font-size: clamp(43px,11vw,64px); letter-spacing: -2px; }
  .sp-hero-desc { font-size: 13px; }
  .sp-hero-stats { gap: 20px; }
  .sp-hero-stats strong { font-size: 19px; }
  .sp-hero-visual { min-height: 380px; }
  .sp-dashboard { padding: 14px; }
  .sp-dash-kpis { gap: 5px; }
  .sp-dash-kpis div { padding: 9px 6px; }
  .sp-dash-kpis strong { font-size: 17px; }
  .sp-dash-kpis small { font-size: 8px; }
  .sp-floating-alert { padding: 8px; }
  .alert-left { left: -3%; top: 5%; }
  .alert-right { right: -2%; bottom: 4%; }
  .sp-scene,.sp-content-section { padding: 75px 5%; }
  .sp-inventory-layout,.sp-production-layout,.sp-ai-layout { grid-template-columns: 1fr; }
  .sp-production-layout .sp-production-visual { order: 2; }
  .sp-production-layout .sp-scene-copy { order: 1; }
  .sp-scene-copy h2 { font-size: 42px; }
  .sp-inventory-world { min-height: 370px; }
  .sp-stock-tooltip { right: -2%; top: 5px; }
  .sp-low-stock { right: -2%; bottom: 0; }
  .sp-production-visual { min-height: 300px; }
  .sp-factory { transform: scale(.85); }
  .sp-supply-flow { grid-template-columns: repeat(2,1fr); gap: 35px 10px; }
  .sp-flow-line { display: none; }
  .sp-flow-icon { width: 85px; height: 85px; font-size: 32px; }
  .sp-ai-world { min-height: 360px; }
  .sp-ai-card { transform: scale(.85); }
  .ai-card-one { left: -3%; }
  .ai-card-two { right: -3%; }
  .sp-features-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
  .sp-feature-card { padding: 19px; }
  .sp-feature-card h3 { font-size: 14px; }
  .sp-feature-card p { font-size: 11px; }
  .sp-steps-grid { grid-template-columns: 1fr; }
  .sp-step-arrow { display: none; }
  .sp-about-layout,.sp-contact-layout { grid-template-columns: 1fr; gap: 30px; }
  .sp-about-glass { padding: 35px 20px; }
  .sp-final-cta { margin: 15px 5% 60px; padding: 60px 18px; }
  .sp-footer-inner { grid-template-columns: 1fr 1fr; gap: 30px; }
  .sp-footer-inner > div:first-child { grid-column: 1/-1; }
}
@media(max-width:400px) {
  .sp-features-grid { grid-template-columns: 1fr; }
  .sp-hero-stats { gap: 13px; }
  .sp-hero-stats strong { font-size: 17px; }
  .sp-hero-visual { min-height: 320px; }
  .sp-dashboard { padding: 10px; }
  .sp-dash-kpis strong { font-size: 14px; }
  .sp-floating-alert { transform: scale(.7); }
}
@media(prefers-reduced-motion:reduce) {
  .stockpro *, .stockpro *:before, .stockpro *:after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    scroll-behavior: auto !important; transition-duration: .01ms !important;
  }
}
`;

export default Landing;
