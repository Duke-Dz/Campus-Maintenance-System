import {
  AlertTriangle,
  ArrowUpRight,
  CheckCheck,
  Clock,
  FileText,
  Hammer,
  ImagePlus,
  Loader2,
  PlayCircle,
  Star,
  Timer,
  TrendingUp,
  Upload,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import { ticketService } from "../services/ticketService";
import { formatDate, titleCase } from "../utils/helpers";

const SLA_TARGETS = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 168 };

const getSlaRemaining = (ticket) => {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) return null;
  const targetHrs = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  const remaining = targetHrs - elapsed;
  return remaining;
};

const formatRemaining = (hrs) => {
  if (hrs <= 0) return "Overdue";
  if (hrs < 1) return `${Math.round(hrs * 60)}m left`;
  if (hrs < 24) return `${Math.round(hrs)}h left`;
  return `${Math.round(hrs / 24)}d left`;
};

const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

/* ================================================================== */
/*  MAINTENANCE STAFF DASHBOARD                                        */
/* ================================================================== */
export const MaintenanceDashboard = () => {
  const { auth } = useAuth();
  const { tickets, loading, error, refresh } = useTickets(() => ticketService.getAssignedTickets(), []);
  const [notes, setNotes] = useState({});
  const [actionState, setActionState] = useState({ ticketId: null, loading: false, error: "" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [afterPhotos, setAfterPhotos] = useState({}); // ticketId -> File

  /* ---- computed ---- */
  const activeTickets = useMemo(
    () => tickets
      .filter((t) => ["ASSIGNED", "IN_PROGRESS"].includes(t.status))
      .sort((a, b) => (urgencyOrder[a.urgency] ?? 5) - (urgencyOrder[b.urgency] ?? 5)),
    [tickets]
  );
  const resolvedTickets = useMemo(
    () => tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)),
    [tickets]
  );
  const resolvedToday = useMemo(() => {
    const today = new Date().toDateString();
    return resolvedTickets.filter((t) => t.resolvedAt && new Date(t.resolvedAt).toDateString() === today).length;
  }, [resolvedTickets]);

  /* ---- actions ---- */
  const updateStatus = async (ticket, status) => {
    const note = notes[ticket.id] || "";
    if (status === "RESOLVED" && !note.trim()) {
      setActionState({ ticketId: ticket.id, loading: false, error: "Work note is required to resolve." });
      return;
    }
    setActionState({ ticketId: ticket.id, loading: true, error: "" });
    try {
      await ticketService.updateStatus(ticket.id, { status, note });
      setNotes((prev) => ({ ...prev, [ticket.id]: "" }));
      setAfterPhotos((prev) => { const copy = { ...prev }; delete copy[ticket.id]; return copy; });
      await refresh();
    } catch (err) {
      setActionState({ ticketId: ticket.id, loading: false, error: err?.response?.data?.message || "Status update failed." });
      return;
    }
    setActionState({ ticketId: null, loading: false, error: "" });
  };

  const openTicket = async (ticketId) => {
    setDetailLoading(true);
    try {
      const detail = await ticketService.getTicket(ticketId);
      setSelectedTicket(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ---- greeting ---- */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  /* ---- urgency color helpers ---- */
  const urgencyBorderColor = {
    CRITICAL: "border-l-red-500",
    HIGH: "border-l-orange-500",
    MEDIUM: "border-l-campus-500",
    LOW: "border-l-gray-400",
  };

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ---- Welcome Banner ---- */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-campus-500 via-campus-600 to-campus-800 p-6 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm">
              {(auth?.fullName || "M").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{greeting}, {auth?.fullName || "Staff"} 🔧</h1>
              <p className="mt-0.5 text-sm text-blue-100">
                You have <span className="font-semibold text-white">{activeTickets.length} active tasks</span> in your work queue.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {/* Availability Toggle */}
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <span className="text-sm font-medium">{isAvailable ? "Available" : "Busy"}</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${isAvailable ? "bg-emerald-400" : "bg-gray-400"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isAvailable ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats Row (4 cards) ---- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Assigned", value: activeTickets.filter((t) => t.status === "ASSIGNED").length, icon: FileText, color: "bg-blue-100 text-campus-600 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "In Progress", value: activeTickets.filter((t) => t.status === "IN_PROGRESS").length, icon: Loader2, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
          { label: "Resolved Today", value: resolvedToday, icon: CheckCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
          { label: "Total Resolved", value: resolvedTickets.length, icon: TrendingUp, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="saas-card flex items-center gap-4">
              <div className={`icon-wrap ${item.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      {/* ---- Quick Actions ---- */}
      <section className="saas-card">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active\nTasks", icon: Hammer, bg: "bg-blue-100 dark:bg-blue-900/30", fg: "text-campus-600 dark:text-blue-400" },
            { label: "Upload\nPhotos", icon: ImagePlus, bg: "bg-emerald-100 dark:bg-emerald-900/30", fg: "text-emerald-600 dark:text-emerald-400" },
            { label: "My\nPerformance", icon: TrendingUp, bg: "bg-purple-100 dark:bg-purple-900/30", fg: "text-purple-600 dark:text-purple-400" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} className="group flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-card dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
                <div className={`icon-wrap ${a.bg}`}>
                  <Icon size={22} className={a.fg} />
                </div>
                <span className="text-center text-xs font-semibold leading-tight text-gray-600 dark:text-gray-300 whitespace-pre-line">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Loading / Error ---- */}
      {loading && <LoadingSpinner label="Loading assigned tickets..." />}
      {!loading && error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

      {!loading && !error && (
        <>
          {/* ---- Active Work Queue ---- */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-campus-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Work Queue</h2>
              <span className="pill-badge bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400">{activeTickets.length}</span>
            </div>

            {activeTickets.length === 0 ? (
              <EmptyState title="No active tickets" message="All assigned tickets are currently resolved. Great work! 🎉" />
            ) : (
              <div className="grid gap-4">
                {activeTickets.map((ticket) => {
                  const remaining = getSlaRemaining(ticket);
                  const isOverdue = remaining !== null && remaining <= 0;
                  const isAtRisk = remaining !== null && remaining > 0 && remaining <= (SLA_TARGETS[ticket.urgency] || 72) * 0.25;

                  return (
                    <article
                      key={ticket.id}
                      className={`saas-card border-l-4 ${urgencyBorderColor[ticket.urgency] || "border-l-gray-300"}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <button type="button" onClick={() => openTicket(ticket.id)} className="text-left">
                            <h3 className="font-semibold text-gray-900 hover:text-campus-600 dark:text-white dark:hover:text-campus-400 transition-colors">
                              {ticket.title}
                            </h3>
                          </button>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {ticket.building} • {ticket.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {remaining !== null && (
                            <span className={`pill-badge ${isOverdue ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : isAtRisk ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"}`}>
                              <Timer size={12} />
                              {formatRemaining(remaining)}
                            </span>
                          )}
                          <StatusBadge status={ticket.status} />
                          <UrgencyBadge urgency={ticket.urgency} />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                        {titleCase(ticket.category)} • Submitted {formatDate(ticket.createdAt)}
                      </p>

                      {/* Work area */}
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={notes[ticket.id] || ""}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          rows={3}
                          placeholder="Add work note..."
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                        />

                        {/* After-photo upload (visible when In Progress) */}
                        {ticket.status === "IN_PROGRESS" && (
                          <div className="flex items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:border-campus-400 hover:text-campus-600 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-campus-500">
                              <Upload size={16} />
                              {afterPhotos[ticket.id] ? afterPhotos[ticket.id].name : "Upload after photo"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.size > 5 * 1024 * 1024) {
                                    setActionState({ ticketId: ticket.id, loading: false, error: "Photo must be under 5MB." });
                                    return;
                                  }
                                  setAfterPhotos((prev) => ({ ...prev, [ticket.id]: file || null }));
                                }}
                              />
                            </label>
                            <span className="text-[11px] text-gray-400">Max 5MB · JPEG, PNG, WebP</span>
                          </div>
                        )}

                        {actionState.ticketId === ticket.id && actionState.error && (
                          <p className="text-sm text-red-600 dark:text-red-300">{actionState.error}</p>
                        )}

                        <div className="flex gap-2">
                          {ticket.status === "ASSIGNED" && (
                            <button
                              disabled={actionState.loading && actionState.ticketId === ticket.id}
                              onClick={() => updateStatus(ticket, "IN_PROGRESS")}
                              className="btn-primary"
                            >
                              <PlayCircle size={16} />
                              {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Start Work"}
                            </button>
                          )}
                          {ticket.status === "IN_PROGRESS" && (
                            <button
                              disabled={actionState.loading && actionState.ticketId === ticket.id}
                              onClick={() => updateStatus(ticket, "RESOLVED")}
                              className="btn-success"
                            >
                              <CheckCheck size={16} />
                              {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Mark Resolved"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---- My Performance Card ---- */}
          <section className="saas-card">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">My Performance</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedTickets.length}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70">Total Resolved</p>
              </div>
              <div className="rounded-xl bg-campus-50 p-4 text-center dark:bg-campus-900/20">
                <p className="text-3xl font-bold text-campus-600 dark:text-campus-400">{resolvedToday}</p>
                <p className="mt-1 text-xs font-medium text-campus-600/70 dark:text-campus-400/70">Resolved Today</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-900/20">
                <div className="flex items-center justify-center gap-1">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">—</span>
                </div>
                <p className="mt-1 text-xs font-medium text-amber-600/70 dark:text-amber-400/70">Avg Rating</p>
              </div>
            </div>
          </section>

          {/* ---- Resolved Tickets ---- */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resolved Tickets</h2>
            {resolvedTickets.length === 0 ? (
              <EmptyState title="No resolved tickets" message="Resolved items will appear here." />
            ) : (
              <div className="grid gap-4">
                {resolvedTickets.map((ticket) => (
                  <article key={ticket.id} className="saas-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <button type="button" onClick={() => openTicket(ticket.id)} className="text-left">
                          <h3 className="font-semibold text-gray-900 hover:text-campus-600 dark:text-white dark:hover:text-campus-400 transition-colors">
                            {ticket.title}
                          </h3>
                        </button>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{ticket.building} • {ticket.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={ticket.status} />
                        <UrgencyBadge urgency={ticket.urgency} />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      {titleCase(ticket.category)} • Submitted {formatDate(ticket.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ---- Ticket Detail Modal ---- */}
      <Modal open={Boolean(selectedTicket) || detailLoading} title="Assigned Ticket Detail" onClose={() => setSelectedTicket(null)}>
        {detailLoading && <LoadingSpinner label="Loading details..." />}
        {selectedTicket && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.ticket.title}</h3>
                <div className="flex gap-2">
                  <StatusBadge status={selectedTicket.ticket.status} />
                  <UrgencyBadge urgency={selectedTicket.ticket.urgency} />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selectedTicket.ticket.description}</p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {titleCase(selectedTicket.ticket.category)} • {selectedTicket.ticket.building} • {selectedTicket.ticket.location}
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
