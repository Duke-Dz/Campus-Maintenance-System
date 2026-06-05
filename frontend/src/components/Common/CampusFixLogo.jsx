import { Shield, Wrench, Zap } from "lucide-react";

const sizeMap = {
  sm: {
    frame: "h-10 w-10",
    outer: "rounded-xl",
    glow: "inset-1 rounded-lg",
    inner: "h-8 w-8 rounded-xl",
    wrench: 14,
    topBadge: "-top-0.5 -right-0.5 h-4 w-4",
    bottomBadge: "-bottom-0.5 -left-0.5 h-3.5 w-3.5",
    zap: 8,
    shield: 7,
    wordmark: "text-base",
    subtitle: "text-[11px]",
  },
  md: {
    frame: "h-11 w-11",
    outer: "rounded-xl",
    glow: "inset-1 rounded-lg",
    inner: "h-9 w-9 rounded-xl",
    wrench: 16,
    topBadge: "-top-1 -right-1 h-4 w-4",
    bottomBadge: "-bottom-1 -left-1 h-3.5 w-3.5",
    zap: 9,
    shield: 7,
    wordmark: "text-lg",
    subtitle: "text-xs",
  },
  lg: {
    frame: "h-16 w-16",
    outer: "rounded-2xl",
    glow: "inset-1.5 rounded-[1.1rem]",
    inner: "h-12 w-12 rounded-2xl",
    wrench: 20,
    topBadge: "-top-1 -right-1 h-5 w-5",
    bottomBadge: "-bottom-1 -left-1 h-[1.125rem] w-[1.125rem]",
    zap: 10,
    shield: 8,
    wordmark: "text-xl",
    subtitle: "text-xs",
  },
  hero: {
    frame: "h-20 w-20",
    outer: "rounded-[1.8rem]",
    glow: "inset-[6px] rounded-[1.45rem]",
    inner: "h-16 w-16 rounded-[1.55rem]",
    wrench: 28,
    topBadge: "-top-1.5 -right-1.5 h-6 w-6",
    bottomBadge: "-bottom-1 -left-1 h-5 w-5",
    zap: 12,
    shield: 10,
    wordmark: "text-[1.7rem]",
    subtitle: "text-sm",
  },
};

const motionClasses = (motion) => {
  if (motion === "none") {
    return {
      outer: "",
      glow: "",
      core: "",
    };
  }

  if (motion === "subtle") {
    return {
      outer: "campusfix-logo-subtle-orbit",
      glow: "campusfix-logo-subtle-glow",
      core: "campusfix-logo-subtle-core",
    };
  }

  return {
    outer: "animate-spin-slow",
    glow: "animate-pulse-ring",
    core: "animate-spin-reverse",
  };
};

export const CampusFixLogo = ({
  collapsed = false,
  variant = "default",
  motion = "default",
  size = "md",
  subtitle,
  showWordmark = !collapsed,
}) => {
  const palette = sizeMap[size] || sizeMap.md;
  const logoMotion = motionClasses(motion);
  const authVariant = variant === "auth";
  const containerClass = authVariant
    ? "flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left"
    : `flex items-center gap-3 ${collapsed ? "justify-center" : ""}`;

  return (
    <div
      className={containerClass}
      data-auth-logo={authVariant ? "true" : undefined}
      data-logo-motion={motion}
      data-logo-variant={variant}
    >
      <div className={`relative flex ${palette.frame} items-center justify-center`}>
        <div
          className={`absolute inset-0 ${palette.outer} border border-dashed border-campus-300/60 dark:border-campus-500/30 ${logoMotion.outer}`.trim()}
          data-auth-logo-ring={authVariant ? "true" : undefined}
        />
        <div
          className={`absolute ${palette.glow} bg-campus-400/10 dark:bg-campus-500/10 ${logoMotion.glow}`.trim()}
          data-auth-logo-glow={authVariant ? "true" : undefined}
        />
        <div
          className={`relative z-10 flex ${palette.inner} items-center justify-center bg-gradient-to-br from-campus-500 to-campus-700 text-white shadow-lg shadow-campus-500/30`}
        >
          <Wrench
            size={palette.wrench}
            className={`text-white ${logoMotion.core}`.trim()}
            style={motion === "default" ? { animationDuration: "9s" } : undefined}
          />
        </div>
        <span className={`absolute ${palette.topBadge} flex items-center justify-center rounded-full bg-amber-400 shadow-sm`}>
          <Zap size={palette.zap} className="text-white" />
        </span>
        <span className={`absolute ${palette.bottomBadge} flex items-center justify-center rounded-full bg-emerald-400 shadow-sm`}>
          <Shield size={palette.shield} className="text-white" />
        </span>
      </div>

      {showWordmark ? (
        <div className={authVariant ? "min-w-0" : undefined}>
          <p className={`${palette.wordmark} font-extrabold tracking-tight text-slate-950 dark:text-white`}>
            Campus<span className="text-campus-500">Fix</span>
          </p>
          {subtitle ? (
            <p className={`${palette.subtitle} mt-0.5 text-slate-500 dark:text-slate-400`}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
