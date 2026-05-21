import { CheckCircle2, AlertTriangle } from "lucide-react";

export const SystemStatus = ({ status = "ok" }) => {
  const ok = status === "ok";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
      {ok ? (
        <CheckCircle2 size={14} className="text-emerald-500" />
      ) : (
        <AlertTriangle size={14} className="text-amber-500" />
      )}
      <span>{ok ? "All systems operational" : "Service degraded"}</span>
    </div>
  );
};

