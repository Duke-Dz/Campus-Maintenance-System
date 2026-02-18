import { CheckCheck, PlayCircle, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useTickets } from "../hooks/useTickets";
import { ticketService } from "../services/ticketService";
import { formatDate, titleCase } from "../utils/helpers";

export const MaintenanceDashboard = () => {
  const { tickets, loading, error, refresh } = useTickets(() => ticketService.getAssignedTickets(), []);
  const [notes, setNotes] = useState({});
  const [actionState, setActionState] = useState({ ticketId: null, loading: false, error: "" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const activeTickets = useMemo(() => tickets.filter((ticket) => ["ASSIGNED", "IN_PROGRESS"].includes(ticket.status)), [tickets]);
  const resolvedTickets = useMemo(() => tickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)), [tickets]);

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
      await refresh();
    } catch (err) {
      setActionState({
        ticketId: ticket.id,
        loading: false,
        error: err?.response?.data?.message || "Status update failed.",
      });
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

  const renderCard = (ticket) => (
    <article key={ticket.id} className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={() => openTicket(ticket.id)} className="text-left">
            <h3 className="font-semibold text-ink hover:text-mint dark:text-slate-100 dark:hover:text-emerald-300">{ticket.title}</h3>
          </button>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {ticket.building} • {ticket.location}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={ticket.status} />
          <UrgencyBadge urgency={ticket.urgency} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {titleCase(ticket.category)} • Submitted {formatDate(ticket.createdAt)}
      </p>

      {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
        <div className="mt-4 space-y-3">
          <textarea
            value={notes[ticket.id] || ""}
            onChange={(e) => setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
            rows={3}
            placeholder="Add work note..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          {actionState.ticketId === ticket.id && actionState.error && (
            <p className="text-sm text-red-600 dark:text-red-300">{actionState.error}</p>
          )}
          <div className="flex gap-2">
            {ticket.status === "ASSIGNED" && (
              <button
                disabled={actionState.loading && actionState.ticketId === ticket.id}
                onClick={() => updateStatus(ticket, "IN_PROGRESS")}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-mint dark:text-slate-950 dark:hover:bg-emerald-300"
              >
                <PlayCircle size={16} />
                {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Start Work"}
              </button>
            )}
            {ticket.status === "IN_PROGRESS" && (
              <button
                disabled={actionState.loading && actionState.ticketId === ticket.id}
                onClick={() => updateStatus(ticket, "RESOLVED")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCheck size={16} />
                {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Mark Resolved"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-ink dark:text-slate-100">
          <Wrench size={18} className="text-mint" />
          <h2 className="text-lg font-semibold">Assigned Work Queue</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          You can only view and update tickets assigned to your account.
        </p>
      </section>

      {loading && <LoadingSpinner label="Loading assigned tickets..." />}
      {!loading && error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

      {!loading && !error && (
        <>
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-ink dark:text-slate-100">Active Tickets</h3>
            {activeTickets.length === 0 ? (
              <EmptyState title="No active tickets" message="All assigned tickets are currently resolved." />
            ) : (
              <div className="grid gap-4">{activeTickets.map(renderCard)}</div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-ink dark:text-slate-100">Resolved Tickets</h3>
            {resolvedTickets.length === 0 ? (
              <EmptyState title="No resolved tickets" message="Resolved items will appear here." />
            ) : (
              <div className="grid gap-4">{resolvedTickets.map(renderCard)}</div>
            )}
          </section>
        </>
      )}

      <Modal open={Boolean(selectedTicket) || detailLoading} title="Assigned Ticket Detail" onClose={() => setSelectedTicket(null)}>
        {detailLoading && <LoadingSpinner label="Loading details..." />}
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
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
