import { useEffect, useMemo, useState } from "react";
import { Camera, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAccount } from "../hooks/useAccount";
import { DashboardShell } from "../components/Dashboard/DashboardShell.jsx";
import { UserAvatar } from "../components/Common/UserAvatar.jsx";
import { ticketService } from "../services/ticketService";
import { userService } from "../services/userService";
import { AVATAR_PRESETS, normalizeAvatarPreset } from "../utils/profilePreferences";
import { getRoleDashboardConfig } from "../components/Dashboard/roleDashboardConfig";

const tabs = ["overview", "preferences", "notifications", "security"];

const formatDate = (value, fallback = "Not available") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ProfilePage = () => {
  const { auth } = useAuth();
  const {
    account,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateNotificationPreferences,
    uploadAvatar,
    deleteAvatar,
    changePassword,
    revokeSession,
    revokeOtherSessions,
  } = useAccount();
  const role = account?.identity?.role || auth?.role || "STUDENT";
  const roleConfig = getRoleDashboardConfig(role);
  const [activeTab, setActiveTab] = useState("overview");
  const [fullName, setFullName] = useState("");
  const [preferencesForm, setPreferencesForm] = useState(null);
  const [notificationForm, setNotificationForm] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [pageState, setPageState] = useState({ savingProfile: false, savingPreferences: false, savingNotifications: false, changingPassword: false, message: "", error: "" });
  const [overviewContext, setOverviewContext] = useState({ loading: false, items: [] });

  useEffect(() => {
    document.title = "Account Center | CampusFix";
  }, []);

  useEffect(() => {
    if (!account?.identity?.fullName) return;
    setFullName(account.identity.fullName);
    setPreferencesForm(account.preferences);
    setNotificationForm(account.notifications || []);
  }, [account]);

  useEffect(() => {
    let cancelled = false;
    const loadContext = async () => {
      if (!account?.identity?.role) return;
      setOverviewContext({ loading: true, items: [] });
      try {
        if (account.identity.role === "STUDENT") {
          const tickets = await ticketService.getMyTickets();
          if (cancelled) return;
          const open = tickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)).length;
          const lastResolved = tickets.find((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status));
          setOverviewContext({
            loading: false,
            items: [
              { label: "Open requests", value: open },
              { label: "Last resolved request", value: lastResolved ? `#${lastResolved.id}` : "None yet" },
              { label: "Default building", value: account?.profile?.primaryBuilding?.name || "Not set" },
            ],
          });
          return;
        }
        if (account.identity.role === "MAINTENANCE") {
          const tickets = await ticketService.getAssignedTickets();
          if (cancelled) return;
          const activeQueue = tickets.filter((ticket) => ["ASSIGNED", "IN_PROGRESS"].includes(ticket.status)).length;
          const resolved = tickets.filter((ticket) => ["RESOLVED", "CLOSED"].includes(ticket.status)).length;
          setOverviewContext({
            loading: false,
            items: [
              { label: "Active queue", value: activeQueue },
              { label: "Resolved history", value: resolved },
              { label: "Primary building", value: account?.profile?.primaryBuilding?.name || "Not set" },
            ],
          });
          return;
        }
        const [tickets, broadcasts] = await Promise.all([
          ticketService.getAllTickets({}),
          userService.getScheduledBroadcasts().catch(() => []),
        ]);
        if (cancelled) return;
        const criticalOpen = tickets.filter((ticket) => !["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status) && ticket.urgency === "CRITICAL").length;
        const latestBroadcast = broadcasts[0];
        setOverviewContext({
          loading: false,
          items: [
            { label: "Critical open tickets", value: criticalOpen },
            { label: "Managed department", value: account?.profile?.departmentName || "Operations" },
            { label: "Latest broadcast", value: latestBroadcast?.title || "No scheduled broadcast" },
          ],
        });
      } catch {
        if (!cancelled) {
          setOverviewContext({ loading: false, items: [] });
        }
      }
    };

    loadContext();
    return () => {
      cancelled = true;
    };
  }, [account]);

  useEffect(() => {
    let cancelled = false;
    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const data = await userService.getMySessions();
        if (!cancelled) {
          setSessions(data);
        }
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    };

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  const landingOptions = useMemo(() => Object.entries(roleConfig.sectionLabels || {}), [roleConfig.sectionLabels]);
  const avatar = account?.identity?.avatar || {};

  const saveProfile = async (event) => {
    event.preventDefault();
    setPageState((current) => ({ ...current, savingProfile: true, message: "", error: "" }));
    try {
      await updateProfile({ fullName });
      setPageState((current) => ({ ...current, savingProfile: false, message: "Profile updated." }));
    } catch (err) {
      setPageState((current) => ({ ...current, savingProfile: false, error: err?.response?.data?.message || "Unable to update profile." }));
    }
  };

  const savePreferences = async (event) => {
    event.preventDefault();
    setPageState((current) => ({ ...current, savingPreferences: true, message: "", error: "" }));
    try {
      await updatePreferences(preferencesForm);
      setPageState((current) => ({ ...current, savingPreferences: false, message: "Preferences saved." }));
    } catch (err) {
      setPageState((current) => ({ ...current, savingPreferences: false, error: err?.response?.data?.message || "Unable to save preferences." }));
    }
  };

  const saveNotifications = async (event) => {
    event.preventDefault();
    setPageState((current) => ({ ...current, savingNotifications: true, message: "", error: "" }));
    try {
      await updateNotificationPreferences(notificationForm.map((item) => ({
        eventKey: item.eventKey,
        inAppEnabled: item.inAppEnabled,
        emailEnabled: item.emailEnabled,
        deliveryMode: item.deliveryMode,
      })));
      setPageState((current) => ({ ...current, savingNotifications: false, message: "Notification preferences saved." }));
    } catch (err) {
      setPageState((current) => ({ ...current, savingNotifications: false, error: err?.response?.data?.message || "Unable to save notification preferences." }));
    }
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPageState((current) => ({ ...current, error: "New password and confirmation must match." }));
      return;
    }
    setPageState((current) => ({ ...current, changingPassword: true, message: "", error: "" }));
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPageState((current) => ({ ...current, changingPassword: false, message: "Password changed successfully." }));
    } catch (err) {
      setPageState((current) => ({ ...current, changingPassword: false, error: err?.response?.data?.message || "Unable to change password." }));
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAvatar({ file, avatarType: "upload", avatarPreset: avatar.avatarPreset || "identicon" });
    event.target.value = "";
  };

  const contentLoading = loading && !account;

  return (
    <DashboardShell>
      <div className="dashboard-shell animate-fade-in">
        <section id="dashboard" data-dashboard-section="true" className="dashboard-role-header dashboard-role-header-account">
          <div className="dashboard-role-header-grid">
            <div className="space-y-4">
              <p className="dashboard-role-eyebrow">Account Center</p>
              <div>
                <h1 className="dashboard-role-title">Profile, preferences, notifications, and security in one place</h1>
                <p className="dashboard-role-subtitle">CampusFix now stores your dashboard settings and avatar selections in your account instead of only keeping them in the browser.</p>
              </div>
            </div>
          </div>
        </section>

        {contentLoading ? <p className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">Loading your account center.</p> : null}
        {error || pageState.error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">{pageState.error || error}</p> : null}
        {pageState.message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">{pageState.message}</p> : null}

        <section className="saas-card">
          <div className="account-identity-band">
            <div className="flex flex-wrap items-center gap-4">
              <div className="dashboard-avatar-wrap">
                <UserAvatar
                  fullName={account?.identity?.fullName || auth?.fullName}
                  username={account?.identity?.username || auth?.username}
                  avatarType={avatar.avatarType}
                  avatarPreset={avatar.avatarPreset}
                  avatarImageUrl={avatar.avatarImageUrl}
                  size={72}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{account?.identity?.fullName || auth?.fullName || auth?.username}</h2>
                  <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/30 dark:text-campus-200">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span>{account?.identity?.email}</span>
                  <span>{account?.profile?.departmentName || "CampusFix member"}</span>
                  <span>Member since {formatDate(account?.identity?.createdAt, "Not available")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="account-center-tabs mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`dashboard-segment-btn rounded-xl px-4 py-2 text-sm font-semibold capitalize ${activeTab === tab ? "dashboard-segment-btn-active" : "border border-slate-200 dark:border-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "overview" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)]">
            <form onSubmit={saveProfile} className="saas-card space-y-5">
              <div className="flex items-center gap-3">
                <div className="icon-wrap bg-campus-50 text-campus-700 dark:bg-campus-900/30 dark:text-campus-200"><UserRound size={18} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Identity</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Keep your personal details current while organization-managed fields stay read-only here.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Full name</span>
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</span>
                  <input value={account?.identity?.username || ""} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
                  <input value={account?.identity?.email || ""} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</span>
                  <input value={role} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" />
                </label>
              </div>

              <div className="rounded-[1.15rem] border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="btn-ghost interactive-control cursor-pointer"><Camera size={15} /> Upload photo<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} /></label>
                  {avatar.uploaded ? <button type="button" onClick={() => deleteAvatar()} className="btn-ghost interactive-control">Use generated avatar</button> : null}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => uploadAvatar({ avatarType: "preset", avatarPreset: preset.id })}
                      className={`rounded-2xl border p-3 text-left transition ${avatar.avatarType !== "upload" && avatar.avatarPreset === preset.id ? "border-campus-500 bg-campus-50/70 dark:border-campus-300 dark:bg-campus-900/20" : "border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-950/70"}`}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar fullName={account?.identity?.fullName} username={account?.identity?.username} avatarPreset={preset.id} size={42} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{preset.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary interactive-control">{pageState.savingProfile ? "Saving..." : "Save profile"}</button>
              </div>
            </form>

            <div className="space-y-6">
              <section className="saas-card">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Role context</h3>
                <div className="mt-4 space-y-3">
                  {overviewContext.loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading role context.</p> : overviewContext.items.map((item) => (
                    <div key={item.label} className="dashboard-list-item flex items-center justify-between px-4 py-3">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="saas-card">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Organization fields</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between"><span>Department</span><strong className="text-slate-900 dark:text-white">{account?.profile?.departmentName || "Not set"}</strong></div>
                  <div className="flex items-center justify-between"><span>Phone extension</span><strong className="text-slate-900 dark:text-white">{account?.profile?.phoneExtension || "Not set"}</strong></div>
                  <div className="flex items-center justify-between"><span>Primary building</span><strong className="text-slate-900 dark:text-white">{account?.profile?.primaryBuilding?.name || "Not set"}</strong></div>
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {activeTab === "preferences" && preferencesForm ? (
          <form onSubmit={savePreferences} className="saas-card space-y-5">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Workspace preferences</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</span>
                <select value={preferencesForm.theme || "light"} onChange={(event) => setPreferencesForm((current) => ({ ...current, theme: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Density</span>
                <select value={preferencesForm.density || "comfortable"} onChange={(event) => setPreferencesForm((current) => ({ ...current, density: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Timezone</span>
                <input value={preferencesForm.timezone || ""} onChange={(event) => setPreferencesForm((current) => ({ ...current, timezone: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Language</span>
                <input value={preferencesForm.language || "en"} onChange={(event) => setPreferencesForm((current) => ({ ...current, language: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Default landing section</span>
                <select value={preferencesForm.defaultLandingSection || "dashboard"} onChange={(event) => setPreferencesForm((current) => ({ ...current, defaultLandingSection: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {landingOptions.map(([sectionId, label]) => <option key={sectionId} value={sectionId}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Rows per page</span>
                <input type="number" min="5" max="100" value={preferencesForm.rowsPerPage || 10} onChange={(event) => setPreferencesForm((current) => ({ ...current, rowsPerPage: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["reduceMotion", "Reduce motion"],
                ["sidebarCollapsedDefault", "Collapse sidebar by default"],
                ["stickyFilters", "Keep filters sticky"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
                  <input type="checkbox" checked={Boolean(preferencesForm[key])} onChange={(event) => setPreferencesForm((current) => ({ ...current, [key]: event.target.checked }))} />
                </label>
              ))}
            </div>
            <div className="flex justify-end"><button type="submit" className="btn-primary interactive-control">{pageState.savingPreferences ? "Saving..." : "Save preferences"}</button></div>
          </form>
        ) : null}

        {activeTab === "notifications" ? (
          <form onSubmit={saveNotifications} className="saas-card space-y-5">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Notification preferences</h3>
            <div className="space-y-4">
              {notificationForm.map((item, index) => (
                <div key={item.eventKey} className="rounded-[1.2rem] border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{item.eventKey}</p>
                    </div>
                    <select value={item.deliveryMode} onChange={(event) => setNotificationForm((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, deliveryMode: event.target.value } : entry))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                      <option value="instant">Instant</option>
                      <option value="digest">Digest</option>
                      <option value="mute">Mute</option>
                    </select>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-200">In-app</span>
                      <input type="checkbox" checked={Boolean(item.inAppEnabled)} onChange={(event) => setNotificationForm((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, inAppEnabled: event.target.checked } : entry))} />
                    </label>
                    <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-200">Email</span>
                      <input type="checkbox" checked={Boolean(item.emailEnabled)} onChange={(event) => setNotificationForm((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, emailEnabled: event.target.checked } : entry))} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end"><button type="submit" className="btn-primary interactive-control">{pageState.savingNotifications ? "Saving..." : "Save notifications"}</button></div>
          </form>
        ) : null}

        {activeTab === "security" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
            <form onSubmit={submitPasswordChange} className="saas-card space-y-5">
              <div className="flex items-center gap-3">
                <div className="icon-wrap bg-campus-50 text-campus-700 dark:bg-campus-900/30 dark:text-campus-200"><KeyRound size={18} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Change password</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Keep your account secure with a fresh password.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Current password</span>
                  <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</span>
                  <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm new password</span>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
              </div>
              <div className="flex justify-end"><button type="submit" className="btn-primary interactive-control">{pageState.changingPassword ? "Updating..." : "Change password"}</button></div>
            </form>

            <div className="space-y-6">
              <section className="saas-card">
                <div className="flex items-center gap-3">
                  <div className="icon-wrap bg-campus-50 text-campus-700 dark:bg-campus-900/30 dark:text-campus-200"><ShieldCheck size={18} /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Active sessions</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Review where your account is currently signed in.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {sessionsLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading sessions.</p> : sessions.map((session) => (
                    <div key={session.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{session.deviceLabel}{session.current ? " (Current)" : ""}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Last active {formatDate(session.lastUsedAt || session.createdAt)}</p>
                        </div>
                        {!session.current ? <button type="button" onClick={async () => { await revokeSession(session.id); setSessions((current) => current.filter((entry) => entry.id !== session.id)); }} className="btn-ghost interactive-control">Revoke</button> : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={async () => { await revokeOtherSessions(); const nextSessions = await userService.getMySessions(); setSessions(nextSessions); }} className="btn-ghost interactive-control">Sign out other sessions</button>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
};

export default ProfilePage;
