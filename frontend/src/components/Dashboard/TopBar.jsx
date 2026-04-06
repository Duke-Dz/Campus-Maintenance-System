import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { userService } from "../../services/userService";
import { titleCase } from "../../utils/helpers";
import { loadProfilePreferences, saveProfilePreferences } from "../../utils/profilePreferences";
import { UserAvatar } from "../Common/UserAvatar";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const REDUCE_MOTION_KEY = "campusfix-reduce-motion";

const readReduceMotionPreference = () => {
  try {
    return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
  } catch {
    return false;
  }
};

export const TopBar = ({ onMenuClick, isMenuOpen = false, activeSectionLabel }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { auth, logout, updateAuth } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("profile");
  const [profilePreferences, setProfilePreferences] = useState(() => loadProfilePreferences(auth?.username));
  const [now, setNow] = useState(() => new Date());
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const userBtnRef = useRef(null);

  const role = auth?.role?.toUpperCase() || "STUDENT";
  const dashboardPath = role === "ADMIN" ? "/admin" : role === "MAINTENANCE" ? "/maintenance" : "/student";
  const sectionLabel = activeSectionLabel || "Overview";
  const todayLabel = useMemo(
    () => now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    [now]
  );
  const timeLabel = useMemo(
    () => now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markRead,
    markAllRead,
  } = useNotifications(Boolean(auth?.accessToken));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduceMotion = readReduceMotionPreference();
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }

    };

    const handleDashboardNavigate = (event) => {
      if (event.detail?.id === "notifications") setShowNotifications(true);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("dashboard:navigate", handleDashboardNavigate);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("dashboard:navigate", handleDashboardNavigate);
    };
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    window.location.href = "/";
  };

  const openProfileModal = (tab = "profile") => {
    setShowUserMenu(false);
    setProfileModalTab(tab);
    setShowProfileModal(true);
  };

  const saveProfile = async ({ fullName, avatarType, avatarPreset, avatarImage }) => {
    const normalizedName = (fullName || "").trim();
    if (!normalizedName) throw new Error("Full name is required.");

    if (normalizedName !== auth?.fullName) {
      await userService.updateMyProfile({ fullName: normalizedName });
      updateAuth?.({ fullName: normalizedName });
    }

    const nextPreferences = { avatarType, avatarPreset, avatarImage };
    saveProfilePreferences(auth?.username, nextPreferences);
    setProfilePreferences(nextPreferences);
  };

  const openNotificationLink = (rawUrl) => {
    if (!rawUrl) return;
    if (/^https?:\/\//i.test(rawUrl)) {
      window.location.href = rawUrl;
      return;
    }

    const ticketMatch = rawUrl.match(/^\/tickets\/(\d+)/i);
    if (ticketMatch) {
      const section = role === "MAINTENANCE" ? "work-queue" : "tickets";
      navigate(dashboardPath);
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: section } }));
      }, 120);
      return;
    }

    navigate(rawUrl);
  };

  const openNotification = async (notification) => {
    if (!notification) return;
    try {
      if (!notification.read) await markRead(notification.id);
    } catch {
      // Ignore and continue navigation.
    }
    setShowNotifications(false);
    openNotificationLink(notification.linkUrl);
  };

  return (
    <>
      <header className="command-topbar sticky top-0 z-40">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-controls="dashboard-sidebar"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="interactive-control rounded-xl border border-gray-200/80 bg-white/80 p-2 text-gray-600 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-gray-300 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                {titleCase(role.toLowerCase())}
              </p>
              <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">{sectionLabel}</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-1.5 sm:w-auto sm:shrink-0 sm:flex-nowrap sm:justify-end sm:gap-2">
            <div className="dashboard-topbar-chip hidden items-center gap-2 lg:flex">
              <CalendarDays size={14} className="text-campus-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{todayLabel}</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{timeLabel}</span>
            </div>

            <div className="relative">
              <button
                ref={bellRef}
                type="button"
                onClick={() => setShowNotifications((current) => !current)}
                className="dashboard-topbar-btn interactive-control relative rounded-xl border border-gray-200/80 bg-white/80 p-2 text-gray-600 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-gray-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div ref={dropdownRef}>
                  <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={notificationsLoading}
                    error={notificationsError}
                    onOpenNotification={openNotification}
                    onMarkAllRead={markAllRead}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              )}
            </div>

            <ThemeToggle
              isDark={theme === "dark"}
              onToggle={() => toggleTheme()}
              className="dashboard-topbar-btn interactive-control"
            />

            <div className="relative">
              <button
                ref={userBtnRef}
                type="button"
                onClick={() => setShowUserMenu((current) => !current)}
                className="dashboard-user-trigger interactive-control flex max-w-[calc(100vw-8.75rem)] items-center gap-2 rounded-xl border border-gray-200/80 bg-white/80 py-1.5 pl-1.5 pr-2 text-left dark:border-slate-700/80 dark:bg-slate-900/80 sm:max-w-none sm:pr-2.5"
              >
                <UserAvatar
                  fullName={auth?.fullName}
                  username={auth?.username}
                  avatarType={profilePreferences.avatarType}
                  avatarPreset={profilePreferences.avatarPreset}
                  avatarImage={profilePreferences.avatarImage}
                  size={32}
                />
                <div className="min-w-0">
                  <p className="max-w-[6.5rem] truncate text-xs font-semibold text-gray-900 dark:text-white sm:max-w-none">
                    {auth?.fullName || auth?.username || "User"}
                  </p>
                  <p className="hidden text-[10px] uppercase tracking-[0.12em] text-campus-600 dark:text-campus-300 sm:block">
                    {titleCase(auth?.role || "student")}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div
                  ref={userMenuRef}
                  className="dashboard-user-menu absolute right-0 top-full mt-2 w-[min(15rem,calc(100vw-1.5rem))] rounded-2xl border border-gray-200 bg-white p-2 shadow-dropdown dark:border-slate-700 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => openProfileModal("profile")}
                    className="interactive-control flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    <User size={15} />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => openProfileModal("settings")}
                    className="interactive-control flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    <Settings size={15} />
                    Settings
                  </button>
                  <div className="my-1 h-px bg-gray-100 dark:bg-slate-700" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="interactive-control flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProfileSettingsModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialTab={profileModalTab}
        auth={auth}
        profilePreferences={profilePreferences}
        onSaveProfile={saveProfile}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </>
  );
};
