import { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, Menu, ChevronRight } from "lucide-react";
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
    const { auth } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);

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
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = 3;
    const role = auth?.role?.toUpperCase() || "STUDENT";
    const pageTitle = roleTitles[role] || "Dashboard";

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

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-campus-400 to-campus-600 text-sm font-bold text-white shadow-sm">
                            {(auth?.fullName || auth?.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                                {auth?.fullName || auth?.username || "User"}
                            </p>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-campus-500">
                                {titleCase(auth?.role || "student")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
