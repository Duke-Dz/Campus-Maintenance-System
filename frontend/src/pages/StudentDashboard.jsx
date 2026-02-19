import {
  CheckCircle2,
  ClipboardList,
  ClipboardPlus,
  Droplets,
  FileText,
  Hammer,
  Laptop,
  Plus,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  Wind,
  Wrench,
  Zap,
  Clock,
  ArrowUpRight,
  Search,
  Eye,
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
import { CATEGORIES, URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase } from "../utils/helpers";

const categoryIcon = {
  ELECTRICAL: Zap,
  PLUMBING: Droplets,
  HVAC: Wind,
  CLEANING: Sparkles,
  IT: Laptop,
  FURNITURE: Wrench,
  STRUCTURAL: Hammer,
  SAFETY: ShieldAlert,
  OTHER: ClipboardList,
};

const categoryColors = {
  ELECTRICAL: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  PLUMBING: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  HVAC: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  CLEANING: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  IT: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  FURNITURE: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  STRUCTURAL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  SAFETY: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  OTHER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_STEPS = ["SUBMITTED", "APPROVED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

const defaultForm = {
  title: "",
  description: "",
  category: "ELECTRICAL",
  building: "",
  location: "",
  urgency: "MEDIUM",
};

/* ================================================================== */
/*  Active Ticket Tracker (progress stepper)                          */
/* ================================================================== */
const TicketTracker = ({ ticket }) => {
  if (!ticket) return null;
  const currentIndex = STATUS_STEPS.indexOf(ticket.status);
  const isRejected = ticket.status === "REJECTED";

  return (
    <article className="saas-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Active Ticket Tracker</h3>
        <span className="pill-badge bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400">#{ticket.id}</span>
      </div>
      <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-200">{ticket.title}</p>

      {isRejected ? (
        <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Ticket was rejected by admin</p>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${isCompleted
                        ? "bg-campus-500 text-white shadow-sm shadow-campus-500/25"
                        : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-gray-500"
                      } ${isCurrent ? "ring-4 ring-campus-100 dark:ring-campus-900/30" : ""}`}
                  >
                    {isCompleted && i < currentIndex ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${isCompleted ? "text-campus-600 dark:text-campus-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {titleCase(step.replace("_", " "))}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 w-full min-w-[20px] ${i < currentIndex ? "bg-campus-500" : "bg-gray-200 dark:bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
};

/* ================================================================== */
/*  STUDENT DASHBOARD                                                  */
/* ================================================================== */
export const StudentDashboard = () => {
  const { auth } = useAuth();
  const { tickets, loading, error, refresh } = useTickets(() => ticketService.getMyTickets(), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [rating, setRating] = useState({ stars: 5, comment: "" });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status)).length;
    const resolved = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
    return { total, pending, resolved };
  }, [tickets]);

  const latestActiveTicket = useMemo(
    () => tickets.find((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status)) || tickets[0],
    [tickets]
  );

  const avgRating = useMemo(() => {
    // Placeholder: will compute from ticket ratings when available
    return null;
  }, [tickets]);

  const submitTicket = async (event) => {
    event.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    try {
      await ticketService.createTicket(form, imageFile);
      setForm(defaultForm);
      setImageFile(null);
      setShowForm(false);
      await refresh();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openTicket = async (ticketId) => {
    setSelectedLoading(true);
    try {
      const detail = await ticketService.getTicket(ticketId);
      setSelectedTicket(detail);
      setRating({ stars: 5, comment: "" });
      setRatingError("");
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to load ticket details.");
    } finally {
      setSelectedLoading(false);
    }
  };

  const canRate = selectedTicket && ["RESOLVED", "CLOSED"].includes(selectedTicket.ticket.status) && !selectedTicket.rating;

  const submitRating = async (event) => {
    event.preventDefault();
    if (!selectedTicket) return;
    setRatingLoading(true);
    setRatingError("");
    try {
      await ticketService.rateTicket(selectedTicket.ticket.id, rating);
      const refreshed = await ticketService.getTicket(selectedTicket.ticket.id);
      setSelectedTicket(refreshed);
      await refresh();
    } catch (err) {
      setRatingError(err?.response?.data?.message || "Failed to submit rating.");
    } finally {
      setRatingLoading(false);
    }
  };

  /* ---- greeting ---- */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ---- Welcome Banner ---- */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-campus-500 via-campus-600 to-campus-800 p-6 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm">
              {(auth?.fullName || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{greeting}, {auth?.fullName || "Student"} 👋</h1>
              <p className="mt-0.5 text-sm text-blue-100">
                Report campus issues and track their progress in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="hidden rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 sm:flex items-center gap-2"
          >
            <Plus size={16} />
            Report Issue
          </button>
        </div>
      </section>

      {/* ---- Stats Row (3 cards) ---- */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Submitted", value: stats.total, icon: FileText, color: "bg-blue-100 text-campus-600 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "In Progress", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Report\nIssue", icon: ClipboardPlus, bg: "bg-blue-100 dark:bg-blue-900/30", fg: "text-campus-600 dark:text-blue-400", onClick: () => setShowForm(true) },
            { label: "My\nTickets", icon: ClipboardList, bg: "bg-purple-100 dark:bg-purple-900/30", fg: "text-purple-600 dark:text-purple-400" },
            { label: "Track\nStatus", icon: Search, bg: "bg-amber-100 dark:bg-amber-900/30", fg: "text-amber-600 dark:text-amber-400" },
            { label: "Rate\nService", icon: Star, bg: "bg-rose-100 dark:bg-rose-900/30", fg: "text-rose-600 dark:text-rose-400" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={a.onClick} className="group flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-card dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
                <div className={`icon-wrap ${a.bg}`}>
                  <Icon size={22} className={a.fg} />
                </div>
                <span className="text-center text-xs font-semibold leading-tight text-gray-600 dark:text-gray-300 whitespace-pre-line">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Active Ticket Tracker ---- */}
      {latestActiveTicket && <TicketTracker ticket={latestActiveTicket} />}

      {/* ---- Report Issue Form ---- */}
      <section className="saas-card">
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="btn-primary"
        >
          <Plus size={16} />
          {showForm ? "Hide Ticket Form" : "Submit New Ticket"}
        </button>

        {showForm && (
          <form onSubmit={submitTicket} className="mt-5 grid gap-4 animate-soft-rise md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
              <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30">
                {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Building</label>
              <input required value={form.building} onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
              <input required value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Urgency</label>
              <select value={form.urgency} onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30">
                {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{titleCase(u)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Before Photo <span className="text-gray-400 font-normal">(max 5MB, JPEG/PNG/WebP)</span></label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > 5 * 1024 * 1024) { setSubmitError("Image must be under 5MB."); e.target.value = ""; return; }
                setImageFile(file || null);
              }} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-campus-50 file:px-3 file:py-1 file:text-campus-600 file:font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:file:bg-slate-800 dark:file:text-campus-400" />
            </div>

            {submitError && <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{submitError}</p>}

            <div className="md:col-span-2">
              <button disabled={submitLoading} className="btn-primary">{submitLoading ? "Submitting..." : "Submit Ticket"}</button>
            </div>
          </form>
        )}
      </section>

      {/* ---- Your Tickets ---- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tickets</h2>
        {loading && <LoadingSpinner label="Loading your tickets..." />}
        {!loading && error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
        {!loading && !error && tickets.length === 0 && <EmptyState title="No tickets yet" message="Submit your first maintenance issue using the form above." />}
        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const Icon = categoryIcon[ticket.category] || ClipboardList;
              const colorClass = categoryColors[ticket.category] || categoryColors.OTHER;
              return (
                <button
                  type="button"
                  key={ticket.id}
                  onClick={() => openTicket(ticket.id)}
                  className="group saas-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`icon-wrap ${colorClass}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.title}</h3>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{ticket.building} • {ticket.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <UrgencyBadge urgency={ticket.urgency} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    {titleCase(ticket.category)} • Submitted {formatDate(ticket.createdAt)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ---- Ticket Detail Modal ---- */}
      <Modal open={Boolean(selectedTicket) || selectedLoading} title="Ticket Details" onClose={() => setSelectedTicket(null)}>
        {selectedLoading && <LoadingSpinner label="Loading details..." />}
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
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Status Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>

            {selectedTicket.rating && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/30 dark:bg-emerald-900/20">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Your Rating</h4>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className={s <= selectedTicket.rating.stars ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                  ))}
                  <span className="ml-2 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.stars}/5</span>
                </div>
                {selectedTicket.rating.comment && <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.comment}</p>}
              </div>
            )}

            {canRate && (
              <form onSubmit={submitRating} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Rate Resolution</h4>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating((p) => ({ ...p, stars: s }))} className="p-0.5 transition-transform hover:scale-110">
                      <Star size={24} className={s <= rating.stars ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-500">{rating.stars}/5</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Add a comment about the resolution..."
                  value={rating.comment}
                  onChange={(e) => setRating((p) => ({ ...p, comment: e.target.value }))}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {ratingError && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{ratingError}</p>}
                <button disabled={ratingLoading} className="btn-primary mt-3">
                  <Star size={15} />
                  {ratingLoading ? "Submitting..." : "Submit Rating"}
                </button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
