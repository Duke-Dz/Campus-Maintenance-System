import { useEffect, useState } from "react";
import { getAllTickets, updateTicketStatus } from "../../services/ticketService";
import {
  Wrench, CheckCircle2, Clock, AlertTriangle, RefreshCw,
  ChevronDown, Building2, MapPin, ArrowRight, Sparkles, Filter
} from "lucide-react";

const STYLE = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .au { animation: fadeUp 0.5s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s} .d4{animation-delay:.2s}
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    transition: border-color 0.2s, transform 0.2s;
  }
  .glass-card:hover { border-color: rgba(59,130,246,0.2); }
  .job-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
  .job-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); border-color: rgba(59,130,246,0.3) !important; }
  .spin { animation: spin 1s linear infinite; }
  .pulse { animation: pulse 2s ease infinite; }
  .btn-resolve {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #065f46, #047857);
    color: #6ee7b7; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .btn-resolve:hover { background: linear-gradient(135deg, #047857, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.3); }
  .btn-resolve:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-inprogress {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    border: 1px solid rgba(59,130,246,0.3);
    background: rgba(59,130,246,0.08);
    color: #93c5fd; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .btn-inprogress:hover { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.5); }
  .btn-inprogress:disabled { opacity: 0.5; cursor: not-allowed; }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }
  .priority-bar { height: 3px; border-radius: 2px; width: 100%; }
`;

const STATUS_CONFIG = {
  PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending", borderColor: "rgba(245,158,11,0.2)" },
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending", borderColor: "rgba(245,158,11,0.2)" },
  IN_PROGRESS: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "In Progress", borderColor: "rgba(59,130,246,0.2)" },
  RESOLVED: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Resolved", borderColor: "rgba(16,185,129,0.2)" },
  Resolved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Resolved", borderColor: "rgba(16,185,129,0.2)" },
};

const PRIORITY_COLOR = {
  HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981"
};

function JobCard({ ticket, onUpdateStatus, updatingId }) {
  const status = STATUS_CONFIG[ticket.status] || { color: "#64748b", bg: "rgba(100,116,139,0.1)", label: ticket.status, borderColor: "rgba(100,116,139,0.2)" };
  const isResolved = ["RESOLVED", "Resolved"].includes(ticket.status);
  const isInProgress = ticket.status === "IN_PROGRESS";
  const isUpdating = updatingId === ticket.id;

  return (
    <div className="glass-card job-card" style={{
      padding: "20px",
      borderLeft: `3px solid ${status.color}`,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155" }}>#{ticket.id}</span>
            <span className="status-pill" style={{ color: status.color, background: status.bg, border: `1px solid ${status.borderColor}` }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color, display: "inline-block", ...(ticket.status === "IN_PROGRESS" ? { animation: "pulse 2s ease infinite" } : {}) }} />
              {status.label}
            </span>
            {ticket.priority && (
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                color: PRIORITY_COLOR[ticket.priority] || "#64748b",
                background: `${PRIORITY_COLOR[ticket.priority] || "#64748b"}15`,
                padding: "2px 8px", borderRadius: 6
              }}>
                {ticket.priority}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{ticket.title}</h3>
          {ticket.description && (
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {ticket.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {ticket.building && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#475569" }}>
                <Building2 size={11} color="#3b82f6" />
                {ticket.building}
              </span>
            )}
            {ticket.location && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#475569" }}>
                <MapPin size={11} color="#8b5cf6" />
                {ticket.location}
              </span>
            )}
            {ticket.category && (
              <span style={{ fontSize: 12, color: "#475569" }}>
                🏷️ {ticket.category}
              </span>
            )}
            {ticket.createdAt && (
              <span style={{ fontSize: 12, color: "#334155" }}>
                {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isResolved && (
        <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap" }}>
          {!isInProgress && (
            <button
              className="btn-inprogress"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(ticket.id, "IN_PROGRESS")}
            >
              {isUpdating ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(147,197,253,0.3)", borderTop: "2px solid #93c5fd" }} className="spin" /> : <ArrowRight size={12} />}
              Start Working
            </button>
          )}
          <button
            className="btn-resolve"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(ticket.id, "RESOLVED")}
          >
            {isUpdating ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(110,231,183,0.3)", borderTop: "2px solid #6ee7b7" }} className="spin" /> : <CheckCircle2 size={12} />}
            Mark Resolved
          </button>
        </div>
      )}

      {isResolved && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)"
        }}>
          <Sparkles size={12} color="#10b981" />
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Completed — Great work!</span>
        </div>
      )}
    </div>
  );
}

export default function MaintenanceDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("ACTIVE");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (ticketId, status) => {
    setUpdatingId(ticketId);
    try {
      await updateTicketStatus(ticketId, status);
      await fetchData();
    } catch {
      setError("Failed to update ticket status");
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = tickets.filter(t => ["PENDING", "Pending"].includes(t.status));
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS");
  const resolved = tickets.filter(t => ["RESOLVED", "Resolved"].includes(t.status));
  const active = [...inProgress, ...pending];

  const displayTickets = filter === "ACTIVE" ? active : filter === "RESOLVED" ? resolved : tickets;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(245,158,11,0.2)", borderTop: "3px solid #f59e0b", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <p style={{ color: "#475569", fontSize: 14 }}>Loading jobs...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="au" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Maintenance Hub
            </h1>
            <p style={{ fontSize: 14, color: "#475569" }}>
              {active.length} active job{active.length !== 1 ? "s" : ""} awaiting attention
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12,
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
              color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total", val: tickets.length, color: "#3b82f6", icon: Wrench },
            { label: "Pending", val: pending.length, color: "#f59e0b", icon: Clock },
            { label: "In Progress", val: inProgress.length, color: "#8b5cf6", icon: AlertTriangle },
            { label: "Resolved", val: resolved.length, color: "#10b981", icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className={`glass-card au d${i + 1}`} style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={16} color={s.color} />
                </div>
                {s.label === "Pending" && s.val > 0 && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} className="pulse" />
                )}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass-card au d3" style={{ padding: "20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Overall Resolution Rate</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>
              {tickets.length > 0 ? Math.round((resolved.length / tickets.length) * 100) : 0}%
            </span>
          </div>
          <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${tickets.length > 0 ? (resolved.length / tickets.length) * 100 : 0}%`,
              background: "linear-gradient(90deg, #065f46, #10b981)",
              transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#334155" }}>{resolved.length} resolved</span>
            <span style={{ fontSize: 11, color: "#334155" }}>{tickets.length} total</span>
          </div>
        </div>

        {/* Filter tabs + Job list */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
              Job Queue
            </h2>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "ACTIVE", label: `Active (${active.length})` },
                { key: "RESOLVED", label: `Done (${resolved.length})` },
                { key: "ALL", label: "All" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    border: "1px solid",
                    background: filter === f.key ? (f.key === "ACTIVE" ? "rgba(245,158,11,0.12)" : f.key === "RESOLVED" ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)") : "transparent",
                    borderColor: filter === f.key ? (f.key === "ACTIVE" ? "rgba(245,158,11,0.35)" : f.key === "RESOLVED" ? "rgba(16,185,129,0.35)" : "rgba(59,130,246,0.35)") : "rgba(255,255,255,0.08)",
                    color: filter === f.key ? (f.key === "ACTIVE" ? "#fbbf24" : f.key === "RESOLVED" ? "#34d399" : "#93c5fd") : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          )}

          {displayTickets.length === 0 ? (
            <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                {filter === "ACTIVE" ? "All caught up! 🎉" : "No tickets here"}
              </h3>
              <p style={{ fontSize: 13, color: "#334155" }}>
                {filter === "ACTIVE" ? "No pending or in-progress jobs right now." : "Nothing to show for this filter."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayTickets.map((ticket) => (
                <JobCard
                  key={ticket.id}
                  ticket={ticket}
                  onUpdateStatus={handleUpdateStatus}
                  updatingId={updatingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
