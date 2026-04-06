import {
  BadgeCheck,
  CheckCheck,
  ClipboardClock,
  Hammer,
  HardHat,
  PlayCircle,
  Search,
  Star,
  Timer,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { SkeletonLoader } from "../components/Common/SkeletonLoader.jsx";
import { DataTable } from "../components/Common/DataTable.jsx";
import { DashboardStatGrid } from "../components/Dashboard/DashboardPrimitives.jsx";
import { MotionCardSurface } from "../components/Dashboard/MotionCardSurface.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import {
  useAllRequestTypesQuery,
  useOperationalBuildingsQuery,
  useServiceDomainsQuery,
} from "../queries/catalogQueries.js";
import { ticketService } from "../services/ticketService";
import { formatDate, toHours } from "../utils/helpers";
import {
  getTicketBuildingName,
  getTicketLocationSummary,
  getTicketRequestTypeLabel,
  getTicketServiceDomainKey,
  getTicketServiceDomainLabel,
} from "../utils/ticketPresentation";

const SLA_TARGETS = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 168 };
const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const buildTicketSearchText = (ticket) => [
  ticket.id,
  ticket.title,
  getTicketBuildingName(ticket),
  ticket.location,
  getTicketServiceDomainLabel(ticket),
  getTicketRequestTypeLabel(ticket),
  ticket.status,
  ticket.urgency,
].join(" ").toLowerCase();

const getSlaRemaining = (ticket) => {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) return null;
  const targetHours = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  return targetHours - elapsed;
};

const formatRemaining = (hours) => {
  if (hours <= 0) return "Overdue";
  if (hours < 1) return `${Math.round(hours * 60)}m left`;
  if (hours < 24) return `${Math.round(hours)}h left`;
  return `${Math.round(hours / 24)}d left`;
};

const WorkQueueCard = ({ ticket, note, afterPhoto, actionState, onNoteChange, onPhotoChange, onOpenTicket, onUpdateStatus, onRespondAssignment }) => {
  const remaining = getSlaRemaining(ticket);
  const targetHours = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = remaining === null ? targetHours : Math.max(0, targetHours - remaining);
  const progress = Math.min(100, Math.round((elapsed / targetHours) * 100));
  const isOverdue = remaining !== null && remaining <= 0;
  const isAtRisk = remaining !== null && remaining > 0 && remaining <= targetHours * 0.25;
  const urgencyBorderColor = {
    CRITICAL: "border-l-red-500",
    HIGH: "border-l-orange-500",
    MEDIUM: "border-l-campus-500",
    LOW: "border-l-gray-400",
  };

  return (
    <MotionCardSurface
      cardId={`maintenance-work-order-${ticket.id}`}
      className={`dashboard-panel interactive-surface border-l-4 ${urgencyBorderColor[ticket.urgency] || "border-l-gray-300"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={() => onOpenTicket(ticket.id)} className="interactive-control text-left">
            <h3 className="font-semibold text-gray-900 transition-colors hover:text-campus-600 dark:text-white dark:hover:text-campus-400">
              {ticket.title}
            </h3>
          </button>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getTicketLocationSummary(ticket)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{getTicketRequestTypeLabel(ticket)} | Submitted {formatDate(ticket.createdAt)}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>SLA burn</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800">
          <div className={`h-full rounded-full ${isOverdue ? "bg-gradient-to-r from-red-500 to-rose-400" : isAtRisk ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-campus-500 to-emerald-400"}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <textarea value={note} onChange={(event) => onNoteChange(ticket.id, event.target.value)} rows={3} placeholder="Add work note..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" />
        {ticket.status === "IN_PROGRESS" && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="interactive-control flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:border-campus-400 hover:text-campus-600 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-campus-500">
              <Upload size={16} />
              {afterPhoto ? afterPhoto.name : "Upload after photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => onPhotoChange(ticket.id, event.target.files?.[0] || null)} />
            </label>
            <span className="text-[11px] text-gray-400">Max 5MB | JPEG, PNG, WebP</span>
          </div>
        )}
        {actionState.ticketId === ticket.id && actionState.error && <p className="text-sm text-red-600 dark:text-red-300">{actionState.error}</p>}
        <div className="flex flex-wrap gap-2">
          {ticket.status === "ASSIGNED" && (
            <>
              <button disabled={actionState.loading && actionState.ticketId === ticket.id} onClick={() => onRespondAssignment(ticket, true)} className="btn-primary interactive-control w-full sm:w-auto">
                <BadgeCheck size={16} />
                {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Accept"}
              </button>
              <button disabled={actionState.loading && actionState.ticketId === ticket.id} onClick={() => onRespondAssignment(ticket, false)} className="btn-ghost interactive-control w-full sm:w-auto">
                Decline
              </button>
            </>
          )}
          {ticket.status === "ACCEPTED" && (
            <button disabled={actionState.loading && actionState.ticketId === ticket.id} onClick={() => onUpdateStatus(ticket, "IN_PROGRESS")} className="btn-primary interactive-control w-full sm:w-auto">
              <PlayCircle size={16} />
              {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Start Work"}
            </button>
          )}
          {ticket.status === "IN_PROGRESS" && (
            <button disabled={actionState.loading && actionState.ticketId === ticket.id} onClick={() => onUpdateStatus(ticket, "RESOLVED")} className="btn-success interactive-control w-full sm:w-auto">
              <CheckCheck size={16} />
              {actionState.loading && actionState.ticketId === ticket.id ? "Updating..." : "Mark Resolved"}
            </button>
          )}
        </div>
      </div>
    </MotionCardSurface>
  );
};

const OperationalBriefDetail = ({ queueHealth, avgRating, avgRatingLoading, averageResolutionHours, resolvedToday, activeCount, resolvedCount }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Overdue items</p>
        <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">{queueHealth.overdue}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">At risk soon</p>
        <p className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">{queueHealth.atRisk}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average rating</p>
        <p className="mt-1 text-lg font-semibold text-campus-600 dark:text-campus-400">{avgRatingLoading ? "..." : avgRating ?? "-"}</p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Average turnaround</p>
        <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-"}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active queue</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{activeCount}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Resolved history</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{resolvedCount}</p>
      </div>
    </div>

    <div className="rounded-[1.2rem] border border-gray-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Shift pace</span>
        <span>{resolvedToday} resolved today</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-campus-500 to-emerald-400"
          style={{ width: `${activeCount > 0 ? Math.min(100, Math.round(((resolvedToday + 1) / (activeCount + resolvedToday + 1)) * 100)) : 18}%` }}
        />
      </div>
    </div>
  </div>
);

export const MaintenanceDashboard = () => {
  const { auth } = useAuth();
  const { tickets, loading, error, refresh } = useTickets(() => ticketService.getAssignedTickets(), [], { pollMs: 30000 });
  const [notes, setNotes] = useState({});
  const [actionState, setActionState] = useState({ ticketId: null, loading: false, error: "" });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [afterPhotos, setAfterPhotos] = useState({});
  const [avgRating, setAvgRating] = useState(null);
  const [avgRatingLoading, setAvgRatingLoading] = useState(false);
  const [queueFilters, setQueueFilters] = useState({ serviceDomainKey: "", requestTypeId: "", buildingId: "" });
  const [dashboardSearch, setDashboardSearch] = useState("");
  const deferredDashboardSearch = useDeferredValue(dashboardSearch);
  const serviceDomainsQuery = useServiceDomainsQuery();
  const requestTypesQuery = useAllRequestTypesQuery();
  const buildingsQuery = useOperationalBuildingsQuery();

  const serviceDomains = useMemo(() => serviceDomainsQuery.data ?? [], [serviceDomainsQuery.data]);
  const requestTypes = useMemo(() => requestTypesQuery.data ?? [], [requestTypesQuery.data]);
  const buildings = useMemo(() => buildingsQuery.data ?? [], [buildingsQuery.data]);
  const catalogError =
    buildingsQuery.error?.response?.data?.message
    || serviceDomainsQuery.error?.response?.data?.message
    || requestTypesQuery.error?.response?.data?.message
    || "";

  useEffect(() => {
    document.title = "Maintenance Dashboard | CampusFix";
  }, []);

  const availableRequestTypes = useMemo(() => {
    if (!queueFilters.serviceDomainKey) {
      return requestTypes;
    }
    return requestTypes.filter((requestType) => requestType.serviceDomainKey === queueFilters.serviceDomainKey);
  }, [queueFilters.serviceDomainKey, requestTypes]);

  const catalogFilteredTickets = useMemo(() => tickets.filter((ticket) => {
    if (queueFilters.serviceDomainKey && getTicketServiceDomainKey(ticket) !== queueFilters.serviceDomainKey) {
      return false;
    }
    if (queueFilters.requestTypeId && String(ticket.requestType?.id || "") !== String(queueFilters.requestTypeId)) {
      return false;
    }
    if (queueFilters.buildingId && String(ticket.building?.id || "") !== String(queueFilters.buildingId)) {
      return false;
    }
    return true;
  }), [queueFilters.buildingId, queueFilters.requestTypeId, queueFilters.serviceDomainKey, tickets]);

  const activeTickets = useMemo(
    () => catalogFilteredTickets.filter((ticket) => ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(ticket.status)).sort((left, right) => (urgencyOrder[left.urgency] ?? 5) - (urgencyOrder[right.urgency] ?? 5)),
    [catalogFilteredTickets]
  );
  const resolvedTickets = useMemo(
    () => catalogFilteredTickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)).sort((left, right) => new Date(right.resolvedAt || right.createdAt) - new Date(left.resolvedAt || left.createdAt)),
    [catalogFilteredTickets]
  );
  const resolvedToday = useMemo(() => {
    const today = new Date().toDateString();
    return resolvedTickets.filter((ticket) => ticket.resolvedAt && new Date(ticket.resolvedAt).toDateString() === today).length;
  }, [resolvedTickets]);
  const assignedCount = useMemo(
    () => activeTickets.filter((ticket) => ticket.status === "ASSIGNED").length,
    [activeTickets]
  );
  const inProgressCount = useMemo(
    () => activeTickets.filter((ticket) => ["ACCEPTED", "IN_PROGRESS"].includes(ticket.status)).length,
    [activeTickets]
  );
  const closedCount = useMemo(
    () => resolvedTickets.filter((ticket) => ticket.status === "CLOSED").length,
    [resolvedTickets]
  );
  const queueHealth = useMemo(() => activeTickets.reduce((accumulator, ticket) => {
    const remaining = getSlaRemaining(ticket);
    if (remaining !== null && remaining <= 0) accumulator.overdue += 1;
    else if (remaining !== null && remaining <= (SLA_TARGETS[ticket.urgency] || 72) * 0.25) accumulator.atRisk += 1;
    return accumulator;
  }, { overdue: 0, atRisk: 0 }), [activeTickets]);

  const averageResolutionHours = useMemo(() => {
    const completedWithDates = resolvedTickets.filter((ticket) => ticket.resolvedAt);
    if (completedWithDates.length === 0) return null;
    const totalHours = completedWithDates.reduce((sum, ticket) => sum + toHours(ticket.createdAt, ticket.resolvedAt), 0);
    return Math.round((totalHours / completedWithDates.length) * 10) / 10;
  }, [resolvedTickets]);
  const activeTicketIndex = useMemo(
    () => activeTickets.map((ticket) => ({ ticket, searchText: buildTicketSearchText(ticket) })),
    [activeTickets]
  );

  const filteredActiveTickets = useMemo(() => {
    const query = deferredDashboardSearch.trim().toLowerCase();
    if (!query) return activeTickets;
    return activeTicketIndex.filter((item) => item.searchText.includes(query)).map((item) => item.ticket);
  }, [activeTicketIndex, activeTickets, deferredDashboardSearch]);
  const activeFilterCount = useMemo(
    () => [queueFilters.serviceDomainKey, queueFilters.requestTypeId, queueFilters.buildingId, dashboardSearch.trim()].filter(Boolean).length,
    [dashboardSearch, queueFilters.buildingId, queueFilters.requestTypeId, queueFilters.serviceDomainKey]
  );

  const statCards = useMemo(() => [
    {
      motionId: "maintenance-stat-assigned",
      label: "Assigned",
      value: assignedCount,
      icon: ClipboardClock,
      tone: "info",
      helper: "Ready to start",
      detailTitle: "Assigned work orders",
      detailNote: "Tickets assigned to you that have not been started yet.",
      detailRows: [
        { label: "Assigned", value: assignedCount },
        { label: "Total active", value: activeTickets.length },
        { label: "Overdue", value: queueHealth.overdue },
        { label: "At risk soon", value: queueHealth.atRisk },
      ],
    },
    {
      motionId: "maintenance-stat-in-progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Hammer,
      tone: "warning",
      helper: "Actively being worked",
      detailTitle: "In-progress work orders",
      detailNote: "Tasks already underway and still counting against active queue load.",
      detailRows: [
        { label: "In progress", value: inProgressCount },
        { label: "Assigned", value: assignedCount },
        { label: "Total active", value: activeTickets.length },
        { label: "Search filtered", value: dashboardSearch ? "Yes" : "No" },
      ],
    },
    {
      motionId: "maintenance-stat-resolved-today",
      label: "Resolved Today",
      value: resolvedToday,
      icon: BadgeCheck,
      tone: "success",
      helper: "Closed this shift",
      detailTitle: "Resolved today",
      detailNote: "Work completed during the current day.",
      detailRows: [
        { label: "Resolved today", value: resolvedToday },
        { label: "Total resolved", value: resolvedTickets.length },
        { label: "Average rating", value: avgRatingLoading ? "..." : avgRating ?? "-" },
        { label: "Average turnaround", value: averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-" },
      ],
    },
    {
      motionId: "maintenance-stat-total-resolved",
      label: "Total Resolved",
      value: resolvedTickets.length,
      icon: HardHat,
      tone: "campus",
      helper: "Completed work history",
      detailTitle: "Completed work history",
      detailNote: "Resolved and closed jobs already finished by your queue.",
      detailRows: [
        { label: "Resolved", value: resolvedTickets.length - closedCount },
        { label: "Closed", value: closedCount },
        { label: "Average rating", value: avgRatingLoading ? "..." : avgRating ?? "-" },
        { label: "Average turnaround", value: averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-" },
      ],
    },
  ], [activeTickets.length, assignedCount, averageResolutionHours, avgRating, avgRatingLoading, closedCount, dashboardSearch, inProgressCount, queueHealth.atRisk, queueHealth.overdue, resolvedTickets.length, resolvedToday]);

  const resolvedColumns = useMemo(() => [
    { key: "id", header: "ID", render: (row) => <span className="font-semibold text-campus-600 dark:text-campus-400">#{row.id}</span>, accessor: (row) => row.id },
    { key: "title", header: "Title", render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.title}</span>, accessor: (row) => row.title },
    { key: "building", header: "Location", accessor: (row) => getTicketLocationSummary(row) },
    { key: "serviceDomain", header: "Domain", accessor: (row) => getTicketServiceDomainLabel(row) },
    { key: "requestType", header: "Request Type", accessor: (row) => getTicketRequestTypeLabel(row) },
    { key: "urgency", header: "Urgency", render: (row) => <UrgencyBadge urgency={row.urgency} />, accessor: (row) => row.urgency },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} />, accessor: (row) => row.status },
    { key: "createdAt", header: "Submitted", accessor: (row) => formatDate(row.createdAt) },
  ], []);

  useEffect(() => {
    let mounted = true;
    const loadAvgRating = async () => {
      if (resolvedTickets.length === 0) { setAvgRating(null); setAvgRatingLoading(false); return; }
      setAvgRatingLoading(true);
      try {
        const details = await Promise.all(resolvedTickets.map((ticket) => ticketService.getTicket(ticket.id).catch(() => null)));
        const ratedValues = details.map((detail) => detail?.rating?.stars).filter((value) => typeof value === "number");
        if (!mounted) return;
        if (ratedValues.length === 0) { setAvgRating(null); return; }
        setAvgRating(Math.round((ratedValues.reduce((sum, value) => sum + value, 0) / ratedValues.length) * 10) / 10);
      } finally {
        if (mounted) setAvgRatingLoading(false);
      }
    };
    loadAvgRating();
    return () => { mounted = false; };
  }, [resolvedTickets]);

  useEffect(() => {
    if (!queueFilters.requestTypeId) {
      return;
    }
    const matchesSelectedDomain = requestTypes.some((requestType) =>
      String(requestType.id) === String(queueFilters.requestTypeId)
      && (!queueFilters.serviceDomainKey || requestType.serviceDomainKey === queueFilters.serviceDomainKey)
    );
    if (!matchesSelectedDomain) {
      setQueueFilters((current) => ({ ...current, requestTypeId: "" }));
    }
  }, [queueFilters.requestTypeId, queueFilters.serviceDomainKey, requestTypes]);

  useEffect(() => {
    if (!queueFilters.buildingId) {
      return;
    }
    const buildingStillExists = buildings.some((building) => String(building.id) === String(queueFilters.buildingId));
    if (!buildingStillExists) {
      setQueueFilters((current) => ({ ...current, buildingId: "" }));
    }
  }, [buildings, queueFilters.buildingId]);

  const updateStatus = async (ticket, status) => {
    const note = notes[ticket.id] || "";
    if (status === "RESOLVED" && !note.trim()) {
      setActionState({ ticketId: ticket.id, loading: false, error: "Work note is required to resolve." });
      return;
    }

    setActionState({ ticketId: ticket.id, loading: true, error: "" });
    try {
      const afterPhoto = afterPhotos[ticket.id];
      if (status === "RESOLVED" && afterPhoto) await ticketService.uploadAfterPhoto(ticket.id, afterPhoto);
      await ticketService.updateStatus(ticket.id, { status, note });
      setNotes((current) => ({ ...current, [ticket.id]: "" }));
      setAfterPhotos((current) => {
        const copy = { ...current };
        delete copy[ticket.id];
        return copy;
      });
      await refresh();
    } catch (err) {
      setActionState({ ticketId: ticket.id, loading: false, error: err?.response?.data?.message || "Status update failed." });
      return;
    }
    setActionState({ ticketId: null, loading: false, error: "" });
  };

  const respondToAssignment = async (ticket, accepted) => {
    setActionState({ ticketId: ticket.id, loading: true, error: "" });
    try {
      const note = notes[ticket.id] || "";
      await ticketService.respondToAssignment(ticket.id, { accepted, note });
      setNotes((current) => ({ ...current, [ticket.id]: "" }));
      await refresh();
    } catch (err) {
      setActionState({
        ticketId: ticket.id,
        loading: false,
        error: err?.response?.data?.message || "Could not update assignment response.",
      });
      return;
    }
    setActionState({ ticketId: null, loading: false, error: "" });
  };

  const openTicket = async (ticketId) => {
    setDetailLoading(true);
    try { setSelectedTicket(await ticketService.getTicket(ticketId)); }
    finally { setDetailLoading(false); }
  };

  return (
    <div className="dashboard-shell animate-fade-in">
      <section id="dashboard" data-dashboard-section="true" className="motion-section dashboard-panel saas-card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h1>
          <span className="pill-badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            {auth?.fullName || "Maintenance"}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Current shift summary for assigned, in-progress, overdue risk, and completed work.
        </p>
      </section>

      {loading ? <SkeletonLoader variant="stat" count={4} /> : <DashboardStatGrid items={statCards} />}

      {loading && <SkeletonLoader variant="card" count={3} />}
      {!loading && error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

      {!loading && !error && (
        <>
          <div className="rounded-[1.3rem] border border-gray-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Queue filters</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Narrow assigned work by service domain, request type, or building before opening a work order.</p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <span className="pill-badge bg-white/80 text-gray-600 dark:bg-slate-950/80 dark:text-slate-200">{activeFilterCount} active filters</span>
                {(activeFilterCount > 0 || dashboardSearch.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQueueFilters({ serviceDomainKey: "", requestTypeId: "", buildingId: "" });
                      setDashboardSearch("");
                    }}
                    className="btn-ghost interactive-control"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <select
                value={queueFilters.serviceDomainKey}
                onChange={(event) => setQueueFilters((current) => ({
                  ...current,
                  serviceDomainKey: event.target.value,
                  requestTypeId: "",
                }))}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
              >
                <option value="">All Domains</option>
                {serviceDomains.map((serviceDomain) => (
                  <option key={serviceDomain.id} value={serviceDomain.key}>{serviceDomain.label}</option>
                ))}
              </select>
              <select
                value={queueFilters.requestTypeId}
                onChange={(event) => setQueueFilters((current) => ({ ...current, requestTypeId: event.target.value }))}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
              >
                <option value="">All Request Types</option>
                {availableRequestTypes.map((requestType) => (
                  <option key={requestType.id} value={requestType.id}>{requestType.label}</option>
                ))}
              </select>
              <select
                value={queueFilters.buildingId}
                onChange={(event) => setQueueFilters((current) => ({ ...current, buildingId: event.target.value }))}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
              >
                <option value="">All Buildings</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.name}{building.active ? "" : " (Archived)"}</option>
                ))}
              </select>
              <div className="flex items-center rounded-xl border border-dashed border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-400">
                {catalogError || (buildingsQuery.isLoading || requestTypesQuery.isLoading || serviceDomainsQuery.isLoading ? "Loading filters..." : "Filters apply to both the active queue and resolved log.")}
              </div>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.92fr)]">
            <MotionCardSurface
              as="section"
              cardId="maintenance-work-queue"
              sectionId="work-queue"
              className="motion-section dashboard-panel interactive-surface"
              trackSection
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active work orders</h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Search here only narrows the live queue you are currently working.</p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                  <label className="dashboard-table-search relative flex min-w-0 flex-1 items-center px-3 sm:min-w-[260px] sm:flex-none">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={dashboardSearch}
                      onChange={(event) => setDashboardSearch(event.target.value)}
                      placeholder="Search active work orders"
                      className="w-full bg-transparent py-2 pl-8 text-sm outline-none dark:text-gray-200"
                    />
                  </label>
                  <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">{filteredActiveTickets.length} visible</span>
                </div>
              </div>

              {filteredActiveTickets.length === 0 ? (
                <EmptyState title="No active tickets" message={dashboardSearch ? "No active work orders match the current search." : "All assigned tickets are currently resolved."} />
              ) : (
                <div className="motion-grid grid gap-4">
                  {filteredActiveTickets.map((ticket) => (
                    <WorkQueueCard
                      key={ticket.id}
                      ticket={ticket}
                      note={notes[ticket.id] || ""}
                      afterPhoto={afterPhotos[ticket.id]}
                      actionState={actionState}
                      onNoteChange={(ticketId, value) => setNotes((current) => ({ ...current, [ticketId]: value }))}
                      onPhotoChange={(ticketId, file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          setActionState({ ticketId, loading: false, error: "Photo must be under 5MB." });
                          return;
                        }
                        setAfterPhotos((current) => ({ ...current, [ticketId]: file || null }));
                      }}
                      onOpenTicket={openTicket}
                      onUpdateStatus={updateStatus}
                      onRespondAssignment={respondToAssignment}
                    />
                  ))}
                </div>
              )}
            </MotionCardSurface>

            <div className="space-y-6">
              <MotionCardSurface
                as="section"
                cardId="maintenance-operational-brief"
                className="interactive-surface"
                morphOnClick
                detailTitle="Operational brief detail"
                detailContent={(
                  <OperationalBriefDetail
                    queueHealth={queueHealth}
                    avgRating={avgRating}
                    avgRatingLoading={avgRatingLoading}
                    averageResolutionHours={averageResolutionHours}
                    resolvedToday={resolvedToday}
                    activeCount={activeTickets.length}
                    resolvedCount={resolvedTickets.length}
                  />
                )}
                modalWidth="max-w-3xl"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Operational brief</h3>
                </div>
                <div className="space-y-3">
                  <div className="dashboard-list-item px-4 py-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">Overdue items</span><span className="text-sm font-bold text-red-600 dark:text-red-400">{queueHealth.overdue}</span></div></div>
                  <div className="dashboard-list-item px-4 py-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">At risk soon</span><span className="text-sm font-bold text-amber-600 dark:text-amber-400">{queueHealth.atRisk}</span></div></div>
                  <div className="dashboard-list-item px-4 py-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">Average rating</span><span className="text-sm font-bold text-campus-600 dark:text-campus-400">{avgRatingLoading ? "..." : avgRating ?? "-"}</span></div></div>
                  <div className="dashboard-list-item px-4 py-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-700 dark:text-gray-200">Average turnaround</span><span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-"}</span></div></div>
                </div>
              </MotionCardSurface>
            </div>
          </div>

          <MotionCardSurface
            as="section"
            cardId="maintenance-resolved-log"
            sectionId="resolved"
            className="motion-section dashboard-panel interactive-surface"
            trackSection
          >
            <DataTable
              data={resolvedTickets}
              columns={resolvedColumns}
              pageSize={10}
              onRowClick={(row) => openTicket(row.id)}
              exportFilename="resolved-tickets"
              exportTitle="My Resolved Tickets"
              title="Resolved log"
              emptyTitle="No resolved tickets"
              emptyMessage="Resolved items will appear here."
              searchable={false}
            />
          </MotionCardSurface>
        </>
      )}

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
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{getTicketRequestTypeLabel(selectedTicket.ticket)} | {getTicketLocationSummary(selectedTicket.ticket)}</p>
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
