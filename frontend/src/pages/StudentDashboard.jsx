import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Hammer,
  Laptop,
  ReceiptText,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  TicketPlus,
  TriangleAlert,
  Waypoints,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { UserAvatar } from "../components/Common/UserAvatar.jsx";
import { SkeletonLoader } from "../components/Common/SkeletonLoader.jsx";
import { DataTable } from "../components/Common/DataTable.jsx";
import { DashboardHero, DashboardStatGrid } from "../components/Dashboard/DashboardPrimitives.jsx";
import { MotionCardSurface } from "../components/Dashboard/MotionCardSurface.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useAuth } from "../hooks/useAuth";
import { useTickets } from "../hooks/useTickets";
import {
  useActiveBuildingsQuery,
  useActiveRequestTypesQuery,
  useServiceDomainsQuery,
} from "../queries/catalogQueries.js";
import { ticketService } from "../services/ticketService";
import { URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase, toHours } from "../utils/helpers";
import { loadProfilePreferences } from "../utils/profilePreferences";
import {
  getTicketBuildingName,
  getTicketLocationSummary,
  getTicketRequestTypeLabel,
  getTicketServiceDomainKey,
} from "../utils/ticketPresentation";
import { scrollToDashboardSection } from "../components/Dashboard/scrollToDashboardSection";

const OPEN_STUDENT_COMPOSER_EVENT = "dashboard:open-student-composer";

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
  IT: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  FURNITURE: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  STRUCTURAL: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  SAFETY: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  OTHER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_STEPS = ["SUBMITTED", "APPROVED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "RESOLVED"];

const createDefaultForm = ({
  serviceDomainKey = "",
  requestTypeId = "",
  buildingId = "",
} = {}) => ({
  title: "",
  description: "",
  serviceDomainKey,
  requestTypeId,
  buildingId,
  location: "",
  urgency: "MEDIUM",
});

const formatAverageDuration = (hours) => {
  if (!hours) return "No completed tickets yet";
  if (hours >= 48) return `${Math.round(hours / 24)} days average`;
  if (hours >= 1) return `${Math.round(hours)} hours average`;
  return `${Math.max(1, Math.round(hours * 60))} mins average`;
};

const TicketTracker = ({ ticket }) => {
  if (!ticket) return null;
  const currentIndex = STATUS_STEPS.indexOf(ticket.status);
  const progress = ticket.status === "REJECTED" ? 100 : Math.max(10, ((currentIndex + 1) / STATUS_STEPS.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getTicketLocationSummary(ticket)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <UrgencyBadge urgency={ticket.urgency} />
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-gray-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/55">
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Workflow progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${ticket.status === "REJECTED" ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-campus-500 to-sky-400"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {STATUS_STEPS.map((step, index) => {
            const done = index <= currentIndex;
            return (
              <div key={step} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-bold ${
                  done ? "bg-campus-500 text-white shadow-sm shadow-campus-500/25" : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
                >
                  {done && index < currentIndex ? <CheckCircle2 size={14} /> : index + 1}
                </div>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  done ? "text-campus-700 dark:text-campus-300" : "text-gray-400 dark:text-slate-500"
                }`}
                >
                  {titleCase(step)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TrackerDetail = ({ ticket, statusCounts, openUrgentCount, averageResolutionHours }) => {
  if (!ticket) return <EmptyState title="No active request" message="Submit an issue to start tracking progress." />;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current status</p>
          <div className="mt-2"><StatusBadge status={ticket.status} /></div>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Urgency</p>
          <div className="mt-2"><UrgencyBadge urgency={ticket.urgency} /></div>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Urgent open</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{openUrgentCount}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg turnaround</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-"}</p>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-gray-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <TicketTracker ticket={ticket} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Submitted</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{statusCounts.SUBMITTED || 0}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assigned</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{statusCounts.ASSIGNED || 0}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">In progress</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{statusCounts.IN_PROGRESS || 0}</p>
        </div>
      </div>
    </div>
  );
};

const RecentActivityDetail = ({ tickets }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Requests listed</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{tickets.length}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Latest request</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{tickets[0] ? `#${tickets[0].id}` : "-"}</p>
      </div>
      <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Latest building</p>
        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{tickets[0] ? getTicketBuildingName(tickets[0]) : "-"}</p>
      </div>
    </div>

    {tickets.length === 0 ? (
      <EmptyState title="No recent activity" message="Recent requests will appear here once you start filing issues." />
    ) : (
      <div className="space-y-3">
        {tickets.slice(0, 8).map((ticket) => (
          <div key={ticket.id} className="dashboard-list-item px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{ticket.title}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{getTicketLocationSummary(ticket)} | {formatDate(ticket.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={ticket.urgency} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const StudentDashboard = () => {
  const { auth } = useAuth();
  const { tickets, loading, error, refresh } = useTickets(() => ticketService.getMyTickets(), [], { pollMs: 30000 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createDefaultForm());
  const [imageFile, setImageFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [buildingSelectionWarning, setBuildingSelectionWarning] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [rating, setRating] = useState({ stars: 5, comment: "" });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const activeBuildingsQuery = useActiveBuildingsQuery();
  const serviceDomainsQuery = useServiceDomainsQuery();
  const requestTypesQuery = useActiveRequestTypesQuery(form.serviceDomainKey);

  const buildings = useMemo(() => activeBuildingsQuery.data ?? [], [activeBuildingsQuery.data]);
  const serviceDomains = useMemo(() => serviceDomainsQuery.data ?? [], [serviceDomainsQuery.data]);
  const requestTypes = useMemo(() => requestTypesQuery.data ?? [], [requestTypesQuery.data]);
  const buildingError = activeBuildingsQuery.error?.response?.data?.message || "";
  const catalogError =
    serviceDomainsQuery.error?.response?.data?.message
    || requestTypesQuery.error?.response?.data?.message
    || "";
  const requestTypeLoading = Boolean(form.serviceDomainKey) && (requestTypesQuery.isLoading || requestTypesQuery.isFetching);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const avatarPreferences = useMemo(() => loadProfilePreferences(auth?.username), [auth?.username]);

  const sortedTickets = useMemo(
    () => [...tickets].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [tickets]
  );

  const stats = useMemo(() => {
    const total = sortedTickets.length;
    const pending = sortedTickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)).length;
    const resolved = sortedTickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)).length;
    return { total, pending, resolved };
  }, [sortedTickets]);
  const statusCounts = useMemo(
    () => sortedTickets.reduce((accumulator, ticket) => {
      accumulator[ticket.status] = (accumulator[ticket.status] || 0) + 1;
      return accumulator;
    }, {}),
    [sortedTickets]
  );

  const latestActiveTicket = useMemo(
    () => sortedTickets.find((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) || sortedTickets[0],
    [sortedTickets]
  );

  const averageResolutionHours = useMemo(() => {
    const completed = sortedTickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status) && ticket.resolvedAt);
    if (completed.length === 0) return null;
    const totalHours = completed.reduce((sum, ticket) => sum + toHours(ticket.createdAt, ticket.resolvedAt), 0);
    return Math.round((totalHours / completed.length) * 10) / 10;
  }, [sortedTickets]);

  const openUrgentCount = useMemo(
    () => sortedTickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status) && ["HIGH", "CRITICAL"].includes(ticket.urgency)).length,
    [sortedTickets]
  );

  const statCards = useMemo(() => {
    const resolvedRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const highOpen = sortedTickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status) && ticket.urgency === "HIGH").length;
    const criticalOpen = sortedTickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status) && ticket.urgency === "CRITICAL").length;
    return [
      {
        motionId: "student-stat-submitted",
        label: "Submitted",
        value: stats.total,
        icon: ReceiptText,
        tone: "info",
        helper: "Lifetime requests",
        detailTitle: "Submitted requests",
        detailNote: "Your full filing history across campus maintenance issues.",
        detailRows: [
          { label: "Open now", value: stats.pending },
          { label: "Resolved", value: stats.resolved },
          { label: "Rejected", value: statusCounts.REJECTED || 0 },
          { label: "Latest request", value: sortedTickets[0] ? `#${sortedTickets[0].id}` : "-" },
        ],
      },
      {
        motionId: "student-stat-in-flight",
        label: "In Flight",
        value: stats.pending,
        icon: Waypoints,
        tone: "warning",
        helper: "Awaiting campus action",
        detailTitle: "Active requests",
        detailNote: "Requests still moving through review, assignment, or repair.",
        detailRows: [
          { label: "Submitted", value: statusCounts.SUBMITTED || 0 },
          { label: "Approved", value: statusCounts.APPROVED || 0 },
          { label: "Assigned", value: statusCounts.ASSIGNED || 0 },
          { label: "In progress", value: statusCounts.IN_PROGRESS || 0 },
        ],
      },
      {
        motionId: "student-stat-resolved",
        label: "Resolved",
        value: stats.resolved,
        icon: BadgeCheck,
        tone: "success",
        helper: `${resolvedRate}% completion rate`,
        detailTitle: "Resolved requests",
        detailNote: "Completed tickets and the speed at which they were closed.",
        detailRows: [
          { label: "Completion rate", value: `${resolvedRate}%` },
          { label: "Average turnaround", value: averageResolutionHours ? `${Math.round(averageResolutionHours)}h` : "-" },
          { label: "Closed", value: statusCounts.CLOSED || 0 },
          { label: "Resolved", value: statusCounts.RESOLVED || 0 },
        ],
      },
      {
        motionId: "student-stat-urgent-open",
        label: "Urgent Open",
        value: openUrgentCount,
        icon: TriangleAlert,
        tone: "danger",
        helper: "High or critical requests",
        detailTitle: "Urgent open requests",
        detailNote: "Requests that still need action and are marked high priority.",
        detailRows: [
          { label: "High urgency", value: highOpen },
          { label: "Critical urgency", value: criticalOpen },
          { label: "Open requests", value: stats.pending },
          { label: "Urgent share", value: stats.pending > 0 ? `${Math.round((openUrgentCount / stats.pending) * 100)}%` : "0%" },
        ],
      },
    ];
  }, [averageResolutionHours, openUrgentCount, sortedTickets, stats, statusCounts]);

  const ticketColumns = useMemo(() => [
    {
      key: "id",
      header: "ID",
      render: (row) => <span className="font-semibold text-campus-600 dark:text-campus-400">#{row.id}</span>,
      accessor: (row) => row.id,
    },
    {
      key: "title",
      header: "Title",
      render: (row) => {
        const serviceDomainKey = getTicketServiceDomainKey(row);
        const Icon = categoryIcon[serviceDomainKey] || ClipboardList;
        const colorClass = categoryColors[serviceDomainKey] || categoryColors.OTHER;
        return (
          <div className="flex items-center gap-2">
            <div className={`icon-wrap ${colorClass} flex-shrink-0`}><Icon size={16} /></div>
            <div className="min-w-0">
              <span className="block truncate font-medium text-gray-900 dark:text-white">{row.title}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500">{getTicketRequestTypeLabel(row)}</span>
            </div>
          </div>
        );
      },
      accessor: (row) => row.title,
    },
    { key: "building", header: "Location", accessor: (row) => getTicketLocationSummary(row) },
    { key: "urgency", header: "Urgency", render: (row) => <UrgencyBadge urgency={row.urgency} />, accessor: (row) => row.urgency },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} />, accessor: (row) => row.status },
    { key: "createdAt", header: "Submitted", accessor: (row) => formatDate(row.createdAt) },
  ], []);

  const buildTicketSearchText = useCallback((ticket) => [
    ticket.id,
    ticket.title,
    getTicketRequestTypeLabel(ticket),
    getTicketBuildingName(ticket),
    ticket.location,
    ticket.status,
    ticket.urgency,
  ].join(" "), []);

  const filteredTickets = useMemo(() => {
    const query = dashboardSearch.trim().toLowerCase();
    if (!query) return sortedTickets;
    return sortedTickets.filter((ticket) => buildTicketSearchText(ticket).toLowerCase().includes(query));
  }, [buildTicketSearchText, dashboardSearch, sortedTickets]);

  useEffect(() => {
    document.title = "Student Dashboard | CampusFix";
  }, []);

  const submitTicket = async (event) => {
    event.preventDefault();
    if (!buildings.some((building) => String(building.id) === String(form.buildingId))) {
      setBuildingSelectionWarning("The selected building was archived or removed while this form was open. Choose another active building before submitting.");
      setSubmitError("Choose an active building before submitting.");
      return;
    }
    if (!requestTypes.some((requestType) => String(requestType.id) === String(form.requestTypeId))) {
      setSubmitError("Choose a current request type before submitting.");
      return;
    }
    if (!form.requestTypeId || !form.buildingId) {
      setSubmitError("Select a request type and building before submitting.");
      return;
    }
    setSubmitLoading(true);
    setSubmitError("");
    try {
      await ticketService.createTicket({
        title: form.title,
        description: form.description,
        buildingId: Number(form.buildingId),
        requestTypeId: Number(form.requestTypeId),
        location: form.location,
        urgency: form.urgency,
      }, imageFile);
      setForm(createDefaultForm({
        serviceDomainKey: form.serviceDomainKey,
        requestTypeId: form.requestTypeId,
        buildingId: form.buildingId,
      }));
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

  useEffect(() => {
    if (activeBuildingsQuery.isLoading) {
      return;
    }
    const selectedBuildingStillExists = buildings.some((building) => String(building.id) === String(form.buildingId));
    if (form.buildingId && !selectedBuildingStillExists) {
      setBuildingSelectionWarning("The selected building was archived or removed while this form was open. Choose another active building before submitting.");
      setForm((current) => ({ ...current, buildingId: "" }));
      return;
    }
    if (!form.buildingId && !buildingSelectionWarning && buildings.length > 0) {
      setForm((current) => (current.buildingId ? current : { ...current, buildingId: String(buildings[0].id) }));
      return;
    }
    if (form.buildingId && selectedBuildingStillExists && buildingSelectionWarning) {
      setBuildingSelectionWarning("");
    }
  }, [activeBuildingsQuery.isLoading, buildingSelectionWarning, buildings, form.buildingId]);

  useEffect(() => {
    if (serviceDomainsQuery.isLoading) {
      return;
    }
    const hasSelectedServiceDomain = serviceDomains.some((serviceDomain) => serviceDomain.key === form.serviceDomainKey);
    if (form.serviceDomainKey && !hasSelectedServiceDomain) {
      setForm((current) => ({
        ...current,
        serviceDomainKey: serviceDomains[0]?.key || "",
        requestTypeId: "",
      }));
      return;
    }
    if (!form.serviceDomainKey && serviceDomains.length > 0) {
      setForm((current) => (current.serviceDomainKey ? current : {
        ...current,
        serviceDomainKey: serviceDomains[0].key,
      }));
    }
  }, [form.serviceDomainKey, serviceDomains, serviceDomainsQuery.isLoading]);

  useEffect(() => {
    if (!form.serviceDomainKey) {
      if (form.requestTypeId) {
        setForm((current) => ({ ...current, requestTypeId: "" }));
      }
      return;
    }
    if (requestTypesQuery.isLoading || requestTypesQuery.isFetching) {
      return;
    }
    const hasSelectedRequestType = requestTypes.some((requestType) => String(requestType.id) === String(form.requestTypeId));
    if (form.requestTypeId && !hasSelectedRequestType) {
      setForm((current) => ({ ...current, requestTypeId: String(requestTypes[0]?.id || "") }));
      return;
    }
    if (!form.requestTypeId && requestTypes.length > 0) {
      setForm((current) => (current.requestTypeId ? current : {
        ...current,
        requestTypeId: String(requestTypes[0].id),
      }));
    }
  }, [form.requestTypeId, form.serviceDomainKey, requestTypes, requestTypesQuery.isFetching, requestTypesQuery.isLoading]);

  const openComposer = useCallback(() => {
    setShowForm(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToDashboardSection("report"));
    });
  }, []);

  useEffect(() => {
    const handleOpenComposer = () => {
      openComposer();
    };

    window.addEventListener(OPEN_STUDENT_COMPOSER_EVENT, handleOpenComposer);
    return () => window.removeEventListener(OPEN_STUDENT_COMPOSER_EVENT, handleOpenComposer);
  }, [openComposer]);

  useEffect(() => {
    if (!expandedRequestId) {
      return;
    }
    const existsInFilteredList = filteredTickets.some((ticket) => String(ticket.id) === expandedRequestId);
    if (!existsInFilteredList) {
      setExpandedRequestId(null);
    }
  }, [expandedRequestId, filteredTickets]);

  return (
    <div className="dashboard-shell dashboard-shell-student animate-fade-in">
      <DashboardHero id="dashboard" tone="student">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="dashboard-avatar-wrap">
                <UserAvatar
                  fullName={auth?.fullName}
                  username={auth?.username}
                  avatarType={avatarPreferences.avatarType}
                  avatarPreset={avatarPreferences.avatarPreset}
                  avatarImage={avatarPreferences.avatarImage}
                  size={48}
                  className="rounded-xl"
                />
              </div>
              <div>
                <h1 className="dashboard-hero-title">{greeting}, {auth?.fullName || "Student"}</h1>
                <p className="dashboard-hero-subtitle">Submit issues quickly, track progress clearly, and keep every campus request in one place.</p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-3 xl:w-auto">
            <button type="button" onClick={openComposer} className="btn-primary interactive-control w-full sm:w-auto"><TicketPlus size={16} />Submit Issue</button>
            <button type="button" onClick={() => scrollToDashboardSection("tickets")} className="btn-ghost interactive-control w-full sm:w-auto">View Requests<ArrowRight size={15} /></button>
          </div>
        </div>
      </DashboardHero>

      {loading ? <SkeletonLoader variant="stat" count={4} /> : <DashboardStatGrid items={statCards} />}

      {showForm && (
        <MotionCardSurface
          as="section"
          cardId="student-report-composer"
          sectionId="report"
          className="motion-section dashboard-panel interactive-surface"
          trackSection
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report a campus issue</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Strong requests include a precise location, clear description, urgency, and a photo when visibility matters.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost interactive-control w-full sm:w-auto">Close composer</button>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)]">
            <form onSubmit={submitTicket} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
                <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="Short summary of the issue" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Service domain</label>
                <select
                  required
                  value={form.serviceDomainKey}
                  onChange={(event) => setForm((current) => ({ ...current, serviceDomainKey: event.target.value, requestTypeId: "" }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                >
                  <option value="" disabled>Select domain</option>
                  {serviceDomains.map((serviceDomain) => (
                    <option key={serviceDomain.id} value={serviceDomain.key}>{serviceDomain.label}</option>
                  ))}
                </select>
                {catalogError && serviceDomains.length === 0 && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{catalogError}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                <textarea required rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="What happened and what should the team know before arriving?" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Request type</label>
                <select
                  required
                  value={form.requestTypeId}
                  onChange={(event) => setForm((current) => ({ ...current, requestTypeId: event.target.value }))}
                  disabled={!form.serviceDomainKey || requestTypeLoading || requestTypes.length === 0}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30 dark:disabled:bg-slate-800"
                >
                  <option value="" disabled>
                    {!form.serviceDomainKey ? "Select a domain first" : requestTypeLoading ? "Loading request types..." : requestTypes.length === 0 ? "No request types available" : "Select request type"}
                  </option>
                  {requestTypes.map((requestType) => (
                    <option key={requestType.id} value={requestType.id}>{requestType.label}</option>
                  ))}
                </select>
                {catalogError && form.serviceDomainKey && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{catalogError}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Building</label>
                <select
                  required
                  value={form.buildingId}
                  onChange={(event) => {
                    setBuildingSelectionWarning("");
                    setForm((current) => ({ ...current, buildingId: event.target.value }));
                  }}
                  disabled={buildings.length === 0}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30 dark:disabled:bg-slate-800"
                >
                  <option value="" disabled>{buildings.length === 0 ? "No buildings available" : "Select building"}</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>{building.name} ({building.code})</option>
                  ))}
                </select>
                {buildingSelectionWarning && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{buildingSelectionWarning}</p>}
                {buildingError && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{buildingError}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location details</label>
                <input required value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="Room, floor, wing, or nearby landmark" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Urgency</label>
                <select value={form.urgency} onChange={(event) => setForm((current) => ({ ...current, urgency: event.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30">
                  {URGENCY_LEVELS.map((urgency) => <option key={urgency} value={urgency}>{titleCase(urgency)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Before photo <span className="font-normal text-gray-400">(max 5MB)</span></label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    setSubmitError("Image must be under 5MB.");
                    event.target.value = "";
                    return;
                  }
                  setImageFile(file || null);
                }} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-campus-50 file:px-3 file:py-1 file:font-medium file:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:file:bg-slate-800 dark:file:text-campus-400" />
              </div>
              {submitError && <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{submitError}</p>}
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button disabled={submitLoading} className="btn-primary interactive-control w-full sm:w-auto">{submitLoading ? "Submitting..." : "Submit Request"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost interactive-control w-full sm:w-auto">Cancel</button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-[1.2rem] border border-gray-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/55">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">What helps operations move fast</p>
                <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-campus-500" />Exact location: building, floor, room, or nearest landmark.</li>
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-campus-500" />Specific impact: what is blocked, unsafe, leaking, or offline.</li>
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-campus-500" />A photo when visibility matters or access could be unclear.</li>
                </ul>
              </div>
              <div className="rounded-[1.2rem] border border-campus-100 bg-campus-50/70 px-4 py-4 text-sm text-campus-800 dark:border-campus-900/40 dark:bg-campus-900/20 dark:text-campus-100">
                <p className="font-semibold">{formatAverageDuration(averageResolutionHours)}</p>
                <p className="mt-2">Clearer requests usually reach the right team faster and reduce back-and-forth clarification.</p>
              </div>
            </div>
          </div>
        </MotionCardSurface>
      )}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <MotionCardSurface
          as="section"
          cardId="student-current-tracker"
          sectionId="tracker"
          className="motion-section dashboard-panel interactive-surface"
          trackSection
          morphOnClick
          detailTitle="Current request detail"
          detailContent={<TrackerDetail ticket={latestActiveTicket} statusCounts={statusCounts} openUrgentCount={openUrgentCount} averageResolutionHours={averageResolutionHours} />}
          modalWidth="max-w-4xl"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Current request status</h2>
            </div>
            {latestActiveTicket && <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">#{latestActiveTicket.id}</span>}
          </div>
          {latestActiveTicket ? <TicketTracker ticket={latestActiveTicket} /> : <EmptyState title="No requests yet" message="When you submit an issue, the status tracker will appear here." />}
        </MotionCardSurface>

        <MotionCardSurface
          as="section"
          cardId="student-recent-activity"
          className="interactive-surface"
          morphOnClick
          detailTitle="Recent activity detail"
          detailContent={<RecentActivityDetail tickets={sortedTickets} />}
          modalWidth="max-w-4xl"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent activity</h3>
          </div>

          <div className="space-y-4">
            {sortedTickets.length === 0 ? (
              <EmptyState title="No recent activity" message="Your last few requests will appear here once you start filing issues." />
            ) : (
              <div className="space-y-3">
                {sortedTickets.slice(0, 4).map((ticket) => (
                  <button key={ticket.id} type="button" onClick={() => openTicket(ticket.id)} className="dashboard-list-item interactive-row flex w-full items-start justify-between gap-3 px-4 py-3 text-left">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{ticket.title}</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{getTicketLocationSummary(ticket)} | {formatDate(ticket.createdAt)}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </MotionCardSurface>
      </div>

      <MotionCardSurface
        as="section"
        cardId="student-ticket-log"
        sectionId="tickets"
        className="motion-section dashboard-panel interactive-surface"
        trackSection
      >
        {loading ? (
          <SkeletonLoader variant="row" count={5} />
        ) : error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>
        ) : sortedTickets.length === 0 ? (
          <EmptyState title="No requests yet" message="Submit your first campus issue to start building your request history." />
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 sm:hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Request log</h3>
                <span className="pill-badge bg-white/80 text-gray-600 dark:bg-slate-900/80 dark:text-slate-200">
                  {filteredTickets.length} requests
                </span>
              </div>

              <label className="dashboard-table-search relative flex min-w-0 items-center rounded-xl px-3">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={dashboardSearch}
                  onChange={(event) => setDashboardSearch(event.target.value)}
                  placeholder="Search request log"
                  className="w-full bg-transparent py-2.5 pl-8 text-sm outline-none dark:text-gray-200"
                />
              </label>

              {filteredTickets.length === 0 ? (
                <div className="rounded-[1.15rem] border border-dashed border-gray-200 bg-white/50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No requests match the current search</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Try a different keyword or clear the search.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTickets.map((ticket) => {
                    const ticketId = String(ticket.id);
                    const expanded = expandedRequestId === ticketId;
                    const serviceDomainKey = getTicketServiceDomainKey(ticket);
                    const Icon = categoryIcon[serviceDomainKey] || ClipboardList;
                    const colorClass = categoryColors[serviceDomainKey] || categoryColors.OTHER;
                    return (
                      <article key={ticket.id} className="overflow-hidden rounded-[1.15rem] border border-gray-200/80 bg-white/80 dark:border-slate-700/80 dark:bg-slate-900/70">
                        <button
                          type="button"
                          onClick={() => setExpandedRequestId((current) => (current === ticketId ? null : ticketId))}
                          aria-expanded={expanded}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left"
                        >
                          <span className={`icon-wrap ${colorClass} mt-0.5 shrink-0`}><Icon size={16} /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{ticket.title}</p>
                            <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">#{ticket.id} | {formatDate(ticket.createdAt)}</p>
                          </div>
                          <span className="flex items-center gap-2 pl-2">
                            <StatusBadge status={ticket.status} />
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </span>
                        </button>

                        {expanded && (
                          <div className="border-t border-gray-100 px-4 py-3 dark:border-slate-800">
                            <dl className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                              <div className="flex items-start justify-between gap-3">
                                <dt className="font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-500">Type</dt>
                                <dd className="text-right">{getTicketRequestTypeLabel(ticket)}</dd>
                              </div>
                              <div className="flex items-start justify-between gap-3">
                                <dt className="font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-500">Location</dt>
                                <dd className="max-w-[60%] text-right">{getTicketLocationSummary(ticket)}</dd>
                              </div>
                              <div className="flex items-start justify-between gap-3">
                                <dt className="font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-slate-500">Urgency</dt>
                                <dd><UrgencyBadge urgency={ticket.urgency} /></dd>
                              </div>
                            </dl>
                            <button
                              type="button"
                              onClick={() => openTicket(ticket.id)}
                              className="btn-ghost interactive-control mt-3 w-full justify-center"
                            >
                              View full details
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <DataTable
                data={sortedTickets}
                columns={ticketColumns}
                pageSize={10}
                onRowClick={(row) => openTicket(row.id)}
                exportFilename="my-tickets"
                exportTitle="My Tickets Report"
                title="Request log"
                emptyTitle="No requests match the current search"
                emptyMessage="Try a different keyword or clear the search."
                searchValue={dashboardSearch}
                onSearchChange={setDashboardSearch}
                searchPlaceholder="Search title, request type, building, status, or urgency"
                searchAccessor={buildTicketSearchText}
              />
            </div>
          </div>
        )}
      </MotionCardSurface>

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
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">{getTicketRequestTypeLabel(selectedTicket.ticket)} | {getTicketLocationSummary(selectedTicket.ticket)}</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Status Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>
            {selectedTicket.rating && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/30 dark:bg-emerald-900/20">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Your Rating</h4>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className={star <= selectedTicket.rating.stars ? "fill-amber-400 text-amber-400" : "text-gray-300"} />)}
                  <span className="ml-2 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.stars}/5</span>
                </div>
                {selectedTicket.rating.comment && <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.comment}</p>}
              </div>
            )}
            {canRate && (
              <form onSubmit={submitRating} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Rate Resolution</h4>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating((current) => ({ ...current, stars: star }))} className="interactive-control p-0.5 transition-transform hover:scale-110">
                      <Star size={24} className={star <= rating.stars ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-500">{rating.stars}/5</span>
                </div>
                <textarea rows={3} placeholder="Add a comment about the resolution..." value={rating.comment} onChange={(event) => setRating((current) => ({ ...current, comment: event.target.value }))} className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                {ratingError && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{ratingError}</p>}
                <button disabled={ratingLoading} className="btn-primary interactive-control mt-3"><Star size={15} />{ratingLoading ? "Submitting..." : "Submit Rating"}</button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
