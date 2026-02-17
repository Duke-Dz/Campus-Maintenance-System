import { useEffect, useState } from "react";
import ticketService from "../../services/ticketService";
import {
  Plus, Ticket, Clock, CheckCircle2, ChevronRight,
  MapPin, Building2, Tag, X, AlertCircle, Sparkles
} from "lucide-react";

const STYLE = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .au { animation: fadeUp 0.5s ease both; }
  .sd { animation: slideDown 0.3s ease both; }
  .d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s}
  .d4{animation-delay:.2s} .d5{animation-delay:.25s}
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    transition: border-color 0.2s;
  }
  .glass-card:hover { border-color: rgba(59,130,246,0.2); }
  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 14px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .field-input::placeholder { color: #334155; }
  .field-input:focus { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .field-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 7px; }
  .ticket-card { transition: transform 0.2s, border-color 0.2s; }
  .ticket-card:hover { transform: translateY(-2px); border-color: rgba(59,130,246,0.25) !important; }
  .category-chip { 
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700;
    background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.2);
  }
  .spin { animation: spin 1s linear infinite; }
`;

const STATUS_MAP = {
  PENDING: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending" },
  Pending: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending" },
  IN_PROGRESS: { icon: ChevronRight, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "In Progress" },
  RESOLVED: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Resolved" },
  Resolved: { icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Resolved" },
};

const CATEGORIES = [
  { value: "ELECTRICAL", label: "⚡ Electrical" },
  { value: "PLUMBING", label: "🔧 Plumbing" },
  { value: "HVAC", label: "❄️ HVAC" },
  { value: "STRUCTURAL", label: "🏗️ Structural" },
  { value: "CLEANING", label: "🧹 Cleaning" },
  { value: "OTHER", label: "📦 Other" },
];

function TicketCard({ ticket, index }) {
  const cfg = STATUS_MAP[ticket.status] || { icon: Clock, color: "#64748b", bg: "rgba(100,116,139,0.1)", label: ticket.status };
  const Icon = cfg.icon;

  return (
    <div className={`glass-card ticket-card au d${Math.min(index + 1, 5)}`} style={{
      padding: "18px 20px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      gap: 16
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155" }}>#{ticket.id}</span>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 100,
            background: cfg.bg, border: `1px solid ${cfg.color}30`,
            fontSize: 11, fontWeight: 700, color: cfg.color
          }}>
            <Icon size={10} />
            {cfg.label}
          </div>
          {ticket.category && <span className="category-chip">{ticket.category}</span>}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 5 }}>{ticket.title}</h3>
        {ticket.description && (
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {ticket.description}
          </p>
        )}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {ticket.building && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#475569" }}>
              <Building2 size={12} color="#3b82f6" />
              {ticket.building}{ticket.location ? `, ${ticket.location}` : ""}
            </span>
          )}
          {ticket.createdAt && (
            <span style={{ fontSize: 12, color: "#334155" }}>
              {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
      {/* Priority indicator */}
      {ticket.priority && (
        <div style={{
          flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "8px 10px", borderRadius: 10,
          background: ticket.priority === "HIGH" ? "rgba(239,68,68,0.08)" : ticket.priority === "MEDIUM" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)"
        }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.05em",
            color: ticket.priority === "HIGH" ? "#ef4444" : ticket.priority === "MEDIUM" ? "#f59e0b" : "#10b981"
          }}>{ticket.priority}</span>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", building: "", category: "OTHER" });

  const fetchTickets = () => {
    setLoading(true);
    ticketService.getMyTickets()
      .then(setTickets)
      .catch(() => { setError("Failed to load tickets"); setTickets([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await ticketService.createTicket(form);
      setForm({ title: "", description: "", location: "", building: "", category: "OTHER" });
      setSuccess(true);
      setShowForm(false);
      fetchTickets();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pending = tickets.filter(t => ["PENDING", "Pending"].includes(t.status)).length;
  const resolved = tickets.filter(t => ["RESOLVED", "Resolved"].includes(t.status)).length;

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth: 900 }}>

        {/* Header */}
        <div className="au" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Student Portal
            </h1>
            <p style={{ fontSize: 14, color: "#475569" }}>Track and manage your maintenance requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px", borderRadius: 12,
              background: showForm ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #1e40af, #7c3aed)",
              border: showForm ? "1px solid rgba(255,255,255,0.1)" : "none",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              boxShadow: showForm ? "none" : "0 0 30px rgba(59,130,246,0.3)"
            }}
          >
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Ticket</>}
          </button>
        </div>

        {/* Success toast */}
        {success && (
          <div className="sd" style={{
            marginBottom: 20, padding: "12px 16px", borderRadius: 12,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            display: "flex", alignItems: "center", gap: 10, color: "#34d399"
          }}>
            <Sparkles size={16} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Ticket submitted successfully!</span>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total", val: tickets.length, color: "#3b82f6", icon: Ticket },
            { label: "Pending", val: pending, color: "#f59e0b", icon: Clock },
            { label: "Resolved", val: resolved, color: "#10b981", icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className={`glass-card au d${i + 1}`} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={18} color={s.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <div className="glass-card sd" style={{ padding: "28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1e40af,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={18} color="#93c5fd" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Submit New Request</h2>
                <p style={{ fontSize: 12, color: "#475569" }}>Describe the issue and we'll handle the rest</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Issue Title *</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g. AC not working in Room 203"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="field-label">Description *</label>
                  <textarea
                    className="field-input"
                    placeholder="Describe the problem in detail..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div>
                  <label className="field-label">
                    <Building2 size={10} style={{ display: "inline", marginRight: 4 }} />
                    Building
                  </label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g. Science Hall"
                    value={form.building}
                    onChange={e => setForm({ ...form, building: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">
                    <MapPin size={10} style={{ display: "inline", marginRight: 4 }} />
                    Location
                  </label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g. Room 204"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">
                    <Tag size={10} style={{ display: "inline", marginRight: 4 }} />
                    Category
                  </label>
                  <select
                    className="field-input"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: "#0a0f1e" }}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5", fontSize: 13
                }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 28px", borderRadius: 12, border: "none",
                  background: submitting ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg, #1e40af, #7c3aed)",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: submitting ? "none" : "0 0 24px rgba(59,130,246,0.3)"
                }}
              >
                {submitting ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff" }} className="spin" /> Submitting...</> : <><Sparkles size={15} /> Submit Request</>}
              </button>
            </form>
          </div>
        )}

        {/* Ticket List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
              My Tickets
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#334155", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 100 }}>
                {tickets.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(59,130,246,0.2)", borderTop: "3px solid #3b82f6", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              <p style={{ color: "#334155", fontSize: 13 }}>Loading your tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Ticket size={24} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>No tickets yet</h3>
              <p style={{ fontSize: 14, color: "#334155", marginBottom: 20 }}>Submit your first maintenance request above</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <Plus size={14} style={{ display: "inline", marginRight: 6 }} />
                Create Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tickets.map((ticket, i) => <TicketCard key={ticket.id} ticket={ticket} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
