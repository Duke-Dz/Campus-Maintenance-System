import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronsLeftRight, LayoutGrid, MoonStar, SlidersHorizontal, Sparkles, Sun, UserRound } from "lucide-react";
import { Modal } from "../Common/Modal.jsx";
import { useAccount } from "../../hooks/useAccount";

const optionButtonClass = (active) => `rounded-xl border px-3 py-2 text-sm font-semibold transition ${
  active
    ? "border-campus-500 bg-campus-50 text-campus-700 dark:border-campus-400 dark:bg-campus-900/30 dark:text-campus-200"
    : "border-slate-200 bg-white text-slate-600 hover:border-campus-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
}`;

export const AccountQuickSettings = ({ open, onClose, roleConfig, homePath }) => {
  const navigate = useNavigate();
  const { account, updatePreferences } = useAccount();
  const [savingKey, setSavingKey] = useState("");
  const preferences = account?.preferences || {};
  const landingOptions = Object.entries(roleConfig?.sectionLabels || {});

  const patchPreference = async (payload, key) => {
    setSavingKey(key);
    try {
      await updatePreferences(payload);
    } finally {
      setSavingKey("");
    }
  };

  const goToSection = (sectionId) => {
    onClose?.();
    navigate(homePath);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: sectionId } }));
    }, 120);
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick Settings" width="max-w-2xl">
      <div className="space-y-6">
        <section className="rounded-[1.3rem] border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="icon-wrap bg-campus-50 text-campus-700 dark:bg-campus-900/30 dark:text-campus-200"><Sparkles size={18} /></div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Appearance</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Control theme, density, and motion for your workspace.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Theme</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => patchPreference({ theme: "light" }, "theme-light")} className={optionButtonClass(preferences.theme === "light")}><Sun size={15} /> Light</button>
                <button type="button" onClick={() => patchPreference({ theme: "dark" }, "theme-dark")} className={optionButtonClass(preferences.theme === "dark")}><MoonStar size={15} /> Dark</button>
                <button type="button" onClick={() => patchPreference({ theme: "system" }, "theme-system")} className={optionButtonClass(preferences.theme === "system")}><SlidersHorizontal size={15} /> System</button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Density</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => patchPreference({ density: "comfortable" }, "density-comfortable")} className={optionButtonClass(preferences.density === "comfortable")}><LayoutGrid size={15} /> Comfortable</button>
                <button type="button" onClick={() => patchPreference({ density: "compact" }, "density-compact")} className={optionButtonClass(preferences.density === "compact")}><ChevronsLeftRight size={15} /> Compact</button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-200">Reduce motion</span>
              <input
                type="checkbox"
                checked={Boolean(preferences.reduceMotion)}
                onChange={(event) => patchPreference({ reduceMotion: event.target.checked }, "reduce-motion")}
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-200">Collapse sidebar by default</span>
              <input
                type="checkbox"
                checked={Boolean(preferences.sidebarCollapsedDefault)}
                onChange={(event) => patchPreference({ sidebarCollapsedDefault: event.target.checked }, "sidebar-default")}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.3rem] border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">Workspace defaults</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Default landing section</span>
              <select
                value={preferences.defaultLandingSection || "dashboard"}
                onChange={(event) => patchPreference({ defaultLandingSection: event.target.value }, "landing-section")}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {landingOptions.map(([sectionId, label]) => (
                  <option key={sectionId} value={sectionId}>{label}</option>
                ))}
              </select>
            </label>
            {savingKey ? <p className="text-xs text-slate-500 dark:text-slate-400">Saving...</p> : null}
          </div>
        </section>

        <section className="rounded-[1.3rem] border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-950/70">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">Shortcuts</h4>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => { onClose?.(); navigate("/profile"); }} className="btn-ghost interactive-control"><UserRound size={15} /> Open profile</button>
            {roleConfig?.primaryAction ? (
              <button type="button" onClick={() => goToSection(roleConfig.primaryAction.sectionId)} className="btn-primary interactive-control">{roleConfig.primaryAction.label}</button>
            ) : null}
            <Link to="/profile" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 no-underline dark:border-slate-700 dark:text-slate-300">Open account center</Link>
          </div>
        </section>
      </div>
    </Modal>
  );
};
