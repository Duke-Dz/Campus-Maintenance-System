import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";

const BuildingsContent = ({ topBuildings = [], detail = false }) => {
  const maxIssues = Math.max(...topBuildings.map((item) => item.totalIssues), 1);
  const visibleBuildings = detail ? topBuildings : topBuildings.slice(0, 4);

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Building Pressure
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Buildings generating the highest ticket volume right now.
        </p>
      </div>

      <div className="space-y-3">
        {topBuildings.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
        {visibleBuildings.map((item, index) => {
          const width = `${Math.max(14, (item.totalIssues / maxIssues) * 100)}%`;
          return (
            <div key={item.building} className="dashboard-list-item px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="dashboard-rank-chip flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{item.building}</span>
                </div>
                <span className="text-sm font-bold text-campus-600 dark:text-campus-400">{item.totalIssues}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-campus-500 to-sky-400"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
        {!detail && topBuildings.length > visibleBuildings.length && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing top {visibleBuildings.length}. Open detail for full ranking.
          </p>
        )}
      </div>

      {detail && topBuildings.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Highest load</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{topBuildings[0]?.building ?? "-"}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Top issues</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{topBuildings[0]?.totalIssues ?? 0}</p>
          </div>
          <div className="rounded-[1rem] border border-gray-100 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Buildings tracked</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{topBuildings.length}</p>
          </div>
        </div>
      )}
    </>
  );
};

export const BuildingsRanking = ({ topBuildings = [] }) => {
  return (
    <MotionCardSurface
      cardId="admin-building-pressure"
      className="interactive-surface"
      morphOnClick
      detailTitle="Building pressure detail"
      detailContent={<BuildingsContent topBuildings={topBuildings} detail />}
      modalWidth="max-w-3xl"
    >
      <BuildingsContent topBuildings={topBuildings} />
    </MotionCardSurface>
  );
};
