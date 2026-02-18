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
import { ConfirmDialog } from "../components/Common/ConfirmDialog.jsx";
import { EmptyState } from "../components/Common/EmptyState.jsx";
import { LoadingSpinner } from "../components/Common/LoadingSpinner.jsx";
import { Modal } from "../components/Common/Modal.jsx";
import { StatusBadge } from "../components/Common/StatusBadge.jsx";
import { UrgencyBadge } from "../components/Common/UrgencyBadge.jsx";
import { TicketTimeline } from "../components/tickets/TicketTimeline.jsx";
import { analyticsService } from "../services/analyticsService";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { CATEGORIES, STATUSES, URGENCY_LEVELS } from "../utils/constants";
import { formatDate, titleCase, toHours } from "../utils/helpers";

const pieColors = ["#00a895", "#1f2a44", "#ef4444", "#0ea5e9", "#f59e0b", "#8b5cf6", "#64748b"];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [filters, setFilters] = useState({ status: "", category: "", urgency: "", assignee: "", search: "" });

  const [summary, setSummary] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [topBuildings, setTopBuildings] = useState([]);
  const [crewPerformance, setCrewPerformance] = useState([]);
  const [allTicketsForTrend, setAllTicketsForTrend] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [tickets, setTickets] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketError, setTicketError] = useState("");

  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [assignForm, setAssignForm] = useState({ assigneeId: "", note: "" });
  const [overrideForm, setOverrideForm] = useState({ status: "APPROVED", note: "" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });

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

  const categoryData = useMemo(
    () =>
      Object.entries(summary?.byCategory || {}).map(([name, value]) => ({
        name: titleCase(name),
        value,
      })),
    [summary]
  );

  const statusData = useMemo(
    () =>
      Object.entries(summary?.byStatus || {}).map(([name, value]) => ({
        name: titleCase(name),
        value,
      })),
    [summary]
  );

  const resolutionTrend = useMemo(() => {
    const grouped = allTicketsForTrend
      .filter((ticket) => ticket.resolvedAt)
      .reduce((acc, ticket) => {
        const day = new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!acc[day]) acc[day] = [];
        acc[day].push(toHours(ticket.createdAt, ticket.resolvedAt));
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([day, values]) => ({
        day,
        averageHours: Math.round((values.reduce((sum, current) => sum + current, 0) / values.length) * 100) / 100,
      }))
      .slice(-8);
  }, [allTicketsForTrend]);

  const openTicket = async (ticketId) => {
    setSelectedLoading(true);
    setActionError("");
    try {
      const detail = await ticketService.getTicket(ticketId);
      setSelectedTicket(detail);
      setAssignForm({ assigneeId: "", note: "" });
      setOverrideForm({
        status: detail.ticket.status === "REJECTED" ? "APPROVED" : detail.ticket.status,
        note: "",
      });
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

  const askConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const approveTicket = () => runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "APPROVED", note: "Approved by admin" }));

  const rejectTicket = () =>
    askConfirm("Reject Ticket", "This action marks the ticket as rejected. Continue?", () => {
      setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      runAction(() => ticketService.updateStatus(selectedTicket.ticket.id, { status: "REJECTED", note: "Rejected by admin" }));
    });

  const assignTicket = () => {
    if (!assignForm.assigneeId) {
      setActionError("Select a maintenance user first.");
      return;
    }
    runAction(() =>
      ticketService.assignTicket(selectedTicket.ticket.id, {
        assigneeId: Number(assignForm.assigneeId),
        note: assignForm.note,
      })
    );
  };

  const overrideStatus = () =>
    askConfirm("Override Status", "This bypasses default workflow rules. Confirm override?", () => {
      setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
      runAction(() =>
        ticketService.updateStatus(selectedTicket.ticket.id, {
          status: overrideForm.status,
          note: overrideForm.note,
          override: true,
        })
      );
    });

  const pendingCount = (summary?.byStatus?.SUBMITTED || 0) + (summary?.byStatus?.APPROVED || 0) + (summary?.byStatus?.ASSIGNED || 0);
  const inProgressCount = summary?.byStatus?.IN_PROGRESS || 0;
  const resolvedCount = (summary?.byStatus?.RESOLVED || 0) + (summary?.byStatus?.CLOSED || 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Tickets", value: summary?.totalTickets ?? 0 },
          { label: "Pending", value: pendingCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Resolved", value: resolvedCount },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink dark:text-slate-100">{item.value}</p>
          </article>
        ))}
      </section>

      {analyticsLoading && <LoadingSpinner label="Loading analytics..." />}
      {!analyticsLoading && analyticsError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{analyticsError}</p>}

      {!analyticsLoading && !analyticsError && (
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Tickets by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00a895" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Tickets by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                      {statusData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Resolution Time Trend (hrs)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resolutionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="averageHours" stroke="#1f2a44" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Top Buildings</h3>
              <div className="mt-3 space-y-2">
                {topBuildings.map((item) => (
                  <div key={item.building} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                    <span className="text-ink dark:text-slate-100">{item.building}</span>
                    <span className="font-semibold text-mint">{item.totalIssues}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Crew Performance</h3>
              <div className="mt-3 space-y-2">
                {crewPerformance.map((item) => (
                  <div key={item.userId} className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                    <span className="text-ink dark:text-slate-100">{item.fullName}</span>
                    <span className="font-semibold text-mint">{item.resolvedTickets}</span>
                  </div>
                ))}
              </div>
              {resolution && (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Overall avg resolution time: <span className="font-semibold">{resolution.overallAverageHours}h</span>
                </p>
              )}
            </article>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-panel dark:border-slate-700 dark:bg-slate-900/70">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "tickets" ? "bg-ink text-white dark:bg-mint dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}
          >
            Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === "users" ? "bg-ink text-white dark:bg-mint dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}
          >
            Users
          </button>
        </div>

        {activeTab === "tickets" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {titleCase(category)}
                  </option>
                ))}
              </select>

              <select
                value={filters.urgency}
                onChange={(e) => setFilters((prev) => ({ ...prev, urgency: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Urgency</option>
                {URGENCY_LEVELS.map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {titleCase(urgency)}
                  </option>
                ))}
              </select>

              <select
                value={filters.assignee}
                onChange={(e) => setFilters((prev) => ({ ...prev, assignee: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Assignees</option>
                {maintenanceUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>

              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search title/building..."
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {ticketLoading && <LoadingSpinner label="Loading ticket table..." />}
            {!ticketLoading && ticketError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{ticketError}</p>}

            {!ticketLoading && !ticketError && tickets.length === 0 && (
              <EmptyState title="No tickets found" message="Try adjusting the filter criteria." />
            )}

            {!ticketLoading && !ticketError && tickets.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">ID</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Title</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Category</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Urgency</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Status</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Building</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Submitted</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => openTicket(ticket.id)}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <td className="px-3 py-2 font-semibold text-mint">#{ticket.id}</td>
                        <td className="px-3 py-2 text-ink dark:text-slate-100">{ticket.title}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{titleCase(ticket.category)}</td>
                        <td className="px-3 py-2">
                          <UrgencyBadge urgency={ticket.urgency} />
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{ticket.building}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(ticket.createdAt)}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                          {ticket.assignedTo ? ticket.assignedTo.fullName : "Unassigned"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {usersLoading && <LoadingSpinner label="Loading users..." />}
            {!usersLoading && usersError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{usersError}</p>}
            {!usersLoading && !usersError && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Username</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Name</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Role</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Email</th>
                      <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-200">Ticket Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-3 py-2 text-ink dark:text-slate-100">@{user.username}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{user.fullName}</td>
                        <td className="px-3 py-2">
                          <StatusBadge status={user.role === "ADMIN" ? "APPROVED" : user.role === "MAINTENANCE" ? "IN_PROGRESS" : "SUBMITTED"} className="capitalize" />
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{user.email}</td>
                        <td className="px-3 py-2 font-semibold text-mint">{user.ticketCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(selectedTicket) || selectedLoading}
        title={selectedTicket ? `Ticket #${selectedTicket.ticket.id}` : "Ticket Detail"}
        onClose={() => setSelectedTicket(null)}
      >
        {selectedLoading && <LoadingSpinner label="Loading detail..." />}
        {selectedTicket && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{selectedTicket.ticket.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {selectedTicket.ticket.building} • {selectedTicket.ticket.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={selectedTicket.ticket.status} />
                  <UrgencyBadge urgency={selectedTicket.ticket.urgency} />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{selectedTicket.ticket.description}</p>
            </div>

            {actionError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{actionError}</p>}

            {selectedTicket.ticket.status === "SUBMITTED" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={approveTicket}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={rejectTicket}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
                >
                  Reject
                </button>
              </div>
            )}

            {selectedTicket.ticket.status === "APPROVED" && (
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Assign Ticket</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select
                    value={assignForm.assigneeId}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, assigneeId: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Select maintenance user</option>
                    {maintenanceUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <input
                    value={assignForm.note}
                    onChange={(e) => setAssignForm((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="Assignment note"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={assignTicket}
                  className="mt-3 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-mint dark:text-slate-950 dark:hover:bg-emerald-300"
                >
                  {actionLoading ? "Assigning..." : "Assign"}
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Status Override</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <select
                  value={overrideForm.status}
                  onChange={(e) => setOverrideForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {titleCase(status)}
                    </option>
                  ))}
                </select>
                <input
                  value={overrideForm.note}
                  onChange={(e) => setOverrideForm((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Override note"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={overrideStatus}
                className="mt-3 rounded-xl border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-70 dark:border-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/20"
              >
                {actionLoading ? "Updating..." : "Apply Override"}
              </button>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Status History</h4>
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
