import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Moon, Palette, Save, Sparkles, Sun, UserRound } from "lucide-react";
import { Modal } from "../Common/Modal";
import { AVATAR_PRESETS } from "../../utils/profilePreferences";
import { UserAvatar } from "../Common/UserAvatar";

const REDUCE_MOTION_KEY = "campusfix-reduce-motion";
const SIDEBAR_COLLAPSED_KEY = "campusfix-sidebar-collapsed";

const readReduceMotionPreference = () => {
  try {
    return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
  } catch {
    return false;
  }
};

const readSidebarCollapsedPreference = () => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

export const ProfileSettingsModal = ({
  open,
  onClose,
  initialTab = "profile",
  auth,
  profilePreferences,
  onSaveProfile,
  theme,
  toggleTheme,
}) => {
  const [tab, setTab] = useState(initialTab);
  const [fullName, setFullName] = useState(auth?.fullName || "");
  const [avatarType, setAvatarType] = useState(profilePreferences?.avatarType || "preset");
  const [avatarPreset, setAvatarPreset] = useState(profilePreferences?.avatarPreset || "campus");
  const [avatarImage, setAvatarImage] = useState(profilePreferences?.avatarImage || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [reduceMotion, setReduceMotion] = useState(readReduceMotionPreference());
  const [sidebarCollapsedDefault, setSidebarCollapsedDefault] = useState(readSidebarCollapsedPreference());

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setFullName(auth?.fullName || "");
    setAvatarType(profilePreferences?.avatarType || "preset");
    setAvatarPreset(profilePreferences?.avatarPreset || "campus");
    setAvatarImage(profilePreferences?.avatarImage || "");
    setSaveError("");
    setSaveNotice("");
    setReduceMotion(readReduceMotionPreference());
    setSidebarCollapsedDefault(readSidebarCollapsedPreference());
  }, [auth?.fullName, initialTab, open, profilePreferences]);

  const activePreset = useMemo(
    () => AVATAR_PRESETS.find((preset) => preset.id === avatarPreset) || AVATAR_PRESETS[0],
    [avatarPreset]
  );

  const applyDashboardPreferences = () => {
    try {
      localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsedDefault));
    } catch {
      // ignore storage restrictions
    }

    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }

    window.dispatchEvent(
      new CustomEvent("dashboard:sidebar-collapsed", {
        detail: { collapsed: sidebarCollapsedDefault },
      })
    );
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Avatar image must be 2MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setAvatarImage(dataUrl);
      setAvatarType("upload");
      setSaveError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setSaveError("Full name is required.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveNotice("");

    try {
      await onSaveProfile?.({
        fullName: fullName.trim(),
        avatarType,
        avatarPreset,
        avatarImage,
      });
      applyDashboardPreferences();
      setSaveNotice("Profile and settings saved.");
    } catch (error) {
      setSaveError(error?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Profile & Settings" width="max-w-2xl">
      <div className="space-y-5">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`interactive-control inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === "profile"
                ? "bg-white text-campus-600 shadow-sm dark:bg-slate-900 dark:text-campus-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <UserRound size={14} />
            Profile
          </button>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`interactive-control inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === "settings"
                ? "bg-white text-campus-600 shadow-sm dark:bg-slate-900 dark:text-campus-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Sparkles size={14} />
            Settings
          </button>
        </div>

        {tab === "profile" && (
          <div className="grid gap-6 md:grid-cols-[220px,1fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Preview</p>
              <div className="mt-3 flex flex-col items-center gap-3">
                <UserAvatar
                  fullName={fullName}
                  username={auth?.username}
                  avatarType={avatarType}
                  avatarPreset={activePreset.id}
                  avatarImage={avatarImage}
                  size={84}
                />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fullName || auth?.username}</p>
                <label className="interactive-control inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-campus-400 hover:text-campus-600 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-campus-500 dark:hover:text-campus-300">
                  <ImagePlus size={14} />
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={120}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Avatar Style</label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {AVATAR_PRESETS.map((preset) => {
                    const selected = avatarType === "preset" && avatarPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAvatarType("preset");
                          setAvatarPreset(preset.id);
                        }}
                        className={`interactive-control rounded-xl border p-2 ${
                          selected
                            ? "border-campus-400 bg-campus-50 dark:border-campus-500 dark:bg-campus-900/20"
                            : "border-gray-200 bg-white hover:border-campus-300 dark:border-slate-700 dark:bg-slate-900"
                        }`}
                        title={preset.label}
                      >
                        <span className={`mx-auto block h-7 w-7 rounded-lg bg-gradient-to-br ${preset.classes}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {avatarType === "upload" && avatarImage && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarType("preset");
                    setAvatarImage("");
                  }}
                  className="interactive-control rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  Use preset avatar instead
                </button>
              )}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => theme === "dark" && toggleTheme?.()}
                  className={`interactive-control inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                    theme === "light"
                      ? "bg-campus-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
                  }`}
                >
                  <Sun size={14} />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => theme === "light" && toggleTheme?.()}
                  className={`interactive-control inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                    theme === "dark"
                      ? "bg-campus-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
                  }`}
                >
                  <Moon size={14} />
                  Dark
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dashboard Preferences</p>
              <label className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
                Reduce motion effects
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={(event) => setReduceMotion(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-campus-500 focus:ring-campus-400"
                />
              </label>
              <label className="mt-3 flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
                Collapse sidebar by default
                <input
                  type="checkbox"
                  checked={sidebarCollapsedDefault}
                  onChange={(event) => setSidebarCollapsedDefault(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-campus-500 focus:ring-campus-400"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-campus-50/60 p-3 text-xs text-campus-700 dark:border-campus-900/40 dark:bg-campus-900/20 dark:text-campus-300">
              <p className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em]">
                <Palette size={12} />
                Browser compatibility
              </p>
              <p className="mt-1">Profile fields use browser autofill and password managers based on standard autocomplete attributes in auth forms.</p>
            </div>
          </div>
        )}

        {saveError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{saveError}</p>}
        {saveNotice && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{saveNotice}</p>}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost interactive-control">Close</button>
          <button type="button" onClick={handleSaveProfile} disabled={saving} className="btn-primary interactive-control">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
