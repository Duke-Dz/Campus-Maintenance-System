import { useState } from "react";
import {
    LayoutDashboard,
    ClipboardPlus,
    ClipboardList,
    Bell as BellIcon,
    Settings,
    ChevronDown,
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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/* ------------------------------------------------------------------ */
/*  Role-based navigation config                                       */
/* ------------------------------------------------------------------ */
const studentNav = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Report Issue", icon: ClipboardPlus },
    {
        label: "My Tickets",
        icon: ClipboardList,
        children: [
            { label: "Active", icon: Clock },
            { label: "Resolved", icon: CheckCircle2 },
        ],
    },
    { label: "Notifications", icon: BellIcon },
    { label: "Settings", icon: Settings, children: [{ label: "Profile", icon: User }] },
];

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    {
        label: "Tickets",
        icon: ClipboardList,
        children: [
            { label: "All Tickets", icon: ClipboardList },
            { label: "Pending Review", icon: Clock },
            { label: "Assigned", icon: Wrench },
            { label: "Resolved", icon: CheckCircle2 },
        ],
    },
    {
        label: "Users",
        icon: Users,
        children: [
            { label: "All Users", icon: Users },
            { label: "Students", icon: User },
            { label: "Staff", icon: Hammer },
        ],
    },
    {
        label: "Analytics",
        icon: BarChart3,
        children: [
            { label: "Overview", icon: BarChart3 },
            { label: "Buildings", icon: Globe },
            { label: "Crew Performance", icon: Zap },
        ],
    },
    { label: "Assignments", icon: ListTodo },
    {
        label: "Settings",
        icon: Settings,
        children: [
            { label: "General", icon: Settings },
            { label: "SLA Config", icon: Shield },
            { label: "Notifications", icon: BellIcon },
            { label: "Roles", icon: UserCog },
        ],
    },
];

const staffNav = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    {
        label: "My Tasks",
        icon: Hammer,
        children: [
            { label: "Active", icon: Clock },
            { label: "Completed", icon: CheckCircle2 },
        ],
    },
    { label: "Schedule", icon: CalendarDays },
    { label: "Notifications", icon: BellIcon },
    {
        label: "Settings",
        icon: Settings,
        children: [
            { label: "Profile", icon: User },
            { label: "Availability", icon: Wallet },
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
const CampusFixLogo = () => (
    <div className="relative flex h-10 w-10 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-campus-300/50 dark:border-campus-500/30 animate-spin-slow" />
        {/* Inner icon bg */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-campus-500 to-campus-700 shadow-lg">
            <Wrench size={18} className="text-white animate-spin-reverse" style={{ animationDuration: "8s" }} />
        </div>
        {/* Floating satellite icons */}
        <div className="absolute -top-1 -right-1">
            <Zap size={10} className="text-campus-400" />
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/*  NavItem                                                            */
/* ------------------------------------------------------------------ */
const NavItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
        <div>
            <button
                onClick={() => (hasChildren ? setOpen(!open) : null)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
          ${item.active
                        ? "bg-campus-500 text-white shadow-sm shadow-campus-500/25"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                    }
        `}
            >
                <Icon size={20} strokeWidth={item.active ? 2.2 : 1.8} />
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                    <span
                        className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"
                            }`}
                    >
                        <ChevronDown size={16} />
                    </span>
                )}
            </button>

            {/* Accordion sub-menu */}
            {hasChildren && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="ml-2 space-y-0.5 border-l-2 border-gray-200 pl-4 dark:border-slate-700">
                        {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                                <button
                                    key={child.label}
                                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
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
export const Sidebar = ({ isOpen, onClose }) => {
    const { auth } = useAuth();
    const navItems = getNavForRole(auth?.role);

    const roleLabel =
        auth?.role?.toUpperCase() === "ADMIN"
            ? "Administrator"
            : auth?.role?.toUpperCase() === "MAINTENANCE"
                ? "Maintenance Staff"
                : "Student Portal";

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
                className={`glass-sidebar fixed left-0 top-0 z-50 flex h-screen w-sidebar flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-2.5">
                        <CampusFixLogo />
                        <div>
                            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                                Campus<span className="text-campus-500">Fix</span>
                            </span>
                            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                                {roleLabel}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                        Main Menu
                    </p>
                    {navItems.map((item) => (
                        <NavItem key={item.label} item={item} />
                    ))}
                </nav>

                {/* Bottom promo card */}
                <div className="p-4">
                    <div className="rounded-2xl bg-gradient-to-br from-campus-50 to-campus-100 p-4 dark:from-campus-900/20 dark:to-campus-800/10">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                            <Wrench size={20} className="text-campus-500" />
                        </div>
                        <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                            Smart Maintenance
                        </p>
                        <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            Report issues, track progress, and keep your campus running smoothly.
                        </p>
                        <button className="w-full rounded-xl bg-campus-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-campus-600 hover:shadow-glow active:scale-[0.98]">
                            Learn More
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
