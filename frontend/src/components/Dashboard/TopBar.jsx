import { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, Menu, ChevronRight, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { titleCase } from "../../utils/helpers";
import { NotificationDropdown } from "./NotificationDropdown";

const roleTitles = {
    ADMIN: "Admin Panel",
    MAINTENANCE: "Staff Portal",
    STUDENT: "Student Portal",
};

export const TopBar = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { auth, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const userBtnRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                bellRef.current &&
                !bellRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(e.target) &&
                userBtnRef.current &&
                !userBtnRef.current.contains(e.target)
            ) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = 3;
    const role = auth?.role?.toUpperCase() || "STUDENT";
    const pageTitle = roleTitles[role] || "Dashboard";

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Mobile menu + Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="hidden items-center gap-2 text-sm text-gray-400 sm:flex">
                        <span className="font-medium text-gray-900 dark:text-white">{pageTitle}</span>
                        <ChevronRight size={14} />
                        <span className="text-gray-400 dark:text-gray-500">Overview</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Notification bell */}
                    <div className="relative">
                        <button
                            ref={bellRef}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div ref={dropdownRef}>
                                <NotificationDropdown
                                    onClose={() => setShowNotifications(false)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                    >
                        {theme === "dark" ? (
                            <Sun size={20} className="text-gold" />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>

                    {/* Separator */}
                    <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-slate-700" />

                    {/* User Profile + Dropdown */}
                    <div className="relative">
                        <button
                            ref={userBtnRef}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 rounded-xl p-1.5 pr-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-campus-400 to-campus-600 text-sm font-bold text-white shadow-sm">
                                {(auth?.fullName || auth?.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                                    {auth?.fullName || auth?.username || "User"}
                                </p>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-campus-500">
                                    {titleCase(auth?.role || "student")}
                                </p>
                            </div>
                            <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div
                                ref={userMenuRef}
                                className="absolute right-0 top-full mt-2 w-64 origin-top-right animate-scale-in rounded-2xl border border-gray-200 bg-white p-2 shadow-dropdown dark:border-slate-700 dark:bg-slate-900"
                            >
                                {/* User info header */}
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-campus-400 to-campus-600 text-sm font-bold text-white shadow-sm">
                                        {(auth?.fullName || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {auth?.fullName || auth?.username || "User"}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                            {auth?.username || "user"}
                                        </p>
                                    </div>
                                </div>

                                <div className="my-1.5 h-px bg-gray-100 dark:bg-slate-700/60" />

                                {/* Menu items */}
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white">
                                    <User size={16} />
                                    <span>Profile</span>
                                </button>
                                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white">
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>

                                <div className="my-1.5 h-px bg-gray-100 dark:bg-slate-700/60" />

                                {/* Sign Out */}
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-all duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
