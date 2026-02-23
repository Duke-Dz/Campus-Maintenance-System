import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { userService } from "../../services/userService";
import { titleCase } from "../../utils/helpers";
import {
  loadProfilePreferences,
  saveProfilePreferences,
} from "../../utils/profilePreferences";
import { UserAvatar } from "../Common/UserAvatar";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

const REDUCE_MOTION_KEY = "campusfix-reduce-motion";

const roleTitles = {
  ADMIN: "Operations Command",
  MAINTENANCE: "Field Operations",
  STUDENT: "Student Command",
};

const readReduceMotionPreference = () => {
  try {
    return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
  } catch {
    return false;
  }
};

export const TopBar = ({ onMenuClick, activeSectionLabel }) => {
  const { theme, toggleTheme } = useTheme();
  const { auth, logout, updateAuth } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("profile");
  const [profilePreferences, setProfilePreferences] = useState(() =>
    loadProfilePreferences(auth?.username)
  );
  const [now, setNow] = useState(() => new Date());
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const userBtnRef = useRef(null);
  const searchBtnRef = useRef(null);
  const searchRef = useRef(null);

  const role = auth?.role?.toUpperCase() || "STUDENT";
  const roleTitle = roleTitles[role] || "Command Center";
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
  } = useNotifications(Boolean(auth?.token));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const reduceMotion = readReduceMotionPreference();
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchBtnRef.current &&
        !searchBtnRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }
    };

    const handleDashboardNavigate = (event) => {
      if (event.detail?.id === "notifications") {
        setShowNotifications(true);
      }
    };

    const handleKeyboardShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyboardShortcut);
    window.addEventListener("dashboard:navigate", handleDashboardNavigate);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyboardShortcut);
      window.removeEventListener("dashboard:navigate", handleDashboardNavigate);
    };
  }, []);

  useEffect(() => {
    if (!showSearch) return;
    const timer = window.setTimeout(() => {
      const input = searchRef.current?.querySelector("input");
      input?.focus();
    }, 10);
    return () => window.clearTimeout(timer);
  }, [showSearch]);

  const runSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;

    window.dispatchEvent(
      new CustomEvent("dashboard:search", {
        detail: { query },
      })
    );

    setShowSearch(false);
  };

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
    if (!normalizedName) {
      throw new Error("Full name is required.");
    }

    if (normalizedName !== auth?.fullName) {
      await userService.updateMyProfile({ fullName: normalizedName });
      updateAuth?.({ fullName: normalizedName });
    }

    const nextPreferences = {
      avatarType,
      avatarPreset,
      avatarImage,
    };
    saveProfilePreferences(auth?.username, nextPreferences);
    setProfilePreferences(nextPreferences);
  };

  const openNotification = async (notification) => {
    if (!notification) return;
    try {
      if (!notification.read) {
        await markRead(notification.id);
      }
    } catch {
      // ignore and continue navigation
    }
    setShowNotifications(false);
    if (notification.linkUrl) {
      window.location.href = notification.linkUrl;
    }
  };

  return (
    <>
      <header className="command-topbar sticky top-0 z-30 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="interactive-control rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-campus-500">{roleTitle}</p>
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{sectionLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/85 xl:flex">
              <CalendarDays size={14} className="text-campus-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{todayLabel}</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{timeLabel}</span>
            </div>

            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="interactive-control rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
              title="Go to Home"
            >
              <Home size={18} />
            </button>

            <div className="relative">
              <button
                ref={searchBtnRef}
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className="interactive-control rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
                title="Search"
              >
                <Search size={18} />
              </button>

              {showSearch && (
                <div
                  ref={searchRef}
                  className="animate-slide-in-down absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-dropdown dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                    <Search size={15} className="text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          runSearch();
                        }
                      }}
                      placeholder="Search tickets, users, buildings..."
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                    Press Enter to apply dashboard search. Shortcut: Ctrl/Cmd + K
                  </p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                ref={bellRef}
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="interactive-control relative rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
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

            <button
              type="button"
              onClick={toggleTheme}
              className="interactive-control rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} className="text-gold" /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                ref={userBtnRef}
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="interactive-control flex items-center gap-2 rounded-xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-2.5 text-left dark:border-slate-700 dark:bg-slate-900"
              >
                <UserAvatar
                  fullName={auth?.fullName}
                  username={auth?.username}
                  avatarType={profilePreferences.avatarType}
                  avatarPreset={profilePreferences.avatarPreset}
                  avatarImage={profilePreferences.avatarImage}
                  size={32}
                />
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{auth?.fullName || auth?.username || "User"}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-campus-500">{titleCase(auth?.role || "student")}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-dropdown dark:border-slate-700 dark:bg-slate-900"
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
