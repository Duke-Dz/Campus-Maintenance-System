import { Shield } from "lucide-react";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";

const SLAContent = ({ slaOverview, resolution, detail = false }) => {
  const complianceTone =
    slaOverview.compliance >= 85 ? "text-emerald-500"
      : slaOverview.compliance >= 65 ? "text-amber-500"
        : "text-red-500";

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-campus-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SLA Compliance
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Active ticket health across critical, high, medium, and low urgency targets.
          </p>
        </div>
        <span className="pill-badge bg-white/80 text-gray-600 dark:bg-slate-900/80 dark:text-slate-200">
          {slaOverview.total} active
        </span>
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="relative h-32 w-32 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-100 dark:text-slate-700"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={complianceTone}
              strokeDasharray={`${slaOverview.compliance} ${100 - slaOverview.compliance}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{slaOverview.compliance}%</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">healthy</span>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap gap-3">
          <div className="dashboard-metric-tile min-w-[90px] flex-1 text-center">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{slaOverview.onTrack}</p>
            <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] leading-snug text-emerald-600/70 dark:text-emerald-400/70">
              On track
            </p>
          </div>
          <div className="dashboard-metric-tile min-w-[90px] flex-1 text-center">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{slaOverview.atRisk}</p>
            <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] leading-snug text-amber-600/70 dark:text-amber-400/70">
              At risk
            </p>
          </div>
          <div className="dashboard-metric-tile min-w-[90px] flex-1 text-center">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{slaOverview.breached}</p>
            <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] leading-snug text-red-600/70 dark:text-red-400/70">
              Breached
            </p>
          </div>
          {detail && (
            <div className="dashboard-metric-tile min-w-[90px] flex-1 text-center">
              <p className="text-xl font-bold text-campus-600 dark:text-campus-400">{resolution?.overallAverageHours ?? "-"}</p>
              <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] leading-snug text-campus-600/70 dark:text-campus-400/70">
                Avg hours
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-[1.1rem] border border-gray-100 bg-white/70 px-4 py-3 text-xs text-gray-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        Avg resolution:
        <span className="ml-1 font-semibold text-gray-700 dark:text-slate-200">{resolution?.overallAverageHours ?? "-"}h</span>
        <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
        SLA targets: Critical 4h, High 24h, Medium 72h, Low 7d
      </div>

      {detail && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Protected by SLA</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{Math.max(0, slaOverview.total - slaOverview.breached)}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pressure ratio</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{slaOverview.total > 0 ? `${Math.round(((slaOverview.atRisk + slaOverview.breached) / slaOverview.total) * 100)}%` : "0%"}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Immediate attention</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{slaOverview.atRisk + slaOverview.breached}</p>
          </div>
        </div>
      )}
    </>
  );
};

export const SLAComplianceCard = ({ slaOverview, resolution }) => {
  return (
    <MotionCardSurface
      cardId="admin-sla-compliance"
      className="interactive-surface"
      morphOnClick
      detailTitle="SLA compliance detail"
      detailContent={<SLAContent slaOverview={slaOverview} resolution={resolution} detail />}
      modalWidth="max-w-3xl"
    >
      <SLAContent slaOverview={slaOverview} resolution={resolution} />
    </MotionCardSurface>
  );
};
