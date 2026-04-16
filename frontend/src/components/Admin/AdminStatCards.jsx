import { useEffect, useRef, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";

const toneClasses = {
  info: "dashboard-stat-icon-info",
  warning: "dashboard-stat-icon-warning",
  success: "dashboard-stat-icon-success",
  danger: "dashboard-stat-icon-danger",
  campus: "dashboard-stat-icon-campus",
  neutral: "dashboard-stat-icon-neutral",
};

function useAnimatedValue(target, duration = 650) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (typeof target !== "number" || Number.isNaN(target)) {
      setDisplay(target ?? 0);
      return undefined;
    }

    const start = performance.now();
    const from = display;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

const StatDetail = ({ item }) => (
  <div className="space-y-5">
    <div className="dashboard-subtle-tile rounded-[1.3rem] border border-gray-100 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/55">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.helper || "Operational summary"}</p>
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

export const AdminStatCards = ({ items = [] }) => {
  return (
    <div className="dashboard-stat-grid">
      {items.map((item, index) => (
        <StatCard key={item.motionId || item.label || index} {...item} />
      ))}
    </div>
  );
};

const toMotionId = (label, motionId) => motionId || `admin-stat-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const StatCard = ({ label, value, icon, tone = "info", trend, helper, detailRows, detailNote, detailTitle, motionId }) => {
  const Icon = icon;
  const animatedValue = useAnimatedValue(value);
  const trendPositive = typeof trend === "number" && trend >= 0;
  const isInteractive = Boolean(detailNote || detailRows?.length);
  const content = (
    <>
      <div className="dashboard-stat-card-head">
        <div className={`dashboard-stat-icon ${toneClasses[tone] || toneClasses.info}`}>
          <Icon size={20} />
        </div>
        {trend !== null && trend !== undefined && (
          <span className={`dashboard-stat-trend ${trendPositive ? "dashboard-stat-trend-positive" : "dashboard-stat-trend-negative"}`}>
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="dashboard-stat-label">{label}</p>
        <p className="dashboard-stat-value animate-count-up">{animatedValue}</p>
        {helper && <p className="dashboard-stat-helper">{helper}</p>}
        {isInteractive && <p className="mt-3 text-xs font-medium text-campus-600 dark:text-campus-300">Click for details</p>}
      </div>
    </>
  );

  return (
    <MotionCardSurface
      cardId={toMotionId(label, motionId)}
      className={`dashboard-stat-card text-left ${isInteractive ? "dashboard-stat-card-clickable" : ""}`}
      morphOnClick={isInteractive}
      detailTitle={detailTitle || label || "Metric detail"}
      detailContent={<StatDetail item={{ label, value, helper, detailRows, detailNote }} />}
      modalWidth="max-w-2xl"
    >
      {content}
    </MotionCardSurface>
  );
};
