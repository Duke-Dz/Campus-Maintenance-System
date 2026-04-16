import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { MotionCardSurface } from "./MotionCardSurface.jsx";

const iconToneClasses = {
  campus: "dashboard-stat-icon-campus",
  info: "dashboard-stat-icon-info",
  warning: "dashboard-stat-icon-warning",
  success: "dashboard-stat-icon-success",
  danger: "dashboard-stat-icon-danger",
  neutral: "dashboard-stat-icon-neutral",
};

const trendToneClasses = {
  positive: "dashboard-stat-trend-positive",
  negative: "dashboard-stat-trend-negative",
  neutral: "dashboard-stat-trend-neutral",
};

const resolveTrend = (trend) => {
  if (typeof trend !== "number") return null;
  if (trend > 0) return { icon: ArrowUpRight, tone: "positive", label: `+${trend}%` };
  if (trend < 0) return { icon: ArrowDownRight, tone: "negative", label: `${trend}%` };
  return { icon: TrendingUp, tone: "neutral", label: `${trend}%` };
};

const toMotionId = (item, index) => item.motionId || `dashboard-stat-${String(item.label || index).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const DashboardHero = ({ id = "dashboard", tone = "campus", className = "", children }) => (
  <section
    id={id}
    data-dashboard-section="true"
    className={`motion-section dashboard-hero dashboard-hero-${tone} ${className}`.trim()}
  >
    <div className="dashboard-hero-orb dashboard-hero-orb-primary" />
    <div className="dashboard-hero-orb dashboard-hero-orb-secondary" />
    <div className="dashboard-hero-inner">{children}</div>
  </section>
);

const StatCardDetail = ({ item }) => (
  <div className="space-y-5">
    <div className="dashboard-subtle-tile rounded-[1.3rem] border border-gray-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/55">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.helper || "Snapshot"}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
      {item.detailNote && <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.detailNote}</p>}
    </div>

    {item.detailRows?.length > 0 && (
      <div className="grid gap-3 sm:grid-cols-2">
        {item.detailRows.map((detail) => (
          <div key={detail.label} className="dashboard-subtle-tile rounded-[1.1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/55">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{detail.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{detail.value}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DashboardStatCard = ({ item }) => {
  const Icon = item.icon;
  const trend = resolveTrend(item.trend);
  const TrendIcon = trend?.icon;
  const isInteractive = Boolean(item.detailNote || item.detailRows?.length);
  const cardClassName = `dashboard-stat-card ${isInteractive ? "dashboard-stat-card-clickable text-left" : ""}`;
  const content = (
    <>
      <div className="dashboard-stat-card-head">
        <div className={`dashboard-stat-icon ${iconToneClasses[item.tone] || iconToneClasses.campus}`}>
          <Icon size={20} />
        </div>
        {trend && TrendIcon && (
          <span className={`dashboard-stat-trend ${trendToneClasses[trend.tone]}`}>
            <TrendIcon size={12} />
            {trend.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="dashboard-stat-label">{item.label}</p>
        <p className="dashboard-stat-value">{item.value}</p>
        {item.helper && <p className="dashboard-stat-helper">{item.helper}</p>}
        {isInteractive && <p className="mt-3 text-xs font-medium text-campus-600 dark:text-campus-300">Click for details</p>}
      </div>
    </>
  );

  return (
    <MotionCardSurface
      cardId={toMotionId(item, item.label)}
      className={cardClassName}
      morphOnClick={isInteractive}
      detailTitle={item.detailTitle || item.label || "Metric detail"}
      detailContent={<StatCardDetail item={item} />}
      modalWidth="max-w-2xl"
    >
      {content}
    </MotionCardSurface>
  );
};

export const DashboardStatGrid = ({ items, className = "" }) => {
  return (
    <section className={`motion-section motion-grid dashboard-stat-grid ${className}`.trim()}>
      {items.map((item) => (
        <DashboardStatCard key={item.motionId || item.label} item={item} />
      ))}
    </section>
  );
};
