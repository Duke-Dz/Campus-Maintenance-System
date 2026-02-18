import { formatDate, titleCase } from "../../utils/helpers";

export const TicketTimeline = ({ logs = [] }) => (
  <ol className="space-y-4">
    {logs.map((log) => (
      <li key={log.id} className="relative pl-7">
        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-mint" />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-sm font-semibold text-ink dark:text-slate-100">
            {log.oldStatus ? `${titleCase(log.oldStatus)} -> ${titleCase(log.newStatus)}` : titleCase(log.newStatus)}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{log.note || "No note"}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {log.changedBy?.fullName || log.changedBy?.username} • {formatDate(log.timestamp)}
          </p>
        </div>
      </li>
    ))}
  </ol>
);
