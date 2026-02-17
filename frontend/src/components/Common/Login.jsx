import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { font-family: 'Outfit', sans-serif; box-sizing: border-box; }

  @keyframes blob {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-12px) rotate(1deg); }
    66%      { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes logoEntrance {
    0%   { transform: scale(0.5) rotate(-180deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes shimmerSlide {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes orbitalGlow {
    0%,100% { box-shadow: 0 0 20px #3b82f640, 0 0 60px #3b82f615; }
    50%      { box-shadow: 0 0 40px #3b82f670, 0 0 80px #3b82f630; }
  }
  @keyframes scan {
    0%   { transform: translateY(-100%) scaleX(0.6); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(600%) scaleX(0.6); opacity: 0; }
  }
  @keyframes dotPulse {
    0%,100% { transform: scale(1); opacity: 0.6; }
    50%      { transform: scale(1.5); opacity: 1; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }

  .login-blob { animation: blob 9s ease-in-out infinite; }
  .login-float { animation: float 7s ease-in-out infinite; }
  .login-fade { animation: fadeUp 0.6s ease both; }
  .logo-anim { animation: logoEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .shimmer-btn {
    background: linear-gradient(90deg, #1e40af 0%, #6366f1 40%, #7c3aed 60%, #1e40af 100%);
    background-size: 200% auto;
    animation: shimmerSlide 3s linear infinite;
  }
  .orbital-glow { animation: orbitalGlow 2.5s ease-in-out infinite; }
  .scan-anim { animation: scan 4s ease-in-out infinite; }
  .dot-pulse { animation: dotPulse 1.5s ease-in-out infinite; }
  .shake { animation: shake 0.4s ease; }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 44px 12px 14px;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    font-family: 'Outfit', sans-serif;
  }
  .field-input::placeholder { color: #334155; }
  .field-input:focus {
    border-color: rgba(59,130,246,0.6);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: rgba(59,130,246,0.04);
  }
  .field-input.error { border-color: rgba(239,68,68,0.5); }
  .field-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

  ::-webkit-scrollbar { width: 0; }
`;

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const triggerError = (msg) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login({ username: username.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Invalid username or password";
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        minHeight: "100vh", background: "#020617",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden"
      }}>
        {/* Animated blobs */}
        <div style={{
          position: "absolute", top: "-15%", left: "-5%",
          width: "55vw", height: "55vw", maxWidth: 700,
          background: "radial-gradient(circle, #1e3a8a50, transparent 65%)",
          filter: "blur(60px)", pointerEvents: "none"
        }} className="login-blob" />
        <div style={{
          position: "absolute", bottom: "-15%", right: "-5%",
          width: "50vw", height: "50vw", maxWidth: 600,
          background: "radial-gradient(circle, #4c1d9545, transparent 65%)",
          filter: "blur(60px)", pointerEvents: "none", animationDelay: "4s"
        }} className="login-blob" />

        {/* Floating corner decorations */}
        <div className="login-float" style={{
          position: "absolute", top: "12%", right: "8%",
          width: 80, height: 80, borderRadius: 20,
          background: "rgba(59,130,246,0.06)",
          border: "1px solid rgba(59,130,246,0.15)",
          backdropFilter: "blur(10px)", pointerEvents: "none"
        }} />
        <div className="login-float" style={{
          position: "absolute", bottom: "18%", left: "6%",
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.15)",
          backdropFilter: "blur(10px)", pointerEvents: "none",
          animationDelay: "2s"
        }} />

        {/* Card */}
        <div className="login-fade" style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          backdropFilter: "blur(32px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          padding: "40px 36px",
          position: "relative", overflow: "hidden"
        }}>
          {/* Scan line effect */}
          <div className="scan-anim" style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), #3b82f6, rgba(59,130,246,0.4), transparent)",
            pointerEvents: "none", zIndex: 1
          }} />

          {/* Top glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: "60%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)",
            pointerEvents: "none"
          }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="logo-anim orbital-glow" style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #1e40af, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", position: "relative", cursor: "default"
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>C</span>
              <span style={{
                fontSize: 13, fontWeight: 900, color: "#93c5fd",
                position: "absolute", bottom: 6, right: 8
              }}>F</span>
            </div>
            <h1 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
              color: "#f1f5f9", marginBottom: 6
            }}>
              Campus<span style={{ color: "#3b82f6" }}>Fix</span>
            </h1>
            <p style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
              Sign in to your account
            </p>
          </div>

          {/* Status indicator */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, marginBottom: 24,
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 100, padding: "6px 14px"
          }}>
            <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", letterSpacing: "0.06em" }}>
              SYSTEM ONLINE
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={shakeError ? "shake" : ""}>
            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 12,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className={`field-input ${error ? "error" : ""}`}
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className={`field-input ${error ? "error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "#475569", padding: 4, display: "flex", alignItems: "center"
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={loading ? "" : "shimmer-btn"}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: loading ? "rgba(59,130,246,0.2)" : undefined,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 0 40px rgba(59,130,246,0.3)",
                transition: "box-shadow 0.3s"
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderTop: "2px solid #fff",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center"
          }}>
            <p style={{ fontSize: 12, color: "#334155", marginBottom: 10 }}>
              Demo credentials
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { user: "student1", color: "#3b82f6" },
                { user: "admin", color: "#ef4444" },
                { user: "maintenance1", color: "#f59e0b" },
              ].map(({ user, color }) => (
                <button
                  key={user}
                  onClick={() => { setUsername(user); setPassword("password"); setError(""); }}
                  style={{
                    padding: "4px 12px", borderRadius: 8,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    color, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    letterSpacing: "0.03em", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
                >
                  {user}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
