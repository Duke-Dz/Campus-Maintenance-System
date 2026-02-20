import { useEffect, useMemo, useState } from "react";
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
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  Shield,
  TrendingUp,
  UserCog,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { ConfirmDialog } from "../components/Common/ConfirmDialog.jsx";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { useAuth } from "../hooks/useAuth";
import { analyticsService } from "../services/analyticsService";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { CATEGORIES, STATUSES, URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase, toHours } from "../utils/helpers";

const pieColors = ["#3B82F6", "#1E40AF", "#EF4444", "#0EA5E9", "#F59E0B", "#8B5CF6", "#64748B"];

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

/* ================================================================== */
/*  ADMIN DASHBOARD                                                    */
/* ================================================================== */
export const AdminDashboard = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");
  const [filters, setFilters] = useState({ status: "", category: "", urgency: "", assignee: "", search: "" });

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
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ username: "", email: "", fullName: "", password: "" });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");

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

  const refreshTickets = async () => {
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
  };

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

  useEffect(() => {
    refreshAnalytics();
    refreshUsers();
  }, []);
  useEffect(() => {
    refreshTickets();
  }, [filters.status, filters.category, filters.urgency, filters.assignee, filters.search]);

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

  /* SLA overview */
  const slaOverview = useMemo(() => {
    const active = allTicketsForTrend.filter((t) => !["RESOLVED", "CLOSED", "REJECTED"].includes(t.status));
    const breached = active.filter((t) => getSlaStatus(t) === "breached").length;
    const atRisk = active.filter((t) => getSlaStatus(t) === "at-risk").length;
    const onTrack = active.length - breached - atRisk;
    const compliance = active.length > 0 ? Math.round(((active.length - breached) / active.length) * 100) : 100;
    return { breached, atRisk, onTrack, compliance, total: active.length };
  }, [allTicketsForTrend]);

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
              {(auth?.fullName || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{greeting}, {auth?.fullName || "Admin"} 👋</h1>
              <p className="mt-0.5 text-sm text-blue-100">
                Welcome to your admin command center. You have{" "}
                <span className="font-semibold text-white">{summary?.byStatus?.SUBMITTED || 0} tickets</span> pending review.
              </p>
            </div>
          </div>
          {(summary?.byStatus?.SUBMITTED || 0) > 0 && (
            <button
              onClick={() => { setActiveTab("tickets"); setFilters((prev) => ({ ...prev, status: "SUBMITTED" })); }}
              className="hidden rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 sm:flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Review Pending ({summary?.byStatus?.SUBMITTED || 0})
            </button>
          )}
        </div>
      </section>

      {/* ---- Stats Row (4 cards) ---- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Tickets", value: summary?.totalTickets ?? 0, icon: FileText, color: "bg-blue-100 text-campus-600 dark:bg-blue-900/30 dark:text-blue-400", trend: "+12%" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", trend: null },
          { label: "In Progress", value: inProgressCount, icon: Loader2, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", trend: null },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", trend: "+8%" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="saas-card flex items-center gap-4">
              <div className={`icon-wrap ${item.color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  {item.trend && (
                    <span className="pill-badge bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <ArrowUpRight size={12} /> {item.trend}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* ---- SLA + Quick Actions Row ---- */}
      <section className="grid gap-4 xl:grid-cols-2">
        {/* SLA Compliance Card */}
        <article className="saas-card">
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
            Avg resolution: <span className="font-semibold text-gray-600 dark:text-gray-300">{resolution?.overallAverageHours ?? "—"}h</span>
            {" · "}SLA targets: Critical 4h · High 24h · Medium 72h · Low 7d
          </p>
        </article>
      </section>

      {/* ---- Charts Row ---- */}
      {analyticsLoading && <LoadingSpinner label="Loading analytics..." />}
      {!analyticsLoading && analyticsError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{analyticsError}</p>}
      {!analyticsLoading && !analyticsError && (
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            <article className="saas-card">
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
            <article className="saas-card">
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
            <article className="saas-card">
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
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="saas-card">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Top Buildings</h3>
              <div className="space-y-2">
                {topBuildings.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
                {topBuildings.map((item, i) => (
                  <div key={item.building} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-campus-100 text-xs font-bold text-campus-600 dark:bg-campus-900/30 dark:text-campus-400">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.building}</span>
                    </div>
                    <span className="text-sm font-bold text-campus-600 dark:text-campus-400">{item.totalIssues} issues</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="saas-card">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Crew Performance</h3>
              <div className="space-y-2">
                {crewPerformance.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
                {crewPerformance.map((item, i) => (
                  <div key={item.userId} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-800">
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

      {/* ---- Tabs: Tickets / Users ---- */}
      <section className="saas-card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {["tickets", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === tab
                ? "bg-campus-500 text-white shadow-sm shadow-campus-500/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                }`}
            >
              {titleCase(tab)}
            </button>
          ))}
        </div>

        {activeTab === "tickets" && (
          <div className="space-y-4">
            {/* Filters */}
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
              <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search title/building..." className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200" />
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
                        <tr key={ticket.id} onClick={() => openTicket(ticket.id)} className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
                          <td className="px-3 py-2.5 font-semibold text-campus-600 dark:text-campus-400">#{ticket.id}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{ticket.title}</td>
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{titleCase(ticket.category)}</td>
                          <td className="px-3 py-2.5"><UrgencyBadge urgency={ticket.urgency} /></td>
                          <td className="px-3 py-2.5"><StatusBadge status={ticket.status} /></td>
                          <td className="px-3 py-2.5">
                            <span className={`pill-badge ${sla === "on-track" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : sla === "at-risk" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : sla === "breached" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}>
                              {sla === "resolved" ? "—" : titleCase(sla.replace("-", " "))}
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
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Add Staff Button */}
            <div className="flex justify-end">
              <button onClick={() => setShowAddStaff(true)} className="btn-primary">
                <Plus size={16} /> Add Staff Member
              </button>
            </div>

            {/* Add Staff Modal */}
            <Modal open={showAddStaff} title="Add Maintenance Staff" onClose={() => { setShowAddStaff(false); setStaffError(""); }}>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setStaffLoading(true);
                setStaffError("");
                try {
                  const newUser = await userService.createStaff(staffForm);
                  setUsers((prev) => [...prev, { ...newUser, ticketCount: 0 }]);
                  setStaffForm({ username: "", email: "", fullName: "", password: "" });
                  setShowAddStaff(false);
                } catch (err) {
                  setStaffError(err?.response?.data?.message || "Failed to create staff account.");
                } finally {
                  setStaffLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
                  <input required minLength={3} maxLength={50} value={staffForm.username} onChange={(e) => setStaffForm((p) => ({ ...p, username: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="e.g. jmwangi" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
                  <input required maxLength={120} value={staffForm.fullName} onChange={(e) => setStaffForm((p) => ({ ...p, fullName: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="e.g. James Mwangi" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="e.g. jmwangi@campus.local" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                  <input required type="password" minLength={8} maxLength={120} value={staffForm.password} onChange={(e) => setStaffForm((p) => ({ ...p, password: e.target.value }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30" placeholder="Minimum 8 characters" />
                </div>
                {staffError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{staffError}</p>}
                <div className="flex items-center gap-3 pt-2">
                  <button disabled={staffLoading} className="btn-primary">{staffLoading ? "Creating..." : "Create Staff Account"}</button>
                  <button type="button" onClick={() => { setShowAddStaff(false); setStaffError(""); }} className="btn-ghost">Cancel</button>
                </div>
              </form>
            </Modal>
            {usersLoading && <LoadingSpinner label="Loading users..." />}
            {!usersLoading && usersError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{usersError}</p>}
            {!usersLoading && !usersError && (
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
                    {users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70">
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
          </div>
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
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedTicket.ticket.building} • {selectedTicket.ticket.location}</p>
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
