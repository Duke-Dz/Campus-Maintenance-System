import { Shield, Wrench, ClipboardList, Bell } from "lucide-react";

const features = [
  { icon: ClipboardList, label: "Submit & track maintenance requests" },
  { icon: Wrench,        label: "Smart technician auto-assignment" },
  { icon: Bell,          label: "Real-time status notifications" },
  { icon: Shield,        label: "Role-based secure access" },
];

export const AuthBrandPanel = ({
  title = "Welcome to CampusFix",
  subtitle,
  icon: Icon,
}) => {
  return (
    <div className="auth-brand-panel relative flex h-full flex-col justify-between overflow-hidden px-10 py-12 lg:px-12 lg:py-14">

      {/* ── layered mesh gradient orbs ── */}
      <div className="auth-bp-orb auth-bp-orb-1" />
      <div className="auth-bp-orb auth-bp-orb-2" />
      <div className="auth-bp-orb auth-bp-orb-3" />

      {/* dot-grid overlay */}
      <div className="auth-grid-overlay auth-grid-drift" />

      {/* noise texture */}
      <div className="auth-bp-noise" />

      {/* ── floating geometric accents ── */}
      <div className="auth-float-1 pointer-events-none absolute right-[9%] top-[8%]">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="opacity-[0.13]">
          <path d="M36 4L66 22V50L36 68L6 50V22L36 4Z" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="auth-float-2 pointer-events-none absolute bottom-[18%] right-[14%]" style={{ animationDelay: "-5s" }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="opacity-[0.10]">
          <rect x="22" y="2" width="26" height="26" rx="3" transform="rotate(45 22 2)" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="auth-float-3 pointer-events-none absolute left-[8%] top-[52%]" style={{ animationDelay: "-9s" }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="opacity-[0.09]">
          <circle cx="18" cy="18" r="16" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="auth-float-1 pointer-events-none absolute left-[18%] top-[22%]" style={{ animationDelay: "-3s" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-[0.15]">
          <polygon points="12,2 22,22 2,22" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>

      {/* pulsing glow behind logo */}
      <div className="auth-glow-pulse pointer-events-none absolute left-1/2 top-[30%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-campus-500/18 blur-3xl" />

      {/* ── top: logo + brand name ── */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="auth-bp-logo-ring flex h-11 w-11 items-center justify-center rounded-2xl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/40">Campus System</p>
          <p className="text-sm font-bold tracking-tight text-white/90">CampusFix</p>
        </div>
      </div>

      {/* ── centre: headline ── */}
      <div className="relative z-10 flex flex-col">
        {Icon ? (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/6 backdrop-blur-sm">
            <Icon size={28} className="text-white/80" />
          </div>
        ) : null}

        <h2 className="auth-bp-headline">
          {title}
        </h2>
        <p className="mt-4 max-w-[300px] text-sm leading-[1.75] text-white/52">
          {subtitle || "The all-in-one platform to report, track, and resolve campus maintenance issues — fast."}
        </p>

        {/* decorative separator */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/25">Features</span>
          <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />
        </div>

        {/* feature list */}
        <ul className="mt-6 space-y-3.5">
          {features.map(({ icon: FIcon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="auth-bp-feature-icon">
                <FIcon size={13} />
              </span>
              <span className="text-[0.82rem] font-medium text-white/62">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── bottom: trust badge ── */}
      <div className="relative z-10">
        <div className="auth-bp-trust-badge">
          <Shield size={13} className="text-emerald-300/80" />
          <span>Secured · Role-based access · End-to-end JWT auth</span>
        </div>
      </div>
    </div>
  );
};
