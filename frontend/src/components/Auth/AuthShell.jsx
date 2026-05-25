import { useEffect, useId } from "react";
import { AuthBrandPanel } from "./AuthBrandPanel.jsx";
import { CampusFixLogo } from "../Common/CampusFixLogo.jsx";

/**
 * Auth page shell — immersive split-screen layout with glassmorphism form card
 * and animated brand panel.
 *
 * Supports two layouts:
 *  - "immersive" (default): 50/50 split with brand panel left, form right
 *  - "single": centred form card, no brand panel (used for error/invalid states)
 */
export const AuthShell = ({
  sectionLabel,
  heading,
  description,
  headerAddon,
  children,
  footer,
  aside,          // kept for backward-compat — rendered in single-column fallback
  documentTitle,
  taskIcon: TaskIcon,
  layout = "immersive",
  heroBrand = false,
  showHeaderBrand = false,
  headerBrandSubtitle,
  brandTitle,
  brandSubtitle,
  brandIcon,
}) => {
  const headingId = useId();
  const singleColumn = layout === "single" || (layout !== "immersive" && !aside);
  const isImmersive = layout === "immersive" && !singleColumn;
  const centeredHeader = heroBrand || showHeaderBrand;
  const sectionMarginClass = TaskIcon || showHeaderBrand ? "mt-3" : "";
  const headerTopClass = heroBrand ? "pt-8 sm:pt-9" : "";

  useEffect(() => {
    if (typeof document === "undefined" || !heading) {
      return;
    }
    document.title = `${documentTitle || heading} | CampusFix`;
  }, [documentTitle, heading]);

  /* ── form card ── */
  const formCard = (
    <main
      aria-labelledby={headingId}
      className={
        isImmersive
          ? "auth-form-enter auth-glass-card relative w-full max-w-lg px-6 py-7 sm:px-8 sm:py-8"
          : "public-card-enter auth-single-card relative mx-auto w-full max-w-[32rem] px-5 py-7 sm:px-7 sm:py-8"
      }
    >
      {heroBrand ? (
        <div
          className="absolute left-1/2 top-5 z-10 -translate-x-1/2 scale-[0.84] sm:top-6 sm:scale-90"
          data-auth-corner-brand="true"
        >
          <CampusFixLogo variant="auth" motion="subtle" size="sm" />
        </div>
      ) : null}

      <header
        className={`${headerTopClass} ${centeredHeader ? "text-center" : ""}`.trim()}
      >
        {showHeaderBrand ? (
          <div className={`auth-shell-brand mb-4 flex ${centeredHeader ? "justify-center" : "justify-start"}`}>
            <CampusFixLogo
              variant="auth"
              motion="subtle"
              size="sm"
              subtitle={headerBrandSubtitle || "Campus Maintenance System"}
            />
          </div>
        ) : null}

        {TaskIcon ? (
          <div
            className={`flex ${centeredHeader ? "justify-center" : "justify-start"} gap-3`}
          >
            <span className="auth-task-icon inline-flex h-12 w-12 items-center justify-center rounded-2xl">
              <TaskIcon size={20} />
            </span>
          </div>
        ) : null}

        {sectionLabel ? (
          <p
            className={`${sectionMarginClass} text-sm font-semibold text-campus-700 dark:text-campus-300`}
          >
            {sectionLabel}
          </p>
        ) : null}
        <h1
          id={headingId}
          className="auth-shell-heading mt-2 text-[1.7rem] font-bold tracking-tight text-slate-950 dark:text-white sm:text-[1.85rem]"
        >
          {heading}
        </h1>
        {description ? (
          <p
            className={`auth-shell-description mt-2 text-[0.95rem] leading-6 text-slate-600 dark:text-slate-300 sm:text-[0.9rem] ${centeredHeader ? "mx-auto max-w-xl" : "max-w-xl"}`}
          >
            {description}
          </p>
        ) : null}
        {headerAddon ? (
          <div
            className={`mt-5 ${centeredHeader ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
          >
            {headerAddon}
          </div>
        ) : null}
      </header>

      <div className="mt-6">{children}</div>
      {footer ? (
        <div className="auth-shell-footer mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
          {footer}
        </div>
      ) : null}
    </main>
  );

  /* ── immersive layout ── */
  if (isImmersive) {
    return (
      <div className="auth-immersive-bg relative min-h-screen text-slate-900 dark:text-white">
        {/* ambient background blurs */}
        <div className="pointer-events-none absolute left-[7%] top-16 h-56 w-56 rounded-full bg-campus-500/8 blur-3xl dark:bg-campus-500/12" />
        <div className="pointer-events-none absolute bottom-12 right-[6%] h-64 w-64 rounded-full bg-emerald-400/8 blur-3xl dark:bg-emerald-400/8" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-8">
            {/* brand panel — hidden on mobile, left on desktop */}
            <div className="auth-brand-enter hidden min-h-[520px] lg:block">
              <AuthBrandPanel
                title={brandTitle}
                subtitle={brandSubtitle}
                icon={brandIcon}
              />
            </div>

            {/* form card */}
            <div className="flex justify-center lg:justify-start">
              {formCard}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── single-column / legacy layout ── */
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f4f7fb_0%,#edf3fb_44%,#e7eef8_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#081221_0%,#0b182a_44%,#0d1a2f_100%)] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(29,99,237,0.14),transparent_30%),radial-gradient(circle_at_84%_12%,rgba(15,157,138,0.11),transparent_24%),radial-gradient(circle_at_75%_78%,rgba(217,164,65,0.1),transparent_24%)]" />
      <div className="pointer-events-none absolute left-[7%] top-16 h-56 w-56 rounded-full bg-campus-500/10 blur-3xl dark:bg-campus-500/14" />
      <div className="pointer-events-none absolute bottom-12 right-[6%] h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/10" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="public-page-enter grid flex-1 content-start gap-5 py-2 mx-auto w-full max-w-3xl sm:content-center">
          {formCard}
        </div>
      </div>
    </div>
  );
};
