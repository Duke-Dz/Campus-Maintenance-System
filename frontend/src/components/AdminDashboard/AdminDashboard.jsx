import { useEffect, useState } from "react";
import ticketService from "../../services/ticketService";
import { userService } from "../../services/userService";
import {
  Ticket, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  RefreshCw, Filter, ArrowUpRight, MoreHorizontal, Eye
} from "lucide-react";

/* ─── Shared design tokens ─── */
const STYLE = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes countUp { from{opacity:0} to{opacity:1} }
  @keyframes barGrow { from{height:0%} to{height:var(--h)} }
  .au { animation: fadeUp 0.5s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s}
  .d4{animation-delay:.2s} .d5{animation-delay:.25s} .d6{animation-delay:.3s}
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    backdrop-filter: blur(20px);
  }
  .glass-card:hover { border-color: rgba(59,130,246,0.25); }
  .row-hover:hover { background: rgba(59,130,246,0.05) !important; }
  .status-badge { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.04em; }
  .btn-action { transition: all 0.2s; }
  .btn-action:hover { opacity:0.8; transform: translateY(-1px); }
  @keyframes spin { to{transform:rotate(360deg)} }
  .spin { animation: spin 1s linear infinite; }
`;

const STATUS_CONFIG = {
  PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending" },
  IN_PROGRESS: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "In Progress" },
  RESOLVED: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Resolved" },
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Pending" },
  Resolved: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Resolved" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: status };
  return (
    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
};

const PRIORITY_CONFIG = {
  HIGH: { color: "#ef4444" },
  MEDIUM: { color: "#f59e0b" },
  LOW: { color: "#10b981" },
};

const MiniBarChart = ({ tickets }) => {
  const categories = ["ELECTRICAL", "PLUMBING", "HVAC", "STRUCTURAL", "CLEANING", "OTHER"];
  const counts = categories.map(c => tickets.filter(t => t.category === c || (!t.category && c === "OTHER")).length);
  const max = Math.max(...counts, 1);
  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#06b6d4"];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
      {categories.map((cat, i) => (
        <div key={cat} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{counts[i]}</div>
          <div style={{ width: "100%", position: "relative", height: 52, display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%", borderRadius: 6,
              height: `${(counts[i] / max) * 100}%`, minHeight: counts[i] > 0 ? 4 : 0,
              background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)`,
              transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }} />
          </div>
          <div style={{ fontSize: 8, color: "#334155", textAlign: "center", letterSpacing: "0.03em" }}>
            {cat.slice(0, 4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchTickets = async () => {
    try {
      setRefreshing(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTickets(); userService.getUsers().then(setUsers).catch(() => setUsers([])); }, []);

  const total = tickets.length;
  const pending = tickets.filter(t => ["PENDING", "Pending"].includes(t.status)).length;
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter(t => ["RESOLVED", "Resolved"].includes(t.status)).length;

  const filteredTickets = filter === "ALL" ? tickets : tickets.filter(t => {
    const s = t.status?.toUpperCase();
    return filter === s || (filter === "IN_PROGRESS" && s === "IN_PROGRESS");
  });

  const statCards = [
    { label: "Total Tickets", val: total, icon: Ticket, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", trend: "+12% this week" },
    { label: "Pending", val: pending, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", trend: `${total > 0 ? Math.round(pending / total * 100) : 0}% of total` },
    { label: "In Progress", val: inProgress, icon: TrendingUp, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", trend: "Being handled" },
    { label: "Resolved", val: resolved, icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.12)", trend: `${total > 0 ? Math.round(resolved / total * 100) : 0}% resolution rate` },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid rgba(59,130,246,0.2)",
          borderTop: "3px solid #3b82f6",
          margin: "0 auto 16px", animation: "spin 1s linear infinite"
        }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <p style={{ color: "#475569", fontSize: 14 }}>Loading dashboard...</p>

      </div>
    </div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth: 1200 }}>

        {/* Header */}
        <div className="au" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 14, color: "#475569" }}>
              Monitoring {total} ticket{total !== 1 ? "s" : ""} across all buildings
            </p>
          </div>
          <button
            onClick={fetchTickets}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12,
              background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
              color: "#93c5fd", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {statCards.map((s, i) => (
            <div key={i} className={`glass-card au d${i + 1}`} style={{ padding: "20px 20px", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <ArrowUpRight size={14} color="#334155" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
                {s.val}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 24 }}>
          {/* Resolution ring */}
          <div className="glass-card au d3" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>Status Overview</h3>
                <p style={{ fontSize: 12, color: "#475569" }}>Current ticket distribution</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {/* SVG donut */}
              <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, flexShrink: 0 }}>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="14" />
                {total > 0 && (
                  <>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="14"
                      strokeDasharray={`${(resolved / total) * 238.76} 238.76`}
                      strokeDashoffset="59.69" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="14"
                      strokeDasharray={`${(pending / total) * 238.76} 238.76`}
                      strokeDashoffset={`${59.69 - (resolved / total) * 238.76}`} strokeLinecap="round" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="14"
                      strokeDasharray={`${(inProgress / total) * 238.76} 238.76`}
                      strokeDashoffset={`${59.69 - ((resolved + pending) / total) * 238.76}`} strokeLinecap="round" />
                  </>
                )}
                <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="800" fill="#f1f5f9">{total}</text>
                <text x="50" y="58" textAnchor="middle" fontSize="7" fill="#475569">tickets</text>
              </svg>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Resolved", count: resolved, color: "#10b981" },
                  { label: "Pending", count: pending, color: "#f59e0b" },
                  { label: "In Progress", count: inProgress, color: "#8b5cf6" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.count}</span>
                      </div>
                      <div style={{ height: 3, background: "#1e293b", borderRadius: 2 }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                          background: item.color, transition: "width 1s ease"
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category chart */}
          <div className="glass-card au d4" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>By Category</h3>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>Ticket breakdown</p>
            <MiniBarChart tickets={tickets} />
          </div>
        </div>

        {/* Tickets table */}
        <div className="glass-card au d5" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>All Tickets</h3>
              <p style={{ fontSize: 12, color: "#475569" }}>{filteredTickets.length} records</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: 600, border: "1px solid",
                    background: filter === f ? "rgba(59,130,246,0.15)" : "transparent",
                    borderColor: filter === f ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)",
                    color: filter === f ? "#93c5fd" : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  {f === "IN_PROGRESS" ? "In Progress" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["#", "Title", "Status", "Priority", "Category", "Building", "Date"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#334155",
                      letterSpacing: "0.06em", textTransform: "uppercase"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#334155", fontSize: 14 }}>
                      No tickets found
                    </td>
                  </tr>
                ) : filteredTickets.map((ticket, i) => (
                  <tr key={ticket.id} className="row-hover" style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                    animationDelay: `${i * 0.03}s`
                  }}>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#334155", fontFamily: "monospace" }}>
                      #{ticket.id}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{ticket.title}</div>
                      {ticket.description && (
                        <div style={{ fontSize: 12, color: "#475569", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ticket.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={ticket.status} /></td>
                    <td style={{ padding: "12px 14px" }}>
                      {ticket.priority ? (
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: PRIORITY_CONFIG[ticket.priority]?.color || "#64748b"
                        }}>
                          {ticket.priority}
                        </span>
                      ) : <span style={{ color: "#334155" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>{ticket.category || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#64748b" }}>{ticket.building || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass-card au d6" style={{ padding: "24px", marginTop: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>User Management</h3>
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>Admin view for all registered users ({users.length})</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#64748b", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Name</th>
                  <th style={{ padding: "10px" }}>Username</th>
                  <th style={{ padding: "10px" }}>Role</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid rgba(148,163,184,0.15)", color: "#cbd5e1" }}>
                    <td style={{ padding: "10px" }}>{u.name}</td>
                    <td style={{ padding: "10px" }}>{u.username}</td>
                    <td style={{ padding: "10px" }}>{u.role}</td>
                    <td style={{ padding: "10px" }}>{u.active ? "Active" : "Disabled"}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: "12px", color: "#64748b" }}>No users available or admin endpoint is not reachable.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
