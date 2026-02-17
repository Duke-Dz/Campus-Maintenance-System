import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Shield, Clock, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle, Building2, Users, BarChart3, Wrench, Bell,
  Lock, Globe, Menu, X, Star
} from "lucide-react";

/* ─── Shared CSS (inject once) ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes blob  { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes logoSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px #3b82f640} 50%{box-shadow:0 0 60px #3b82f680} }
  @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }

  .fadeUp { animation: fadeUp 0.7s ease both; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }

  .shimmer-btn {
    background: linear-gradient(90deg, #3b82f6 0%, #6366f1 40%, #a855f7 60%, #3b82f6 100%);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
  }

  .blob { animation: blob 8s ease-in-out infinite; }
  .float { animation: float 6s ease-in-out infinite; }
  .logo-spin:hover { animation: logoSpin 0.8s ease; }
  .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

  .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); }
  .glass-light { background: rgba(255,255,255,0.08); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); }

  .gradient-text {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .gradient-text-green {
    background: linear-gradient(135deg, #10b981, #3b82f6);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }

  .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(59,130,246,0.15); }

  .scan-line {
    position: absolute; width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f640, #3b82f6, #3b82f640, transparent);
    animation: scan 3s ease-in-out infinite;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #020617; }
  ::-webkit-scrollbar-thumb { background: #1e40af; border-radius: 10px; }

  .nav-link { transition: color 0.2s; }
  .nav-link:hover { color: #3b82f6; }

  .step-connector {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #3b82f640, #3b82f6, #3b82f640);
  }
`;

/* ─── Logo Mark ─── */
const LogoMark = ({ size = 36 }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="logo-spin relative flex items-center justify-center rounded-xl overflow-hidden cursor-pointer"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #1e40af, #7c3aed)",
        boxShadow: "0 0 20px #3b82f630",
      }}
    >
      <span style={{ fontSize: size * 0.4, fontWeight: 800, color: "#fff", lineHeight: 1 }}>C</span>
      <span
        style={{
          fontSize: size * 0.3, fontWeight: 800, color: "#93c5fd",
          position: "absolute", bottom: size * 0.05, right: size * 0.1, lineHeight: 1,
        }}
      >F</span>
    </div>
    <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#f1f5f9" }}>
      Campus<span style={{ color: "#3b82f6" }}>Fix</span>
    </span>
  </div>
);

/* ─── FAQ Item ─── */
const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="glass rounded-2xl p-6 cursor-pointer card-hover select-none"
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#e2e8f0" }}>{q}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: open ? "#3b82f620" : "#ffffff10",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16,
          transition: "background 0.2s"
        }}>
          {open ? <ChevronUp size={16} color="#3b82f6" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </div>
      {open && (
        <p style={{ marginTop: 12, fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
};

/* ─── Dashboard Mockup ─── */
const DashboardMockup = () => (
  <div
    className="float"
    style={{
      background: "#0f172a",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 40px 100px #000a, 0 0 0 1px #3b82f610",
      width: "100%",
      maxWidth: 540,
      position: "relative",
    }}
  >
    <div className="scan-line" />
    {/* Topbar */}
    <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {["#ef4444", "#f59e0b", "#10b981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
      </div>
      <div style={{ background: "#1e293b", borderRadius: 6, padding: "3px 12px", fontSize: 11, color: "#475569" }}>admin@campusfix.edu</div>
      <Bell size={14} color="#475569" />
    </div>
    {/* Content */}
    <div style={{ padding: 16, display: "flex", gap: 12 }}>
      {/* Sidebar */}
      <div style={{ width: 44, display: "flex", flexDirection: "column", gap: 8 }}>
        {[BarChart3, Wrench, Users, Globe, Shield].map((Icon, i) => (
          <div key={i} style={{
            width: 44, height: 32, borderRadius: 8,
            background: i === 0 ? "linear-gradient(135deg,#1e40af,#7c3aed)" : "#1e293b",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon size={14} color={i === 0 ? "#93c5fd" : "#334155"} />
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1 }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Total", val: "128", color: "#3b82f6" },
            { label: "Pending", val: "24", color: "#f59e0b" },
            { label: "Resolved", val: "104", color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: "#475569", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
        {/* Tickets */}
        {[
          { title: "AC Unit Broken", status: "PENDING", color: "#f59e0b" },
          { title: "Leaking Pipe", status: "IN PROGRESS", color: "#3b82f6" },
          { title: "Broken Projector", status: "RESOLVED", color: "#10b981" },
        ].map((t, i) => (
          <div key={i} style={{
            background: "#1e293b", borderRadius: 8, padding: "7px 10px",
            marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{t.title}</div>
            <div style={{
              fontSize: 8, fontWeight: 700, color: t.color,
              background: t.color + "20", borderRadius: 4, padding: "2px 6px"
            }}>{t.status}</div>
          </div>
        ))}
        {/* Mini bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36, marginTop: 8 }}>
          {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, borderRadius: 3,
              background: i === 3
                ? "linear-gradient(180deg,#3b82f6,#7c3aed)"
                : "#1e293b"
            }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: Zap, title: "Quick Reporting", desc: "Submit maintenance requests in seconds with our streamlined form and smart category detection.", color: "#f59e0b" },
    { icon: Clock, title: "Real-time Tracking", desc: "Monitor ticket status live from submission to resolution with instant push notifications.", color: "#3b82f6" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Admins get powerful insights into campus maintenance trends and team performance.", color: "#8b5cf6" },
    { icon: Shield, title: "Role-Based Access", desc: "JWT-secured endpoints ensure students, staff, and admins only see what they need.", color: "#10b981" },
    { icon: Lock, title: "Enterprise Security", desc: "BCrypt-encrypted credentials and stateless JWT sessions with configurable expiry.", color: "#ec4899" },
    { icon: Globe, title: "REST API Ready", desc: "10+ documented endpoints. Integrate with existing campus systems effortlessly.", color: "#06b6d4" },
  ];

  const steps = [
    { icon: Users, title: "Student Submits", sub: "POST /api/tickets", desc: "Student fills the form; JWT identity attached automatically." },
    { icon: Zap, title: "Backend Validates", sub: "Spring Boot + H2/MySQL", desc: "Service layer validates, persists, and triggers log entry." },
    { icon: Shield, title: "Admin Resolves", sub: "Role-Based Access Control", desc: "Maintenance staff updates status; analytics refresh instantly." },
  ];

  const faqs = [
    { q: "How do I submit a maintenance request?", a: "Log in with your student credentials, navigate to the Student Portal, fill in the ticket form with title, description, building, location, and category, then hit Submit." },
    { q: "How long does it take for a request to be addressed?", a: "Priority requests (HVAC, structural, electrical) are typically assigned within 2 hours. Standard requests within one business day." },
    { q: "Can I track the status of my request?", a: "Yes. Your Student Dashboard shows real-time status for all your tickets: PENDING, IN_PROGRESS, or RESOLVED." },
    { q: "How does role-based access work?", a: "JWTs carry a role claim (STUDENT / MAINTENANCE / ADMIN). Spring Security enforces endpoint-level authorization on every request." },
    { q: "What technologies power this app?", a: "Spring Boot 3 + Java 21 on the backend, React 18 + Vite + Tailwind on the frontend, H2 (dev) / MySQL (prod), JWT via JJWT 0.11." },
  ];

  const stats = [
    { val: "10+", label: "REST Endpoints" },
    { val: "3", label: "User Roles" },
    { val: "< 200ms", label: "Avg Response" },
    { val: "100%", label: "JWT Secured" },
  ];

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", overflowX: "hidden" }}>

        {/* ── Ambient blobs ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          <div className="blob" style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: "50vw", height: "50vw", maxWidth: 700,
            background: "radial-gradient(circle, #1e3a8a40, transparent 70%)",
            filter: "blur(80px)"
          }} />
          <div className="blob" style={{
            position: "absolute", bottom: "10%", right: "-5%",
            width: "45vw", height: "45vw", maxWidth: 600,
            background: "radial-gradient(circle, #4c1d9540, transparent 70%)",
            filter: "blur(80px)", animationDelay: "4s"
          }} />
        </div>

        {/* ── Navbar ── */}
        <nav style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, width: "calc(100% - 48px)", maxWidth: 1100,
          background: scrolled ? "rgba(2,6,23,0.85)" : "rgba(2,6,23,0.5)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "background 0.3s",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none"
        }}>
          <LogoMark />

          {/* Desktop links */}
          <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="hidden-mobile">
            {["Features", "Workflow", "FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link"
                style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8", textDecoration: "none" }}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: "#94a3b8", fontSize: 14, fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.target.style.color = "#e2e8f0"; e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.target.style.color = "#94a3b8"; e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="shimmer-btn"
              style={{
                padding: "8px 20px", borderRadius: 10,
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", border: "none",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Get Started <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "none" }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section id="home" style={{ position: "relative", zIndex: 1, paddingTop: 160, paddingBottom: 100, paddingInline: 24 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div className="fadeUp" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 100, padding: "6px 14px", marginBottom: 24
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} className="pulse-glow" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", letterSpacing: "0.05em" }}>PRODUCTION READY</span>
              </div>

              <h1 className="fadeUp delay-1" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
                Campus Maintenance,{" "}
                <span className="gradient-text">SIMPLIFIED</span>
              </h1>

              <p className="fadeUp delay-2" style={{ fontSize: 17, color: "#64748b", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                A production-ready maintenance ticketing system with JWT authentication, role-based dashboards, and real-time REST API integration.
              </p>

              <div className="fadeUp delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="shimmer-btn"
                  style={{
                    padding: "14px 28px", borderRadius: 12,
                    color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", border: "none",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 0 40px #3b82f630"
                  }}
                >
                  Get Started <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "14px 28px", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#e2e8f0", fontSize: 15, fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  Sign In
                </button>
              </div>

              {/* Trust badges */}
              <div className="fadeUp delay-4" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {["JWT Auth", "BCrypt Passwords", "Role-Based Access"].map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fadeUp delay-2" style={{ display: "flex", justifyContent: "center" }}>
              <DashboardMockup />
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ maxWidth: 1100, margin: "80px auto 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {stats.map((s, i) => (
              <div key={i} className="glass rounded-2xl fadeUp card-hover" style={{ padding: "20px 24px", animationDelay: `${0.1 * i}s`, borderRadius: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }} className="gradient-text-green">{s.val}</div>
                <div style={{ fontSize: 13, color: "#475569" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 12 }}>CAPABILITIES</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Everything you need to{" "}
                <span className="gradient-text">run campus ops</span>
              </h2>
              <p style={{ fontSize: 16, color: "#475569", maxWidth: 480, margin: "0 auto" }}>
                From quick ticket submission to enterprise analytics — CampusFix handles it all.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {features.map((f, i) => (
                <div key={i} className="glass card-hover" style={{
                  borderRadius: 20, padding: "28px 24px",
                  animationDelay: `${0.1 * i}s`
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: f.color + "20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16
                  }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workflow ── */}
        <section id="workflow" style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            background: "linear-gradient(135deg, rgba(30,58,138,0.2), rgba(76,29,149,0.2))",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 32, padding: "64px 48px"
          }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#8b5cf6", marginBottom: 12 }}>HOW IT WORKS</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                From submission to{" "}
                <span className="gradient-text">resolution</span>
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {steps.map((s, i) => (
                <>
                  <div key={i} className="glass card-hover" style={{
                    flex: 1, borderRadius: 20, padding: "28px 24px", textAlign: "center"
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: "linear-gradient(135deg, #1e40af, #7c3aed)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 8px 24px #3b82f630"
                    }}>
                      <s.icon size={22} color="#93c5fd" />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.08em", marginBottom: 8 }}>
                      STEP {i + 1}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{s.title}</h3>
                    <code style={{ fontSize: 11, color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 10 }}>{s.sub}</code>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div key={`conn-${i}`} className="step-connector" style={{ minWidth: 32, maxWidth: 48, flexShrink: 0 }} />
                  )}
                </>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#10b981", marginBottom: 12 }}>FAQ</p>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Common <span className="gradient-text">questions</span>
              </h2>
            </div>
            {faqs.map((f, i) => <FaqItem key={i} {...f} index={i} />)}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 120px" }}>
          <div style={{
            maxWidth: 700, margin: "0 auto", textAlign: "center",
            background: "linear-gradient(135deg, rgba(30,58,138,0.3), rgba(76,29,149,0.3))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 32, padding: "64px 40px"
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 40px #3b82f640" }}>
              <Building2 size={28} color="#93c5fd" />
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Ready to fix your campus?
            </h2>
            <p style={{ fontSize: 16, color: "#475569", marginBottom: 36, lineHeight: 1.7 }}>
              Login with <strong style={{ color: "#93c5fd" }}>student1 / password</strong> to explore all three role-based dashboards.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="shimmer-btn"
              style={{
                padding: "16px 40px", borderRadius: 14,
                color: "#fff", fontSize: 16, fontWeight: 700,
                cursor: "pointer", border: "none",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 0 60px #3b82f640"
              }}
            >
              Launch Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: 1100, margin: "0 auto"
        }}>
          <LogoMark size={28} />
          <p style={{ fontSize: 13, color: "#334155" }}>
            Campus Maintenance System — Spring Boot + React
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {[Star, Shield, Zap].map((Icon, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color="#334155" />
              </div>
            ))}
          </div>
        </footer>

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .hidden-mobile { display: none !important; }
            .show-mobile { display: block !important; }
          }
          @media (max-width: 900px) {
            section > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </>
  );
}
