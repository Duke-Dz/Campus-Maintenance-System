import { Shield, Wrench, Zap } from "lucide-react";

export const CampusFixLogo = ({ collapsed = false, roleLabel = "", roleTone = "" }) => (
  <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
    <div className="relative flex h-11 w-11 items-center justify-center">
      <div className="absolute inset-0 rounded-xl border border-dashed border-campus-300/60 dark:border-campus-500/35 animate-spin-slow" />
      <div className="absolute inset-1 rounded-lg bg-campus-400/10 dark:bg-campus-500/15 animate-pulse-ring" />
      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-campus-500 to-campus-700 text-white shadow-lg shadow-campus-500/30">
        <Wrench size={16} className="animate-spin-reverse" style={{ animationDuration: "9s" }} />
      </div>
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
        <Zap size={9} className="text-white" />
      </span>
      <span className="absolute -bottom-1 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 shadow-sm">
        <Shield size={7} className="text-white" />
      </span>
    </div>

    {!collapsed && (
      <div>
        <p className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
          Campus<span className="text-campus-500">Fix</span>
        </p>
        {roleLabel && (
          <p className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${roleTone}`}>
            {roleLabel}
          </p>
        )}
      </div>
    )}
  </div>
);
