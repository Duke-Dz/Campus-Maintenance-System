import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardPlus,
    ClipboardList,
    Bell as BellIcon,
    Settings,
    ChevronDown,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Users,
    BarChart3,
    Shield,
    UserCog,
    Wallet,
    Wrench,
    Hammer,
    Globe,
    X,
    Zap,
    CheckCircle2,
    Clock,
    ListTodo,
    CalendarDays,
    User,
    LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/* ------------------------------------------------------------------ */
/*  Role-based navigation config                                       */
/* ------------------------------------------------------------------ */
const studentNav = [
    { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { label: "Report Issue", icon: ClipboardPlus, id: "report" },
    {
        label: "My Tickets",
        icon: ClipboardList,
        children: [
            { label: "Active", icon: Clock, id: "tickets-active" },
            { label: "Resolved", icon: CheckCircle2, id: "tickets-resolved" },
        ],
    },
    { label: "Notifications", icon: BellIcon, id: "notifications" },
    { label: "Settings", icon: Settings, children: [{ label: "Profile", icon: User, id: "profile" }] },
];

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    {
        label: "Tickets",
        icon: ClipboardList,
        children: [
            { label: "All Tickets", icon: ClipboardList, id: "tickets" },
            { label: "Pending Review", icon: Clock, id: "tickets-pending" },
            { label: "Assigned", icon: Wrench, id: "tickets-assigned" },
            { label: "Resolved", icon: CheckCircle2, id: "tickets-resolved" },
        ],
    },
    {
        label: "Users",
        icon: Users,
        children: [
            { label: "All Users", icon: Users, id: "users" },
            { label: "Students", icon: User, id: "users-students" },
            { label: "Staff", icon: Hammer, id: "users-staff" },
        ],
    },
    {
        label: "Analytics",
        icon: BarChart3,
        children: [
            { label: "Overview", icon: BarChart3, id: "analytics" },
            { label: "Buildings", icon: Globe, id: "analytics-buildings" },
            { label: "Crew Performance", icon: Zap, id: "analytics-crew" },
        ],
    },
    { label: "Assignments", icon: ListTodo, id: "assignments" },
    {
        label: "Settings",
        icon: Settings,
        children: [
            { label: "General", icon: Settings, id: "settings-general" },
            { label: "SLA Config", icon: Shield, id: "settings-sla" },
            { label: "Notifications", icon: BellIcon, id: "settings-notifications" },
            { label: "Roles", icon: UserCog, id: "settings-roles" },
        ],
    },
];

const staffNav = [
    { label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    {
        label: "My Tasks",
        icon: Hammer,
        children: [
            { label: "Active", icon: Clock, id: "tasks-active" },
            { label: "Completed", icon: CheckCircle2, id: "tasks-completed" },
        ],
    },
    { label: "Schedule", icon: CalendarDays, id: "schedule" },
    { label: "Notifications", icon: BellIcon, id: "notifications" },
    {
        label: "Settings",
        icon: Settings,
        children: [
            { label: "Profile", icon: User, id: "profile" },
            { label: "Availability", icon: Wallet, id: "availability" },
        ],
    },
];

const getNavForRole = (role) => {
    switch (role?.toUpperCase()) {
        case "ADMIN":
            return adminNav;
        case "MAINTENANCE":
            return staffNav;
        default:
            return studentNav;
    }
};

/* ------------------------------------------------------------------ */
/*  Rotating Tools Logo                                                */
/* ------------------------------------------------------------------ */
const CampusFixLogo = ({ collapsed }) => (
    <div className="relative flex h-10 w-10 items-center justify-center flex-shrink-0">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-campus-300/50 dark:border-campus-500/30 animate-spin-slow" />
        {/* Inner icon bg */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-campus-500 to-campus-700 shadow-lg">
            <Wrench size={18} className="text-white animate-spin-reverse" style={{ animationDuration: "8s" }} />
        </div>
        {/* Floating satellite */}
        {!collapsed && (
            <div className="absolute -top-1 -right-1">
                <Zap size={10} className="text-campus-400" />
            </div>
        )}
    </div>
);

/* ------------------------------------------------------------------ */
/*  NavItem                                                            */
/* ------------------------------------------------------------------ */
const NavItem = ({ item, collapsed, activeId, onSelect }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const isActive = item.id && item.id === activeId;

    const handleClick = () => {
        if (hasChildren) {
            if (collapsed) return; // Don't expand in collapsed mode
            setOpen(!open);
        } else if (item.id && onSelect) {
            onSelect(item.id);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={handleClick}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center rounded-xl text-sm font-medium transition-all duration-200
                    ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                    ${isActive
                        ? "bg-campus-500 text-white shadow-sm shadow-campus-500/25"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                    }
                `}
            >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!collapsed && hasChildren && (
                    <span
                        className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                    >
                        <ChevronDown size={16} />
                    </span>
                )}
            </button>

            {/* Collapsed tooltip */}
            {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap dark:bg-slate-700">
                        {item.label}
                    </div>
                </div>
            )}

            {/* Accordion sub-menu (expanded only) */}
            {!collapsed && hasChildren && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="ml-2 space-y-0.5 border-l-2 border-gray-200 pl-4 dark:border-slate-700">
                        {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = child.id && child.id === activeId;
                            return (
                                <button
                                    key={child.label}
                                    onClick={() => child.id && onSelect?.(child.id)}
                                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150
                                        ${childActive
                                            ? "bg-campus-100 text-campus-700 font-semibold dark:bg-campus-900/30 dark:text-campus-400"
                                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                                        }
                                    `}
                                >
                                    <ChildIcon size={16} strokeWidth={1.8} />
                                    <span>{child.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */
export const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse, activeSection, onSectionChange }) => {
    const { auth, logout } = useAuth();
    const navItems = getNavForRole(auth?.role);

    const roleLabel =
        auth?.role?.toUpperCase() === "ADMIN"
            ? "Administrator"
            : auth?.role?.toUpperCase() === "MAINTENANCE"
                ? "Maintenance Staff"
                : "Student Portal";

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`glass-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    ${collapsed ? "w-sidebar-collapsed" : "w-sidebar"}
                `}
            >
                {/* Logo */}
                <div className={`flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-6"} py-5`}>
                    <Link to="/" className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-80">
                        <CampusFixLogo collapsed={collapsed} />
                        {!collapsed && (
                            <div className="transition-opacity duration-200">
                                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                                    Campus<span className="text-campus-500">Fix</span>
                                </span>
                                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                                    {roleLabel}
                                </p>
                            </div>
                        )}
                    </Link>
                    {!collapsed && (
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 space-y-1 overflow-y-auto py-2 ${collapsed ? "px-2" : "px-4"}`}>
                    {!collapsed && (
                        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                            Main Menu
                        </p>
                    )}
                    {navItems.map((item) => (
                        <NavItem
                            key={item.label}
                            item={item}
                            collapsed={collapsed}
                            activeId={activeSection}
                            onSelect={onSectionChange}
                        />
                    ))}
                </nav>

                {/* Bottom section */}
                <div className={`border-t border-gray-200/60 dark:border-slate-700/50 ${collapsed ? "p-2" : "p-4"}`}>
                    {/* Logout button */}
                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Sign Out" : undefined}
                        className={`flex w-full items-center rounded-xl text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20
                            ${collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}
                        `}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>

                    {/* Collapse toggle (desktop only) */}
                    <button
                        onClick={onToggleCollapse}
                        className={`mt-2 hidden lg:flex w-full items-center rounded-xl text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300
                            ${collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}
                        `}
                    >
                        {collapsed ? <ChevronRightIcon size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
                    </button>
                </div>
            </aside>
        </>
    );
};
