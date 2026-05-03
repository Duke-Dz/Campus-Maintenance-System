import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";

const CrewContent = ({ crewPerformance = [], resolution, detail = false }) => {
  const maxResolved = Math.max(...crewPerformance.map((item) => item.resolvedTickets), 1);
  const visibleCrew = detail ? crewPerformance : crewPerformance.slice(0, 4);

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Crew Performance
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Maintenance staff ranked by total resolved tickets.
        </p>
      </div>

      <div className="space-y-3">
        {crewPerformance.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
        {visibleCrew.map((item, index) => {
          const width = `${Math.max(14, (item.resolvedTickets / maxResolved) * 100)}%`;
          return (
            <div key={item.userId ?? item.fullName ?? index} className="dashboard-list-item px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="dashboard-rank-chip flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{item.fullName}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.resolvedTickets}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
        {!detail && crewPerformance.length > visibleCrew.length && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing top {visibleCrew.length}. Open detail for full ranking.
          </p>
        )}
      </div>

      {resolution && (
        <div className="mt-4 rounded-[1.1rem] border border-gray-100 bg-white/70 px-4 py-3 text-xs text-gray-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          Overall average resolution:
          <span className="ml-1 font-semibold text-gray-700 dark:text-slate-200">{resolution.overallAverageHours}h</span>
        </div>
      )}

      {detail && crewPerformance.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top resolver</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{crewPerformance[0]?.fullName ?? "-"}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Resolved by leader</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{crewPerformance[0]?.resolvedTickets ?? 0}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Crew counted</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{crewPerformance.length}</p>
          </div>
        </div>
      )}
    </>
  );
};

export const CrewPerformance = ({ crewPerformance = [], resolution }) => {
  return (
    <MotionCardSurface
      cardId="admin-crew-performance"
      className="interactive-surface"
      morphOnClick
      detailTitle="Crew performance detail"
      detailContent={<CrewContent crewPerformance={crewPerformance} resolution={resolution} detail />}
      modalWidth="max-w-3xl"
    >
      <CrewContent crewPerformance={crewPerformance} resolution={resolution} />
    </MotionCardSurface>
  );
};
