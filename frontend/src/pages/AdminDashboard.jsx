import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileText,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Send,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { ConfirmDialog } from "../components/Common/ConfirmDialog.jsx";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { UserAvatar } from "../components/Common/UserAvatar.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useAuth } from "../hooks/useAuth";
import { analyticsService } from "../services/analyticsService";
import { authService } from "../services/authService";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { CATEGORIES, STATUSES, URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase, toHours } from "../utils/helpers";
import { loadProfilePreferences } from "../utils/profilePreferences";

const pieColors = ["#3B82F6", "#1E40AF", "#EF4444", "#0EA5E9", "#F59E0B", "#8B5CF6", "#64748B"];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  SLA helpers                                                        */
/* ------------------------------------------------------------------ */
const SLA_TARGETS = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 168 };

const getSlaStatus = (ticket) => {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) return "resolved";
  const targetHrs = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  if (elapsed >= targetHrs) return "breached";
  if (elapsed >= targetHrs * 0.75) return "at-risk";
  return "on-track";
};

const trendPercent = (current, previous) => {
  if (current === 0 && previous === 0) {
    return null;
  }
  if (previous === 0) {
    return 100;
  }
  return Math.round(((current - previous) / previous) * 100);
};

/* ================================================================== */
/*  ADMIN DASHBOARD                                                    */
/* ================================================================== */
export const AdminDashboard = () => {
  const { auth } = useAuth();
  const [filters, setFilters] = useState({ status: "", category: "", urgency: "", assignee: "", search: "" });
  const [userFilters, setUserFilters] = useState({ role: "", search: "" });

  /* analytics state */
  const [summary, setSummary] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [topBuildings, setTopBuildings] = useState([]);
  const [crewPerformance, setCrewPerformance] = useState([]);
  const [allTicketsForTrend, setAllTicketsForTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  /* tickets state */
  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState("");

  /* users state */
  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  /* add staff state */
  const [staffForm, setStaffForm] = useState({ username: "", email: "", fullName: "" });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffNotice, setStaffNotice] = useState("");
  const [latestInvite, setLatestInvite] = useState(null);
  const [staffSuggestions, setStaffSuggestions] = useState([]);
  const [staffSuggestionLoading, setStaffSuggestionLoading] = useState(false);

  /* broadcast state */
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", audience: "ALL" });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastError, setBroadcastError] = useState("");
  const [broadcastResult, setBroadcastResult] = useState(null);

  /* ticket detail modal */
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [assignForm, setAssignForm] = useState({ assigneeId: "", note: "" });
  const [overrideForm, setOverrideForm] = useState({ status: "APPROVED", note: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });

  /* ---- fetchers ---- */
  const refreshAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
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
    } catch (err) {
      setAnalyticsError(err?.response?.data?.message || "Failed to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const refreshTickets = useCallback(async () => {
    setTicketLoading(true);
    setTicketError("");
    try {
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
    } catch (err) {
      setTicketError(err?.response?.data?.message || "Failed to load tickets.");
    } finally {
      setTicketLoading(false);
    }
  }, [filters]);

  const refreshUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const [usersData, maintenanceData] = await Promise.all([userService.getAllUsers(), userService.getMaintenanceUsers()]);
      setUsers(usersData);
      setMaintenanceUsers(maintenanceData);
    } catch (err) {
      setUsersError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStaffSuggestions = async (usernameValue, fullNameValue) => {
    const username = usernameValue?.trim();
    if (!username || username.length < 3) {
      setStaffSuggestions([]);
      return;
    }
    setStaffSuggestionLoading(true);
    try {
      const suggestions = await authService.getUsernameSuggestions(username, fullNameValue || "");
      setStaffSuggestions(suggestions);
    } catch {
      setStaffSuggestions([]);
    } finally {
      setStaffSuggestionLoading(false);
    }
  };

  useEffect(() => {
    refreshAnalytics();
    refreshUsers();
  }, []);
  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);
  useEffect(() => {
    const handleNavigate = (event) => {
      const targetId = event.detail?.id;
      if (!targetId) return;
      const section = document.getElementById(targetId);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSearch = (event) => {
      const query = event.detail?.query?.trim();
      if (!query) return;
      setFilters((prev) => ({ ...prev, search: query }));
      window.requestAnimationFrame(() => {
        document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    window.addEventListener("dashboard:navigate", handleNavigate);
    window.addEventListener("dashboard:search", handleSearch);
    return () => {
      window.removeEventListener("dashboard:navigate", handleNavigate);
      window.removeEventListener("dashboard:search", handleSearch);
    };
  }, []);

  /* ---- computed data ---- */
  const categoryData = useMemo(
    () => Object.entries(summary?.byCategory || {}).map(([name, value]) => ({ name: titleCase(name), value })),
    [summary]
  );
  const statusData = useMemo(
    () => Object.entries(summary?.byStatus || {}).map(([name, value]) => ({ name: titleCase(name), value })),
    [summary]
  );
  const resolutionTrend = useMemo(() => {
    const grouped = allTicketsForTrend
      .filter((t) => t.resolvedAt)
      .reduce((acc, t) => {
        const day = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!acc[day]) acc[day] = [];
        acc[day].push(toHours(t.createdAt, t.resolvedAt));
        return acc;
      }, {});
    return Object.entries(grouped)
      .map(([day, values]) => ({
        day,
        averageHours: Math.round((values.reduce((s, c) => s + c, 0) / values.length) * 100) / 100,
      }))
      .slice(-8);
  }, [allTicketsForTrend]);

  const pendingCount = (summary?.byStatus?.SUBMITTED || 0) + (summary?.byStatus?.APPROVED || 0) + (summary?.byStatus?.ASSIGNED || 0);
  const inProgressCount = summary?.byStatus?.IN_PROGRESS || 0;
  const resolvedCount = (summary?.byStatus?.RESOLVED || 0) + (summary?.byStatus?.CLOSED || 0);

  const ticketTrends = useMemo(() => {
    const now = new Date();
    const endCurrent = new Date(now);
    const startCurrent = new Date(now.getTime() - 6 * ONE_DAY_MS);
    const startPrevious = new Date(startCurrent.getTime() - 7 * ONE_DAY_MS);
    const endPrevious = new Date(startCurrent.getTime() - 1);

    const inRange = (value, start, end) => {
      if (!value) return false;
      const date = new Date(value);
      return date >= start && date <= end;
    };

    const totalCurrent = allTicketsForTrend.filter((ticket) => inRange(ticket.createdAt, startCurrent, endCurrent)).length;
    const totalPrevious = allTicketsForTrend.filter((ticket) => inRange(ticket.createdAt, startPrevious, endPrevious)).length;

    const resolvedCurrent = allTicketsForTrend.filter(
      (ticket) => inRange(ticket.resolvedAt, startCurrent, endCurrent) && ["RESOLVED", "CLOSED"].includes(ticket.status)
    ).length;
    const resolvedPrevious = allTicketsForTrend.filter(
      (ticket) => inRange(ticket.resolvedAt, startPrevious, endPrevious) && ["RESOLVED", "CLOSED"].includes(ticket.status)
    ).length;

    return {
      total: trendPercent(totalCurrent, totalPrevious),
      resolved: trendPercent(resolvedCurrent, resolvedPrevious),
    };
  }, [allTicketsForTrend]);

  const statCards = useMemo(
    () => ([
      {
        label: "Total Tickets",
        value: summary?.totalTickets ?? 0,
        icon: FileText,
        color: "bg-blue-100 text-campus-600 dark:bg-blue-900/30 dark:text-blue-400",
        trend: ticketTrends.total,
      },
      {
        label: "Pending",
        value: pendingCount,
        icon: Clock,
        color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        trend: null,
      },
      {
        label: "In Progress",
        value: inProgressCount,
        icon: Loader2,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        trend: null,
      },
      {
        label: "Resolved",
        value: resolvedCount,
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        trend: ticketTrends.resolved,
      },
    ]),
    [inProgressCount, pendingCount, resolvedCount, summary?.totalTickets, ticketTrends.resolved, ticketTrends.total]
  );

  /* SLA overview */
  const slaOverview = useMemo(() => {
    const active = allTicketsForTrend.filter((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status));
    const breached = active.filter((t) => getSlaStatus(t) === "breached").length;
    const atRisk = active.filter((t) => getSlaStatus(t) === "at-risk").length;
    const onTrack = active.length - breached - atRisk;
    const compliance = active.length > 0 ? Math.round(((active.length - breached) / active.length) * 100) : 100;
    return { breached, atRisk, onTrack, compliance, total: active.length };
  }, [allTicketsForTrend]);

  const filteredUsers = useMemo(() => {
    const term = userFilters.search.trim().toLowerCase();
    return users.filter((user) => {
      if (userFilters.role && user.role !== userFilters.role) return false;
      if (!term) return true;
      return (
        user.username.toLowerCase().includes(term)
        || user.fullName.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term)
      );
    });
  }, [userFilters.role, userFilters.search, users]);

  const handleInviteStaff = async (event) => {
    event.preventDefault();
    setStaffLoading(true);
    setStaffError("");
    setStaffNotice("");
    try {
      const response = await userService.createStaffInvite(staffForm);
      setLatestInvite(response);
      setStaffNotice(`Invite queued for ${response.email}. The account appears after the invite is accepted.`);
      toast.success(`Invite sent to ${response.email}.`);
      setStaffForm({ username: "", email: "", fullName: "" });
      setStaffSuggestions([]);
      await refreshUsers();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to create staff invitation.";
      setStaffError(message);
      if (message.toLowerCase().includes("username")) {
        await fetchStaffSuggestions(staffForm.username, staffForm.fullName);
      }
    } finally {
      setStaffLoading(false);
    }
  };

  const handleBroadcast = async (event) => {
    event.preventDefault();
    setBroadcastLoading(true);
    setBroadcastError("");
    setBroadcastResult(null);
    try {
      const response = await userService.sendBroadcast(broadcastForm);
      setBroadcastResult(response);
      setBroadcastForm({ title: "", message: "", audience: broadcastForm.audience });
      toast.success(`Broadcast sent to ${response.recipientCount} users.`);
    } catch (err) {
      setBroadcastError(err?.response?.data?.message || "Failed to send broadcast.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  /* ---- ticket detail actions (unchanged from original) ---- */
  const openTicket = async (ticketId) => {
    setSelectedLoading(true);
    setActionError("");
    try {
      const detail = await ticketService.getTicket(ticketId);
      setSelectedTicket(detail);
      setAssignForm({ assigneeId: "", note: "" });
      setOverrideForm({ status: detail.ticket.status === "REJECTED" ? "APPROVED" : detail.ticket.status, note: "" });
    } catch (err) {
      setTicketError(err?.response?.data?.message || "Failed to load ticket detail.");
    } finally {
      setSelectedLoading(false);
    }
  };
  const runAction = async (task) => {
    if (!selectedTicket) return;
    setActionLoading(true);
    setActionError("");
    try {
      await task();
      const refreshed = await ticketService.getTicket(selectedTicket.ticket.id);
      setSelectedTicket(refreshed);
      await Promise.all([refreshTickets(), refreshAnalytics()]);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };
  const askConfirm = (title, message, onConfirm) => setConfirmDialog({ open: true, title, message, onConfirm });
  const approveTicket = () => runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "APPROVED", note: "Approved by admin" }));
  const rejectTicket = () =>
    askConfirm("Reject Ticket", "This action marks the ticket as rejected. Continue?", () => {
      setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "REJECTED", note: "Rejected by admin" }));
    });
  const assignTicket = () => {
    if (!assignForm.assigneeId) { setActionError("Select a maintenance user first."); return; }
    runAction(() => ticketService.assignTicket(selectedTicket.ticket.id, { assigneeId: Number(assignForm.assigneeId), note: assignForm.note }));
  };
  const overrideStatus = () =>
    askConfirm("Override Status", "This bypasses default workflow rules. Confirm override?", () => {
      setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: overrideForm.status, note: overrideForm.note, override: true }));
    });

  /* ---- greeting helper ---- */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const avatarPreferences = useMemo(() => loadProfilePreferences(auth?.username), [auth?.username]);

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="dashboard-shell space-y-6 animate-fade-in">
      {/* ---- Welcome Banner ---- */}
      <section id="dashboard" data-dashboard-section="true" className="motion-section relative overflow-hidden rounded-2xl bg-gradient-to-br from-campus-500 via-campus-600 to-campus-800 p-6 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-1 backdrop-blur-sm">
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
              <h1 className="text-xl font-bold">{greeting}, {auth?.fullName || "Admin"}</h1>
              <p className="mt-0.5 text-sm text-blue-100">
                Welcome to your admin command center. You have{" "}
                <span className="font-semibold text-white">{summary?.byStatus?.SUBMITTED || 0} tickets</span> pending review.
              </p>
            </div>
          </div>
          {(summary?.byStatus?.SUBMITTED || 0) > 0 && (
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, status: "SUBMITTED" }));
                document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="interactive-control hidden rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 sm:flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Review Pending ({summary?.byStatus?.SUBMITTED || 0})
            </button>
          )}
        </div>
      </section>

      {/* ---- Stats Row (4 cards) ---- */}
      <section className="motion-section motion-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          const isPositive = typeof item.trend === "number" && item.trend > 0;
          const isNegative = typeof item.trend === "number" && item.trend < 0;
          const TrendIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : TrendingUp;
          const trendTone = isPositive
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            : isNegative
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-300";
          const trendLabel = item.trend === null || item.trend === undefined ? null : `${item.trend > 0 ? "+" : ""}${item.trend}%`;
          return (
            <article key={item.label} className="saas-card interactive-surface flex items-center gap-4">
              <div className={`icon-wrap ${item.color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  {trendLabel && (
                    <span className={`pill-badge ${trendTone}`}>
                      <TrendIcon size={12} /> {trendLabel}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* ---- SLA + Quick Actions Row ---- */}
      <section className="motion-section grid gap-4 xl:grid-cols-2">
        {/* SLA Compliance Card */}
        <article className="saas-card interactive-surface">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-campus-500" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">SLA Compliance</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative h-28 w-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-slate-700" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  className={slaOverview.compliance >= 80 ? "text-emerald-500" : slaOverview.compliance >= 50 ? "text-amber-500" : "text-red-500"}
                  strokeDasharray={`${slaOverview.compliance} ${100 - slaOverview.compliance}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{slaOverview.compliance}%</span>
                <span className="text-[10px] text-gray-400">On Track</span>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20 text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{slaOverview.onTrack}</p>
                <p className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70">On Track</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{slaOverview.atRisk}</p>
                <p className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">At Risk</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20 text-center">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{slaOverview.breached}</p>
                <p className="text-[10px] font-medium text-red-600/70 dark:text-red-400/70">Breached</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            Avg resolution: <span className="font-semibold text-gray-600 dark:text-gray-300">{resolution?.overallAverageHours ?? "-"}h</span>
            {"  |  "}SLA targets: Critical 4h  |  High 24h  |  Medium 72h  |  Low 7d
          </p>
        </article>
      </section>

      {/* ---- Charts Row ---- */}
      {analyticsLoading && <LoadingSpinner label="Loading analytics..." />}
      {!analyticsLoading && analyticsError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{analyticsError}</p>}
      {!analyticsLoading && !analyticsError && (
        <>
          <section id="analytics" data-dashboard-section="true" className="motion-section motion-grid grid gap-4 xl:grid-cols-3">
            <article className="saas-card interactive-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Tickets by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="saas-card interactive-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Tickets by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                      {statusData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="saas-card interactive-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Resolution Trend (hrs)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resolutionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                    <Line type="monotone" dataKey="averageHours" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {/* ---- Buildings + Crew ---- */}
          <section className="motion-section motion-grid grid gap-4 xl:grid-cols-2">
            <article className="saas-card interactive-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Top Buildings</h3>
              <div className="space-y-2">
                {topBuildings.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
                {topBuildings.map((item, i) => (
                  <div key={item.building} className="interactive-row flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-campus-100 text-xs font-bold text-campus-600 dark:bg-campus-900/30 dark:text-campus-400">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.building}</span>
                    </div>
                    <span className="text-sm font-bold text-campus-600 dark:text-campus-400">{item.totalIssues} issues</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="saas-card interactive-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Crew Performance</h3>
              <div className="space-y-2">
                {crewPerformance.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
                {crewPerformance.map((item, i) => (
                  <div key={item.userId} className="interactive-row flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.fullName}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.resolvedTickets} resolved</span>
                  </div>
                ))}
              </div>
              {resolution && (
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Overall avg: <span className="font-semibold text-gray-600 dark:text-gray-300">{resolution.overallAverageHours}h</span>
                </p>
              )}
            </article>
          </section>
        </>
      )}

      {/* ---- Ticket Operations ---- */}
      <section id="tickets" data-dashboard-section="true" className="motion-section saas-card interactive-surface">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Ticket Operations</h3>
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="interactive-control rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Clear Search: {filters.search}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </select>
            <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
            </select>
            <select value={filters.urgency} onChange={(e) => setFilters((p) => ({ ...p, urgency: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
              <option value="">All Urgency</option>
              {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{titleCase(u)}</option>)}
            </select>
            <select value={filters.assignee} onChange={(e) => setFilters((p) => ({ ...p, assignee: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
              <option value="">All Assignees</option>
              {maintenanceUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </select>
            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
              <Search size={14} className="text-gray-400" />
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search title/building..." className="w-full bg-transparent px-2 py-2 text-sm outline-none dark:text-gray-200" />
            </div>
          </div>

          {ticketLoading && <LoadingSpinner label="Loading ticket table..." />}
          {!ticketLoading && ticketError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{ticketError}</p>}
          {!ticketLoading && !ticketError && tickets.length === 0 && <EmptyState title="No tickets found" message="Try adjusting the filter criteria." />}
          {!ticketLoading && !ticketError && tickets.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="text-left">
                    {["ID", "Title", "Category", "Urgency", "Status", "SLA", "Building", "Submitted", "Assignee"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                  {tickets.map((ticket) => {
                    const sla = getSlaStatus(ticket);
                    return (
                      <tr key={ticket.id} onClick={() => openTicket(ticket.id)} className="interactive-row cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
                        <td className="px-3 py-2.5 font-semibold text-campus-600 dark:text-campus-400">#{ticket.id}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{ticket.title}</td>
                        <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{titleCase(ticket.category)}</td>
                        <td className="px-3 py-2.5"><UrgencyBadge urgency={ticket.urgency} /></td>
                        <td className="px-3 py-2.5"><StatusBadge status={ticket.status} /></td>
                        <td className="px-3 py-2.5">
                          <span className={`pill-badge ${sla === "on-track" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : sla === "at-risk" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : sla === "breached" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}>
                            {sla === "resolved" ? "-" : titleCase(sla.replace("-", " "))}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{ticket.building}</td>
                        <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{formatDate(ticket.createdAt)}</td>
                        <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{ticket.assignedTo ? ticket.assignedTo.fullName : <span className="text-gray-300 dark:text-gray-600">Unassigned</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ---- Staff Onboarding ---- */}
      <section id="staff" data-dashboard-section="true" className="motion-section saas-card interactive-surface">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Staff Onboarding</h3>
          <span className="pill-badge bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400">{maintenanceUsers.length} active maintenance users</span>
        </div>

        <form onSubmit={handleInviteStaff} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
            <input
              required
              minLength={3}
              maxLength={50}
              autoComplete="username"
              name="username"
              value={staffForm.username}
              onChange={(e) => {
                const next = e.target.value;
                setStaffForm((p) => ({ ...p, username: next }));
                setStaffSuggestions([]);
              }}
              onBlur={() => fetchStaffSuggestions(staffForm.username, staffForm.fullName)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
              placeholder="e.g. jmwangi"
            />
            {staffSuggestionLoading && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Checking username suggestions...</p>
            )}
            {staffSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {staffSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setStaffForm((p) => ({ ...p, username: suggestion }))}
                    className="interactive-control rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-600 transition hover:bg-campus-100 dark:bg-campus-900/20 dark:text-campus-400 dark:hover:bg-campus-900/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
            <input
              required
              maxLength={120}
              autoComplete="name"
              name="fullName"
              value={staffForm.fullName}
              onChange={(e) => setStaffForm((p) => ({ ...p, fullName: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
              placeholder="e.g. James Mwangi"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              required
              type="email"
              autoComplete="email"
              name="email"
              value={staffForm.email}
              onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
              placeholder="e.g. jmwangi@campus.local"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button disabled={staffLoading} className="btn-primary interactive-control">
              <Plus size={16} />
              {staffLoading ? "Sending Invite..." : "Send Invite"}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">Staff appear in the user list after they accept the invite link by email.</p>
          </div>
        </form>

        {staffError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{staffError}</p>}
        {staffNotice && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{staffNotice}</p>}
        {latestInvite && (
          <div className="mt-3 rounded-xl border border-campus-100 bg-campus-50/60 px-4 py-3 text-xs text-campus-700 dark:border-campus-900/40 dark:bg-campus-900/20 dark:text-campus-300">
            Latest invite: @{latestInvite.username} ({latestInvite.email}) expires on {formatDate(latestInvite.expiresAt)}.
          </div>
        )}
      </section>

      {/* ---- User Management ---- */}
      <section id="users" data-dashboard-section="true" className="motion-section saas-card interactive-surface">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">User Management</h3>
          <span className="pill-badge bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300">
            <Users size={12} /> {filteredUsers.length} visible
          </span>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            <Search size={14} className="text-gray-400" />
            <input
              value={userFilters.search}
              onChange={(e) => setUserFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search username, name, email..."
              className="w-full bg-transparent px-2 py-2 text-sm outline-none dark:text-gray-200"
            />
          </div>
          <select
            value={userFilters.role}
            onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        {usersLoading && <LoadingSpinner label="Loading users..." />}
        {!usersLoading && usersError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{usersError}</p>}
        {!usersLoading && !usersError && filteredUsers.length === 0 && (
          <EmptyState title="No users match this filter" message="Adjust role or search terms to find accounts." />
        )}
        {!usersLoading && !usersError && filteredUsers.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr className="text-left">
                  {["Username", "Name", "Role", "Email", "Tickets"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="interactive-row transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">@{u.username}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{u.fullName}</td>
                    <td className="px-3 py-2.5">
                      <span className={`pill-badge ${u.role === "ADMIN" ? "bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400" : u.role === "MAINTENANCE" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"}`}>
                        {titleCase(u.role)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-3 py-2.5 font-bold text-campus-600 dark:text-campus-400">{u.ticketCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- Broadcast Center ---- */}
      <section id="broadcast" data-dashboard-section="true" className="motion-section saas-card interactive-surface">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-campus-500" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Audience Broadcast</h3>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
              <input
                required
                maxLength={200}
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                placeholder="e.g. Scheduled power maintenance"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Audience</label>
              <select
                value={broadcastForm.audience}
                onChange={(e) => setBroadcastForm((prev) => ({ ...prev, audience: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
              >
                <option value="ALL">All Users</option>
                <option value="STUDENTS">Students Only</option>
                <option value="STAFF">Staff Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Message</label>
            <textarea
              required
              rows={4}
              maxLength={5000}
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
              placeholder="Write the announcement message for selected users..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button disabled={broadcastLoading} className="btn-primary interactive-control">
              <Send size={16} />
              {broadcastLoading ? "Sending..." : "Send Broadcast"}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">Delivered as real in-app notifications based on selected audience.</p>
          </div>
        </form>

        {broadcastError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{broadcastError}</p>}
        {broadcastResult && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            Broadcast delivered to {broadcastResult.recipientCount} recipients ({titleCase(broadcastResult.audience.toLowerCase())}).
          </p>
        )}
      </section>
      {/* ---- Ticket Detail Modal (unchanged logic) ---- */}
      <Modal open={Boolean(selectedTicket) || selectedLoading} title={selectedTicket ? `Ticket #${selectedTicket.ticket.id}` : "Ticket Detail"} onClose={() => setSelectedTicket(null)}>
        {selectedLoading && <LoadingSpinner label="Loading detail..." />}
        {selectedTicket && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.ticket.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedTicket.ticket.building}  |  {selectedTicket.ticket.location}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={selectedTicket.ticket.status} />
                  <UrgencyBadge urgency={selectedTicket.ticket.urgency} />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{selectedTicket.ticket.description}</p>
            </div>

            {actionError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{actionError}</p>}

            {selectedTicket.ticket.status === "SUBMITTED" && (
              <div className="flex gap-2">
                <button disabled={actionLoading} onClick={approveTicket} className="btn-success">{actionLoading ? "Processing..." : "Approve"}</button>
                <button disabled={actionLoading} onClick={rejectTicket} className="btn-danger">{actionLoading ? "Processing..." : "Reject"}</button>
              </div>
            )}

            {selectedTicket.ticket.status === "APPROVED" && (
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Assign Ticket</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select value={assignForm.assigneeId} onChange={(e) => setAssignForm((p) => ({ ...p, assigneeId: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
                    <option value="">Select maintenance user</option>
                    {maintenanceUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                  <input value={assignForm.note} onChange={(e) => setAssignForm((p) => ({ ...p, note: e.target.value }))} placeholder="Assignment note" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200" />
                </div>
                <button disabled={actionLoading} onClick={assignTicket} className="btn-primary mt-3">{actionLoading ? "Assigning..." : "Assign"}</button>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Status Override</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select value={overrideForm.status} onChange={(e) => setOverrideForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200">
                  {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                </select>
                <input value={overrideForm.note} onChange={(e) => setOverrideForm((p) => ({ ...p, note: e.target.value }))} placeholder="Override note" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200" />
              </div>
              <button disabled={actionLoading} onClick={overrideStatus} className="mt-3 rounded-xl border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-70 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/20">
                {actionLoading ? "Updating..." : "Apply Override"}
              </button>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Status History</h4>
              <TicketTimeline logs={selectedTicket.logs} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onCancel={() => setConfirmDialog({ open: false, title: "", message: "", onConfirm: null })}
        onConfirm={() => confirmDialog.onConfirm?.()}
        confirmText="Continue"
      />
    </div>
  );
};



