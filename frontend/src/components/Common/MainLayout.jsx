import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getRole } from "../../utils/authStorage";
import {
  LayoutDashboard, Ticket, BarChart3, Users, Settings,
  Bell, Moon, Sun, Menu, X, LogOut, Wrench, ChevronRight
} from "lucide-react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
  @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes logoSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 12px #3b82f430} 50%{box-shadow:0 0 28px #3b82f470} }

  .layout-fade { animation: fadeIn 0.4s ease both; }
  .logo-spin-hover:hover { animation: logoSpin 0.7s ease; }
  .pulse-glow { animation: pulse-glow 2.5s ease infinite; }

  /* Sidebar scrollbar */
  .sidebar-scroll::-webkit-scrollbar { width: 0; }
  .nav-item { transition: all 0.2s ease; }
  .nav-item:hover { background: rgba(59,130,246,0.08) !important; color: #93c5fd !important; }

  /* Main scrollbar */
  .main-scroll::-webkit-scrollbar { width: 4px; }
  .main-scroll::-webkit-scrollbar-track { background: transparent; }
  .main-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
`;

const LogoMark = ({ collapsed }) => (
  <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, overflow: "hidden" }}>
    <div
      className="logo-spin-hover"
      style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, #1e40af, #7c3aed)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", cursor: "pointer",
        boxShadow: "0 0 20px #3b82f630"
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>C</span>
      <span style={{ fontSize: 10, fontWeight: 800, color: "#93c5fd", position: "absolute", bottom: 4, right: 5 }}>F</span>
    </div>
    {!collapsed && (
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "#f1f5f9", whiteSpace: "nowrap" }}>
        Campus<span style={{ color: "#3b82f6" }}>Fix</span>
      </span>
    )}
  </div>
);

const ROLE_MENUS = {
  ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Ticket, label: "All Tickets", key: "tickets" },
    { icon: BarChart3, label: "Analytics", key: "analytics" },
    { icon: Users, label: "Users", key: "users" },
    { icon: Settings, label: "Settings", key: "settings" },
  ],
  STUDENT: [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Ticket, label: "My Tickets", key: "tickets" },
    { icon: Settings, label: "Settings", key: "settings" },
  ],
  MAINTENANCE: [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Wrench, label: "Assigned Jobs", key: "jobs" },
    { icon: Ticket, label: "All Tickets", key: "tickets" },
    { icon: Settings, label: "Settings", key: "settings" },
  ],
};

const ROLE_META = {
  ADMIN: { label: "Admin", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  STUDENT: { label: "Student", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  MAINTENANCE: { label: "Maintenance", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const role = getRole();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [notifications, setNotifications] = useState(3);

  const menu = ROLE_MENUS[role] || ROLE_MENUS.STUDENT;
  const meta = ROLE_META[role] || ROLE_META.STUDENT;

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        display: "flex", height: "100vh",
        background: isDark ? "#020617" : "#f8fafc",
        overflow: "hidden"
      }}>
        {/* Sidebar */}
        <div style={{
          width: collapsed ? 64 : 220,
          flexShrink: 0, transition: "width 0.3s ease",
          position: "relative", zIndex: 10
        }}>
          {/* Sidebar content inlined */}
          <div className="sidebar-scroll" style={{
            height: "100%", display: "flex", flexDirection: "column",
            background: "#0a0f1e",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            overflowY: "auto",
          }}>
            {/* Logo */}
            <div style={{
              padding: collapsed ? "20px 14px" : "20px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between"
            }}>
              <LogoMark collapsed={collapsed} />
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(true)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#475569", padding: 4 }}
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Role badge */}
            {!collapsed && (
              <div style={{ padding: "12px 20px" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: meta.bg, border: `1px solid ${meta.color}30`,
                  borderRadius: 8, padding: "4px 10px"
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} className="pulse-glow" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: "0.06em" }}>
                    {meta.label.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Nav */}
            <div style={{ flex: 1, padding: collapsed ? "8px" : "8px 12px" }}>
              {!collapsed && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", padding: "8px 8px 4px", marginTop: 4 }}>
                  NAVIGATION
                </div>
              )}
              {menu.map(item => (
                <button
                  key={item.key}
                  className="nav-item"
                  onClick={() => setActiveKey(item.key)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: collapsed ? 0 : 12,
                    padding: collapsed ? "10px" : "10px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2,
                    background: activeKey === item.key
                      ? "linear-gradient(135deg, rgba(30,64,175,0.4), rgba(124,58,237,0.3))"
                      : "transparent",
                    color: activeKey === item.key ? "#93c5fd" : "#475569",
                    borderLeft: activeKey === item.key ? "3px solid #3b82f6" : "3px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <item.icon size={18} />
                  {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: collapsed ? "16px 8px" : "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={handleLogout}
                className="nav-item"
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? "10px" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  background: "transparent", color: "#ef444460",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef444460"; }}
              >
                <LogOut size={18} />
                {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <div style={{
            height: 60, flexShrink: 0,
            background: isDark ? "rgba(10,15,30,0.95)" : "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px", gap: 16
          }}>
            {/* Left: expand button + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {collapsed && (
                <button
                  onClick={() => setCollapsed(false)}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#94a3b8" }}
                >
                  <Menu size={16} />
                </button>
              )}
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a" }}>
                  {menu.find(m => m.key === activeKey)?.label || "Dashboard"}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>Campus Maintenance System</div>
              </div>
            </div>

            {/* Right: actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Notification */}
              <button
                onClick={() => setNotifications(0)}
                style={{
                  position: "relative", width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Bell size={16} />
                {notifications > 0 && (
                  <span style={{
                    position: "absolute", top: -2, right: -2,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#ef4444", border: "2px solid #0a0f1e",
                    fontSize: 8, fontWeight: 800, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{notifications}</span>
                )}
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} />}
              </button>

              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                background: "linear-gradient(135deg, #1e40af, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(59,130,246,0.3)"
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                  {role?.[0] || "U"}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="main-scroll layout-fade" style={{
            flex: 1, overflowY: "auto",
            background: isDark
              ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(30,58,138,0.15), transparent), #020617"
              : "#f0f4f8",
            padding: "28px 28px"
          }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
