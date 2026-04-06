import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  CircleCheckBig,
  ScanSearch,
  Ticket,
  Workflow,
} from "lucide-react";
import { ConfirmDialog } from "../components/Common/ConfirmDialog.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { SkeletonLoader } from "../components/Common/SkeletonLoader.jsx";
import { MotionCardSurface } from "../components/Dashboard/MotionCardSurface.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";

// Admin modular components
import { AdminToolbar } from "../components/Admin/AdminToolbar.jsx";
import { AdminStatCards } from "../components/Admin/AdminStatCards.jsx";
import { SLAComplianceCard } from "../components/Admin/SLAComplianceCard.jsx";
import { AnalyticsCharts } from "../components/Admin/AnalyticsCharts.jsx";
import { TicketOperationsTable } from "../components/Admin/TicketOperationsTable.jsx";
import { BuildingsRanking } from "../components/Admin/BuildingsRanking.jsx";
import { CrewPerformance } from "../components/Admin/CrewPerformance.jsx";
import { StaffOnboarding } from "../components/Admin/StaffOnboarding.jsx";
import { UserManagementTable } from "../components/Admin/UserManagementTable.jsx";
import { BroadcastCenter } from "../components/Admin/BroadcastCenter.jsx";
import { ReportBuilder } from "../components/Admin/ReportBuilder.jsx";
import { AdminConfigurationSection } from "../components/Admin/AdminConfigurationSection.jsx";

import { useAuth } from "../hooks/useAuth";
import {
  useAdminBuildingsQuery,
  useAllRequestTypesQuery,
  useAllSupportCategoriesQuery,
  useServiceDomainsQuery,
} from "../queries/catalogQueries.js";
import { analyticsService } from "../services/analyticsService";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { exportToCSV, exportToPDF } from "../services/exportService";
import { STATUSES, URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase } from "../utils/helpers";
import {
  getTicketBuildingName,
  getTicketLocationSummary,
  getTicketRequestTypeLabel,
  getTicketServiceDomainLabel,
} from "../utils/ticketPresentation";

/* ------------------------------------------------------------------ */
/*  SLA helpers                                                        */
/* ------------------------------------------------------------------ */
const SLA_TARGETS = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 168 };
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const getSlaStatus = (ticket) => {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) return "resolved";
  const targetHrs = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  if (elapsed >= targetHrs) return "breached";
  if (elapsed >= targetHrs * 0.75) return "at-risk";
  return "on-track";
};

const trendPercent = (current, previous) => {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
};

const formatScopeValue = (value) => (value ? formatDate(value) : "All time");
const buildTicketSearchText = (ticket) => [
  ticket.id,
  ticket.title,
  getTicketServiceDomainLabel(ticket),
  getTicketRequestTypeLabel(ticket),
  ticket.status,
  ticket.urgency,
  getTicketBuildingName(ticket),
  ticket.location,
  ticket.assignedTo?.fullName,
].join(" ").toLowerCase();

/* ================================================================== */
/*  ADMIN DASHBOARD - Layout Orchestrator                              */
/* ================================================================== */
export const AdminDashboard = () => {
  const { auth } = useAuth();
  const [configurationCollapsed, setConfigurationCollapsed] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    serviceDomainKey: "",
    requestTypeId: "",
    buildingId: "",
    urgency: "",
    assignee: "",
  });
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [reportOpen, setReportOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const deferredTableSearch = useDeferredValue(tableSearch);

  /* ---- analytics state ---- */
  const [summary, setSummary] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [topBuildings, setTopBuildings] = useState([]);
  const [crewPerformance, setCrewPerformance] = useState([]);
  const [allTicketsForTrend, setAllTicketsForTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const analyticsInitializedRef = useRef(false);

  /* ---- tickets state ---- */
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const ticketsInitializedRef = useRef(false);
  const {
    data: configBuildings = [],
    isLoading: buildingsLoading,
    refetch: refetchConfigBuildings,
  } = useAdminBuildingsQuery();
  const {
    data: serviceDomains = [],
    isLoading: serviceDomainsLoading,
    refetch: refetchServiceDomains,
  } = useServiceDomainsQuery();
  const {
    data: requestTypes = [],
    isLoading: requestTypesLoading,
    refetch: refetchRequestTypes,
  } = useAllRequestTypesQuery();
  const {
    data: supportCategories = [],
    isLoading: supportCategoriesLoading,
    refetch: refetchSupportCategories,
  } = useAllSupportCategoriesQuery();
  const configLoading = buildingsLoading || serviceDomainsLoading || requestTypesLoading || supportCategoriesLoading;

  /* ---- users state ---- */
  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [latestInvite, setLatestInvite] = useState(null);

  /* ---- broadcast state ---- */
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [scheduledEventsLoading, setScheduledEventsLoading] = useState(true);

  /* ---- ticket detail modal ---- */
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [assignForm, setAssignForm] = useState({ assigneeId: "", note: "" });
  const [assignmentRecommendations, setAssignmentRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ status: "APPROVED", note: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });

  /* ================================================================ */
  /*  DATA FETCHERS                                                    */
  /* ================================================================ */
  const refreshAnalytics = useCallback(async ({ background = false } = {}) => {
    const showLoading = !background || !analyticsInitializedRef.current;
    if (showLoading) {
      setAnalyticsLoading(true);
    }
    try {
      const [summaryData, resolutionData, topBuildingsData, crewData, trendTickets] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getResolutionTime(),
        analyticsService.getTopBuildings(),
        analyticsService.getCrewPerformance(),
        ticketService.getAllTickets({}),
      ]);
      setSummary(summaryData);
      setResolution(resolutionData);
      setTopBuildings(topBuildingsData);
      setCrewPerformance(crewData);
      setAllTicketsForTrend(trendTickets);
      analyticsInitializedRef.current = true;
    } catch { /* handled by loading states */ }
    finally {
      if (showLoading) {
        setAnalyticsLoading(false);
      }
    }
  }, []);

  const refreshTickets = useCallback(async ({ background = false } = {}) => {
    const showLoading = !background || !ticketsInitializedRef.current;
    if (showLoading) {
      setTicketLoading(true);
    }
    try {
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
      ticketsInitializedRef.current = true;
    } catch { /* handled by loading */ }
    finally {
      if (showLoading) {
        setTicketLoading(false);
      }
    }
  }, [filters]);

  const refreshUsers = async () => {
    setUsersLoading(true);
    try {
      const [usersData, maintenanceData] = await Promise.all([userService.getAllUsers(), userService.getMaintenanceUsers()]);
      setUsers(usersData);
      setMaintenanceUsers(maintenanceData);
    } catch { /* handled */ }
    finally { setUsersLoading(false); }
  };

  const refreshScheduledEvents = async () => {
    setScheduledEventsLoading(true);
    try { setScheduledEvents(await userService.getScheduledBroadcasts()); }
    catch { /* handled */ }
    finally { setScheduledEventsLoading(false); }
  };

  const refreshConfiguration = useCallback(
    async () => Promise.all([
      refetchConfigBuildings(),
      refetchServiceDomains(),
      refetchRequestTypes(),
      refetchSupportCategories(),
    ]),
    [refetchConfigBuildings, refetchRequestTypes, refetchServiceDomains, refetchSupportCategories]
  );

  useEffect(() => { refreshAnalytics(); refreshUsers(); refreshScheduledEvents(); }, [refreshAnalytics]);
  useEffect(() => { refreshTickets(); }, [refreshTickets]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshTickets({ background: true });
      refreshAnalytics({ background: true });
    }, 30000);
    return () => window.clearInterval(timer);
  }, [refreshAnalytics, refreshTickets]);
  useEffect(() => {
    if (!filters.requestTypeId) {
      return;
    }
    const matchesSelectedDomain = requestTypes.some((requestType) =>
      String(requestType.id) === String(filters.requestTypeId)
      && (!filters.serviceDomainKey || requestType.serviceDomainKey === filters.serviceDomainKey)
    );
    if (!matchesSelectedDomain) {
      setFilters((current) => ({ ...current, requestTypeId: "" }));
    }
  }, [filters.requestTypeId, filters.serviceDomainKey, requestTypes]);

  /* ================================================================ */
  /*  COMPUTED DATA                                                    */
  /* ================================================================ */
  const pendingCount = (summary?.byStatus?.SUBMITTED || 0) + (summary?.byStatus?.APPROVED || 0) + (summary?.byStatus?.ASSIGNED || 0);
  const inProgressCount = (summary?.byStatus?.ACCEPTED || 0) + (summary?.byStatus?.IN_PROGRESS || 0);
  const resolvedCount = (summary?.byStatus?.RESOLVED || 0) + (summary?.byStatus?.CLOSED || 0);

  const ticketTrends = useMemo(() => {
    const now = new Date();
    const startCurrent = new Date(now.getTime() - 6 * ONE_DAY_MS);
    const startPrevious = new Date(startCurrent.getTime() - 7 * ONE_DAY_MS);
    const endPrevious = new Date(startCurrent.getTime() - 1);
    const inRange = (v, s, e) => { if (!v) return false; const d = new Date(v); return d >= s && d <= e; };
    const totalCurrent = allTicketsForTrend.filter((t) => inRange(t.createdAt, startCurrent, now)).length;
    const totalPrevious = allTicketsForTrend.filter((t) => inRange(t.createdAt, startPrevious, endPrevious)).length;
    const resolvedCurrent = allTicketsForTrend.filter((t) => inRange(t.resolvedAt, startCurrent, now) && ["RESOLVED", "CLOSED"].includes(t.status)).length;
    const resolvedPrevious = allTicketsForTrend.filter((t) => inRange(t.resolvedAt, startPrevious, endPrevious) && ["RESOLVED", "CLOSED"].includes(t.status)).length;
    return { total: trendPercent(totalCurrent, totalPrevious), resolved: trendPercent(resolvedCurrent, resolvedPrevious) };
  }, [allTicketsForTrend]);

  const slaOverview = useMemo(() => {
    const active = allTicketsForTrend.filter((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status));
    const breached = active.filter((t) => getSlaStatus(t) === "breached").length;
    const atRisk = active.filter((t) => getSlaStatus(t) === "at-risk").length;
    const onTrack = active.length - breached - atRisk;
    const compliance = active.length > 0 ? Math.round(((active.length - breached) / active.length) * 100) : 100;
    return { breached, atRisk, onTrack, compliance, total: active.length };
  }, [allTicketsForTrend]);
  const ticketSearchIndex = useMemo(
    () => tickets.map((ticket) => ({
      ticket,
      createdAt: new Date(ticket.createdAt),
      searchText: buildTicketSearchText(ticket),
    })),
    [tickets]
  );

  const ticketOpsData = useMemo(() => {
    const query = deferredTableSearch.trim().toLowerCase();
    return ticketSearchIndex.filter((item) => {
      const withinFrom = !dateRange.from || item.createdAt >= dateRange.from;
      const withinTo = !dateRange.to || item.createdAt <= dateRange.to;
      const withinSearch = !query || item.searchText.includes(query);
      return withinFrom && withinTo && withinSearch;
    }).map((item) => item.ticket);
  }, [dateRange.from, dateRange.to, deferredTableSearch, ticketSearchIndex]);

  const criticalOpen = useMemo(
    () => allTicketsForTrend.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status) && ticket.urgency === "CRITICAL").length,
    [allTicketsForTrend]
  );
  const upcomingBroadcasts = useMemo(
    () => scheduledEvents.filter((item) => item.status !== "CANCELLED" && item.scheduledFor && new Date(item.scheduledFor) >= new Date()).length,
    [scheduledEvents]
  );
  const statCards = useMemo(() => [
    {
      motionId: "admin-stat-total-tickets",
      label: "Total Tickets",
      value: summary?.totalTickets ?? 0,
      icon: Ticket,
      tone: "info",
      trend: ticketTrends.total,
      helper: "Campus-wide volume",
      detailTitle: "Ticket volume",
      detailNote: "Campus-wide request volume across the current analytics snapshot.",
      detailRows: [
        { label: "Tickets in workflow scope", value: tickets.length },
        { label: "Critical open", value: criticalOpen },
        { label: "Scheduled broadcasts", value: upcomingBroadcasts },
        { label: "SLA health", value: `${slaOverview.compliance}%` },
      ],
    },
    {
      motionId: "admin-stat-pending",
      label: "Pending",
      value: pendingCount,
      icon: ScanSearch,
      tone: "warning",
      trend: null,
      helper: "Waiting for action",
      detailTitle: "Pending tickets",
      detailNote: "Tickets still waiting for review, approval, or assignment.",
      detailRows: [
        { label: "Submitted", value: summary?.byStatus?.SUBMITTED || 0 },
        { label: "Approved", value: summary?.byStatus?.APPROVED || 0 },
        { label: "Assigned", value: summary?.byStatus?.ASSIGNED || 0 },
        { label: "Breached SLA", value: slaOverview.breached },
      ],
    },
    {
      motionId: "admin-stat-in-progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Workflow,
      tone: "campus",
      trend: null,
      helper: "Actively being handled",
      detailTitle: "In-progress tickets",
      detailNote: "Work already underway and currently occupying active operational capacity.",
      detailRows: [
        { label: "In progress", value: inProgressCount },
        { label: "At risk", value: slaOverview.atRisk },
        { label: "On track", value: slaOverview.onTrack },
        { label: "Tickets in workflow scope", value: tickets.length },
      ],
    },
    {
      motionId: "admin-stat-resolved",
      label: "Resolved",
      value: resolvedCount,
      icon: CircleCheckBig,
      tone: "success",
      trend: ticketTrends.resolved,
      helper: "Closed or completed",
      detailTitle: "Resolved tickets",
      detailNote: "Tickets that have completed the workflow and moved out of the active queue.",
      detailRows: [
        { label: "Resolved", value: summary?.byStatus?.RESOLVED || 0 },
        { label: "Closed", value: summary?.byStatus?.CLOSED || 0 },
        { label: "Average resolution", value: `${resolution?.overallAverageHours ?? "-"}h` },
        { label: "7 day trend", value: ticketTrends.resolved !== null && ticketTrends.resolved !== undefined ? `${ticketTrends.resolved}%` : "-" },
      ],
    },
  ], [criticalOpen, inProgressCount, pendingCount, resolution?.overallAverageHours, resolvedCount, slaOverview.atRisk, slaOverview.breached, slaOverview.compliance, slaOverview.onTrack, summary?.byStatus?.APPROVED, summary?.byStatus?.ASSIGNED, summary?.byStatus?.CLOSED, summary?.byStatus?.RESOLVED, summary?.byStatus?.SUBMITTED, summary?.totalTickets, ticketTrends, tickets.length, upcomingBroadcasts]);

  /* ================================================================ */
  /*  HANDLERS                                                         */
  /* ================================================================ */
  const handleInviteStaff = async (form) => {
    const response = await userService.createStaffInvite(form);
    setLatestInvite(response);
    toast.success(`Invite sent to ${response.email}.`);
    await refreshUsers();
    return response;
  };

  const handleBroadcast = async (form) => {
    const response = await userService.sendBroadcast(form);
    toast.success(`Broadcast sent to ${response.recipientCount} users.`);
    return response;
  };
  const handleSchedule = async (form) => {
    const response = await userService.scheduleBroadcast(form);
    toast.success("Event scheduled successfully.");
    await refreshScheduledEvents();
    return response;
  };
  const handleCancelScheduled = async (id) => {
    await userService.cancelScheduledBroadcast(id);
    toast.success("Scheduled event cancelled.");
    await refreshScheduledEvents();
  };

  const handleGlobalExport = (format) => {
    if (format === "report") { setReportOpen(true); return; }
    const cols = [
      { key: "id", header: "ID" },
      { key: "title", header: "Title" },
      { key: "serviceDomain", header: "Service Domain", accessor: (r) => getTicketServiceDomainLabel(r) },
      { key: "requestType", header: "Request Type", accessor: (r) => getTicketRequestTypeLabel(r) },
      { key: "urgency", header: "Urgency" },
      { key: "status", header: "Status" },
      { key: "building", header: "Location", accessor: (r) => getTicketLocationSummary(r) },
      { key: "createdAt", header: "Submitted", accessor: (r) => formatDate(r.createdAt) },
      { key: "assignee", header: "Assignee", accessor: (r) => r.assignedTo?.fullName || "Unassigned" },
    ];
    const fn = `campusfix-all-tickets-${new Date().toISOString().slice(0, 10)}`;
    if (format === "csv") exportToCSV(ticketOpsData, cols, fn);
    else if (format === "pdf") exportToPDF(ticketOpsData, cols, fn, "All Tickets Report");
  };

  /* ---- ticket detail modal actions ---- */
  const loadAssignmentRecommendations = useCallback(async (ticketId, status) => {
    if (status !== "APPROVED") {
      setAssignmentRecommendations([]);
      setRecommendationsLoading(false);
      return;
    }
    setRecommendationsLoading(true);
    try {
      const data = await ticketService.getAssignmentRecommendations(ticketId);
      setAssignmentRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setAssignmentRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  const openTicket = async (ticketId) => {
    setSelectedLoading(true);
    setActionError("");
    try {
      const detail = await ticketService.getTicket(ticketId);
      setSelectedTicket(detail);
      setAssignForm({ assigneeId: "", note: "" });
      await loadAssignmentRecommendations(detail.ticket.id, detail.ticket.status);
      setOverrideForm({ status: detail.ticket.status === "REJECTED" ? "APPROVED" : detail.ticket.status, note: "" });
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to load ticket."); }
    finally { setSelectedLoading(false); }
  };
  const runAction = async (task) => {
    if (!selectedTicket) return;
    setActionLoading(true);
    setActionError("");
    try {
      await task();
      const refreshed = await ticketService.getTicket(selectedTicket.ticket.id);
      setSelectedTicket(refreshed);
      await loadAssignmentRecommendations(refreshed.ticket.id, refreshed.ticket.status);
      await Promise.all([refreshTickets(), refreshAnalytics()]);
    } catch (err) { setActionError(err?.response?.data?.message || "Action failed."); }
    finally { setActionLoading(false); }
  };
  const askConfirm = (title, message, onConfirm) => setConfirmDialog({ open: true, title, message, onConfirm });
  const approveTicket = () => runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "APPROVED", note: "Approved by admin" }));
  const rejectTicket = () => askConfirm("Reject Ticket", "This marks the ticket as rejected. Continue?", () => {
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
    runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "REJECTED", note: "Rejected by admin" }));
  });
  const assignTicket = () => {
    if (!assignForm.assigneeId) { setActionError("Select a maintenance user first."); return; }
    runAction(() => ticketService.assignTicket(selectedTicket.ticket.id, { assigneeId: Number(assignForm.assigneeId), note: assignForm.note }));
  };
  const overrideStatus = () => askConfirm("Override Status", "Bypasses default workflow. Confirm?", () => {
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
    runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, {
      status: overrideForm.status,
      note: overrideForm.note || "Admin override",
      override: true,
    }));
  });

  useEffect(() => {
    document.title = "Admin Dashboard | CampusFix";
  }, []);

  const activeScopeFilters = [
    filters.status,
    filters.serviceDomainKey,
    filters.requestTypeId,
    filters.buildingId,
    filters.urgency,
    filters.assignee,
    tableSearch.trim(),
  ].filter(Boolean).length;
  const reportScopeDetail = (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Visible tickets</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{ticketOpsData.length}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active filters</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{activeScopeFilters}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">From</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{formatScopeValue(dateRange.from)}</p>
        </div>
        <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">To</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{formatScopeValue(dateRange.to)}</p>
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-gray-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Reporting controls</h4>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Generate packets and exports from the visible ticket scope without leaving the dashboard.</p>
        <div className="mt-5">
          <AdminToolbar
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onExport={handleGlobalExport}
            onGenerateReport={() => setReportOpen(true)}
          />
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="dashboard-shell animate-fade-in">
      <section id="dashboard" data-dashboard-section="true" className="motion-section dashboard-panel saas-card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h1>
          <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">
            {auth?.fullName || "Admin"}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ticket trackers, SLA compliance, building pressure, and crew performance for daily operations.
        </p>
      </section>

      {analyticsLoading ? <SkeletonLoader variant="stat" count={4} /> : <AdminStatCards items={statCards} />}

      {!analyticsLoading && (
        <div className="motion-grid grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr]">
          <SLAComplianceCard slaOverview={slaOverview} resolution={resolution} />
          <BuildingsRanking topBuildings={topBuildings} />
          <CrewPerformance crewPerformance={crewPerformance} resolution={resolution} />
        </div>
      )}

      {ticketLoading ? (
        <SkeletonLoader variant="row" count={5} />
      ) : (
        <TicketOperationsTable
          tickets={ticketOpsData}
          filters={filters}
          setFilters={setFilters}
          maintenanceUsers={maintenanceUsers}
          onOpenTicket={openTicket}
          statuses={STATUSES}
          serviceDomains={serviceDomains}
          requestTypes={requestTypes}
          buildings={configBuildings}
          urgencyLevels={URGENCY_LEVELS}
          searchValue={tableSearch}
          onSearchChange={setTableSearch}
        />
      )}

      <StaffOnboarding
        maintenanceUsers={maintenanceUsers}
        onInviteStaff={handleInviteStaff}
        latestInvite={latestInvite}
      />

      {usersLoading ? <SkeletonLoader variant="row" count={5} /> : <UserManagementTable users={users} loading={usersLoading} />}

      <BroadcastCenter
        onBroadcast={handleBroadcast}
        onSchedule={handleSchedule}
        onCancelScheduled={handleCancelScheduled}
        scheduledEvents={scheduledEvents}
        scheduledEventsLoading={scheduledEventsLoading}
      />

      <MotionCardSurface
        as="section"
        cardId="admin-report-scope"
        sectionId="reports"
        className="motion-section dashboard-panel interactive-surface"
        trackSection
        morphOnClick
        detailTitle="Reports and export scope"
        detailContent={reportScopeDetail}
        modalWidth="max-w-4xl"
      >
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reports and export scope</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Set the operational date window for exports and reporting packs, then generate records from the visible ticket scope.</p>
        </div>
        <AdminToolbar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleGlobalExport}
          onGenerateReport={() => setReportOpen(true)}
        />
      </MotionCardSurface>

      {!analyticsLoading && <AnalyticsCharts tickets={allTicketsForTrend} />}

      <section id="configuration" data-dashboard-section="true" className="motion-section dashboard-panel saas-card">
        <button
          type="button"
          onClick={() => setConfigurationCollapsed((current) => !current)}
          className="interactive-control flex w-full items-center justify-between rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 text-left dark:border-slate-700/70 dark:bg-slate-900/70"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Buildings, request types, and support categories.</p>
          </div>
          <ChevronDown size={18} className={`text-gray-500 transition-transform ${configurationCollapsed ? "" : "rotate-180"}`} />
        </button>

        {!configurationCollapsed && (
          <div className="mt-4">
            {configLoading ? (
              <SkeletonLoader variant="row" count={3} />
            ) : (
              <AdminConfigurationSection
                buildings={configBuildings}
                serviceDomains={serviceDomains}
                requestTypes={requestTypes}
                supportCategories={supportCategories}
                onRefresh={() => Promise.all([refreshConfiguration(), refreshTickets(), refreshAnalytics()])}
              />
            )}
          </div>
        )}
      </section>

      <ReportBuilder
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        dataSource={{ tickets: ticketOpsData, users, slaOverview, topBuildings, crewPerformance, resolution }}
      />

      {/* ---- Ticket Detail Modal ---- */}
      <Modal open={Boolean(selectedTicket) || selectedLoading} title="Ticket Details" onClose={() => {
        setSelectedTicket(null);
        setAssignmentRecommendations([]);
        setRecommendationsLoading(false);
      }}>
        {selectedLoading && <LoadingSpinner label="Loading details..." />}
        {selectedTicket && (
          <div className="space-y-5">
            {/* Info */}
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.ticket.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selectedTicket.ticket.status} />
                  <UrgencyBadge urgency={selectedTicket.ticket.urgency} />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selectedTicket.ticket.description}</p>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {getTicketServiceDomainLabel(selectedTicket.ticket)} | {getTicketRequestTypeLabel(selectedTicket.ticket)} | {getTicketLocationSummary(selectedTicket.ticket)}
              </p>
            </div>

            {/* Before / After photos */}
            {(selectedTicket.ticket.imageUrl || selectedTicket.ticket.afterImageUrl) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTicket.ticket.imageUrl && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Before</p>
                    <img src={selectedTicket.ticket.imageUrl} alt="Before" className="w-full rounded-xl border border-gray-200 object-cover dark:border-slate-700" />
                  </div>
                )}
                {selectedTicket.ticket.afterImageUrl && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">After</p>
                    <img src={selectedTicket.ticket.afterImageUrl} alt="After" className="w-full rounded-xl border border-gray-200 object-cover dark:border-slate-700" />
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Status Timeline</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>

            {/* Admin Actions */}
            {!["RESOLVED", "CLOSED"].includes(selectedTicket.ticket.status) && (
              <div className="space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Admin Actions</h4>

                {selectedTicket.ticket.status === "SUBMITTED" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button disabled={actionLoading} onClick={approveTicket} className="btn-primary interactive-control">
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                    <button disabled={actionLoading} onClick={rejectTicket} className="btn-danger interactive-control">
                      Reject
                    </button>
                  </div>
                )}

                {selectedTicket.ticket.status === "APPROVED" && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">Assignment recommendations</p>
                          <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">Ranked by current workload, similar work history, building familiarity, and recent throughput.</p>
                        </div>
                        {recommendationsLoading && <span className="text-xs text-emerald-700 dark:text-emerald-300">Loading...</span>}
                      </div>
                      {!recommendationsLoading && assignmentRecommendations.length > 0 && (
                        <div className="mt-3 grid gap-2">
                          {assignmentRecommendations.map((recommendation, index) => (
                            <button
                              key={recommendation.userId}
                              type="button"
                              onClick={() => setAssignForm((current) => ({
                                ...current,
                                assigneeId: String(recommendation.userId),
                              }))}
                              className="rounded-xl border border-emerald-200 bg-white/90 px-3 py-3 text-left transition hover:border-emerald-400 hover:bg-white dark:border-emerald-900/60 dark:bg-slate-900/80 dark:hover:border-emerald-500"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {index + 1}. {recommendation.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">@{recommendation.username}</p>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200">
                                  Score {recommendation.score}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                {recommendation.reasons.join(" ")}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      {!recommendationsLoading && assignmentRecommendations.length === 0 && (
                        <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">No ranked recommendations are available for this ticket yet.</p>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Assign To</label>
                        <select value={assignForm.assigneeId}
                          onChange={(e) => setAssignForm((p) => ({ ...p, assigneeId: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                          <option value="">Select staff...</option>
                          {maintenanceUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Note</label>
                        <input value={assignForm.note}
                          onChange={(e) => setAssignForm((p) => ({ ...p, note: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          placeholder="Optional note..." />
                      </div>
                    </div>
                    <button disabled={actionLoading} onClick={assignTicket} className="btn-primary interactive-control">
                      {actionLoading ? "Assigning..." : "Assign Ticket"}
                    </button>
                  </div>
                )}

                {/* Override */}
                <div className="border-t border-gray-100 pt-3 dark:border-slate-700">
                  <p className="mb-2 text-xs text-gray-400">Admin Override</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <select value={overrideForm.status}
                      onChange={(e) => setOverrideForm((p) => ({ ...p, status: e.target.value }))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                      {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                    </select>
                    <input value={overrideForm.note}
                      onChange={(e) => setOverrideForm((p) => ({ ...p, note: e.target.value }))}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="Override reason..." />
                    <button disabled={actionLoading} onClick={overrideStatus} className="btn-ghost interactive-control sm:whitespace-nowrap">
                      Override
                    </button>
                  </div>
                </div>

                {actionError && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">{actionError}</p>}
              </div>
            )}

            {/* Rating */}
            {selectedTicket.rating && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/30 dark:bg-emerald-900/20">
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Student Rating</h4>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {"★".repeat(selectedTicket.rating.stars)}{"☆".repeat(5 - selectedTicket.rating.stars)} {selectedTicket.rating.stars}/5
                </p>
                {selectedTicket.rating.comment && <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">{selectedTicket.rating.comment}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false, title: "", message: "", onConfirm: null })}
      />
    </div>
  );
};
