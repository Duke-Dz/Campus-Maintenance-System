import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";
import { titleCase, toHours } from "../../utils/helpers";

const barColors = ["#0ea5e9", "#2563eb", "#14b8a6", "#f59e0b", "#f97316", "#64748b", "#334155"];
const RANGE_CONFIG = {
  Weekly: { days: 14, mode: "day", label: "Last 14 days" },
  Monthly: { days: 30, mode: "week", label: "Last 30 days" },
  Quarterly: { days: 90, mode: "month", label: "Last 90 days" },
};

const startOfWeek = (value) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const bucketLabel = (value, mode) => {
  const date = new Date(value);
  if (mode === "month") {
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  if (mode === "week") {
    return startOfWeek(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const aggregateByKey = (tickets, key) => Object.entries(
  tickets.reduce((accumulator, ticket) => {
    const nextKey = titleCase(ticket[key]);
    accumulator[nextKey] = (accumulator[nextKey] || 0) + 1;
    return accumulator;
  }, {})
).map(([name, value]) => ({ name, value }));

const ChartCard = ({ cardId, title, description, detailTitle, detailContent, children }) => (
  <MotionCardSurface
    cardId={cardId}
    className="dashboard-chart-card interactive-surface"
    morphOnClick
    detailTitle={detailTitle}
    detailContent={detailContent}
    modalWidth="max-w-4xl"
  >
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>

    {children}
  </MotionCardSurface>
);

export const AnalyticsCharts = ({ tickets = [] }) => {
  const [timeRange, setTimeRange] = useState("Weekly");
  const config = RANGE_CONFIG[timeRange];

  const scopedData = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - config.days * 24 * 60 * 60 * 1000);

    const createdTickets = tickets.filter((ticket) => {
      const createdAt = new Date(ticket.createdAt);
      return createdAt >= start && createdAt <= now;
    });

    const resolvedTrend = tickets
      .filter((ticket) => ticket.resolvedAt && new Date(ticket.resolvedAt) >= start)
      .reduce((accumulator, ticket) => {
        const label = bucketLabel(ticket.resolvedAt, config.mode);
        if (!accumulator[label]) accumulator[label] = [];
        accumulator[label].push(toHours(ticket.createdAt, ticket.resolvedAt));
        return accumulator;
      }, {});

    const resolutionTrend = Object.entries(resolvedTrend).map(([label, values]) => ({
      label,
      averageHours: Math.round((values.reduce((sum, current) => sum + current, 0) / values.length) * 100) / 100,
    }));

    return {
      totalTickets: createdTickets.length,
      categoryData: aggregateByKey(createdTickets, "category").sort((left, right) => right.value - left.value).slice(0, 6),
      statusData: aggregateByKey(createdTickets, "status").sort((left, right) => right.value - left.value),
      resolutionTrend,
      label: config.label,
    };
  }, [config.days, config.label, config.mode, tickets]);

  const dominantStatus = scopedData.statusData[0]?.name || "No status";
  const topCategory = scopedData.categoryData[0]?.name || "No category";

  const renderCategoryChart = (heightClass) => (
    <div className={`dashboard-chart-canvas ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scopedData.categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
          <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 18px 40px -28px rgba(15,23,42,0.35)" }} />
          <Bar dataKey="value" fill="var(--role-accent)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderStatusChart = (heightClass) => (
    <div className={`dashboard-chart-canvas ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scopedData.statusData} layout="vertical" margin={{ left: 18, right: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 18px 40px -28px rgba(15,23,42,0.35)" }} />
          <Legend />
          <Bar dataKey="value" name="Tickets" radius={[0, 8, 8, 0]}>
            {scopedData.statusData.map((entry, index) => (
              <Cell key={entry.name} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderResolutionChart = (heightClass) => (
    <div className={`dashboard-chart-canvas ${heightClass}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={scopedData.resolutionTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,0.15)", boxShadow: "0 18px 40px -28px rgba(15,23,42,0.35)" }} />
          <Area
            type="monotone"
            dataKey="averageHours"
            stroke="var(--role-accent-strong)"
            strokeWidth={2.4}
            fill="color-mix(in srgb, var(--role-accent) 22%, transparent)"
            dot={{ fill: "var(--role-accent)", strokeWidth: 0, r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Analytics</p>
          <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Operational trends</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {scopedData.totalTickets} tickets created in {scopedData.label.toLowerCase()}.
          </p>
        </div>

        <div className="dashboard-segment-control flex items-center gap-1">
          {Object.keys(RANGE_CONFIG).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`dashboard-segment-btn px-3.5 py-1.5 text-xs font-semibold ${timeRange === range ? "dashboard-segment-btn-active" : ""}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <section id="analytics" data-dashboard-section="true" className="motion-section motion-grid grid gap-4 xl:grid-cols-3">
        <ChartCard
          cardId="admin-chart-category"
          title="Tickets by Category"
          description="Top issue categories opened during the selected range."
          detailTitle="Category volume detail"
          detailContent={(
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Leading category</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{topCategory}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created in range</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.totalTickets}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Categories shown</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.categoryData.length}</p>
                </div>
              </div>
              {renderCategoryChart("h-[24rem]")}
            </div>
          )}
        >
          {renderCategoryChart("h-72")}
        </ChartCard>

        <ChartCard
          cardId="admin-chart-status"
          title="Tickets by Status"
          description="Workflow distribution for tickets opened in the selected range."
          detailTitle="Status distribution detail"
          detailContent={(
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dominant status</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{dominantStatus}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Statuses shown</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.statusData.length}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Window</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.label}</p>
                </div>
              </div>
              {renderStatusChart("h-[24rem]")}
            </div>
          )}
        >
          {renderStatusChart("h-72")}
        </ChartCard>

        <ChartCard
          cardId="admin-chart-resolution"
          title="Resolution Trend"
          description="Average hours to resolution grouped by resolved date."
          detailTitle="Resolution trend detail"
          detailContent={(
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Buckets tracked</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.resolutionTrend.length}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current window</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.label}</p>
                </div>
                <div className="dashboard-subtle-tile rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Latest average</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{scopedData.resolutionTrend.at(-1)?.averageHours ?? "-"}h</p>
                </div>
              </div>
              {renderResolutionChart("h-[24rem]")}
            </div>
          )}
        >
          {renderResolutionChart("h-72")}
        </ChartCard>
      </section>
    </>
  );
};
