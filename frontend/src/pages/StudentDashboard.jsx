import {
  CheckCircle2,
  ClipboardList,
  Droplets,
  Hammer,
  Laptop,
  Plus,
  ShieldAlert,
  Sparkles,
  Star,
  Wind,
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

const defaultForm = {
  title: "",
  description: "",
  category: "ELECTRICAL",
  building: "",
  location: "",
  urgency: "MEDIUM",
};

export const StudentDashboard = () => {
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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Submitted", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Resolved", value: stats.resolved },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink dark:text-slate-100">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-mint dark:text-slate-950 dark:hover:bg-emerald-300"
        >
          <Plus size={16} />
          {showForm ? "Hide Ticket Form" : "Submit New Ticket"}
        </button>

        {showForm && (
          <form onSubmit={submitTicket} className="mt-5 grid gap-4 animate-soft-rise md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {titleCase(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Building</label>
              <input
                required
                value={form.building}
                onChange={(e) => setForm((prev) => ({ ...prev, building: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Location</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm((prev) => ({ ...prev, urgency: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {URGENCY_LEVELS.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {titleCase(urgency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Optional Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-slate-800 dark:file:text-slate-200"
              />
            </div>

            {submitError && <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{submitError}</p>}

            <div className="md:col-span-2">
              <button
                disabled={submitLoading}
                className="rounded-xl bg-mint px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitLoading ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Your Tickets</h2>
        {loading && <LoadingSpinner label="Loading your tickets..." />}
        {!loading && error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
        {!loading && !error && tickets.length === 0 && (
          <EmptyState title="No tickets yet" message="Submit your first maintenance issue using the form above." />
        )}
        {!loading && !error && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const Icon = categoryIcon[ticket.category] || ClipboardList;
              return (
                <button
                  type="button"
                  key={ticket.id}
                  onClick={() => openTicket(ticket.id)}
                  className="group rounded-2xl border border-white/60 bg-white/85 p-4 text-left shadow-panel transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-mint" />
                        <h3 className="font-semibold text-ink dark:text-slate-100">{ticket.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{ticket.building} • {ticket.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <UrgencyBadge urgency={ticket.urgency} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {titleCase(ticket.category)} • Submitted {formatDate(ticket.createdAt)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={Boolean(selectedTicket) || selectedLoading} title="Ticket Details" onClose={() => setSelectedTicket(null)}>
        {selectedLoading && <LoadingSpinner label="Loading details..." />}
        {selectedTicket && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{selectedTicket.ticket.title}</h3>
                <div className="flex gap-2">
                  <StatusBadge status={selectedTicket.ticket.status} />
                  <UrgencyBadge urgency={selectedTicket.ticket.urgency} />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{selectedTicket.ticket.description}</p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {titleCase(selectedTicket.ticket.category)} • {selectedTicket.ticket.building} • {selectedTicket.ticket.location}
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Status Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>

            {selectedTicket.rating && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/30 dark:bg-emerald-900/20">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Your Rating</h4>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
                  {selectedTicket.rating.stars} / 5 stars
                </p>
                {selectedTicket.rating.comment && (
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.comment}</p>
                )}
              </div>
            )}

            {canRate && (
              <form onSubmit={submitRating} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Rate Resolution</h4>
                <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Stars</label>
                <select
                  value={rating.stars}
                  onChange={(e) => setRating((prev) => ({ ...prev, stars: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} {value === 1 ? "Star" : "Stars"}
                    </option>
                  ))}
                </select>

                <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-200">Comment</label>
                <textarea
                  rows={3}
                  value={rating.comment}
                  onChange={(e) => setRating((prev) => ({ ...prev, comment: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />

                {ratingError && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{ratingError}</p>}
                <button
                  disabled={ratingLoading}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-mint dark:text-slate-950 dark:hover:bg-emerald-300"
                >
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
