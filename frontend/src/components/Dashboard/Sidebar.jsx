import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { CampusFixLogo } from "../Common/CampusFixLogo";

const navByRole = {
  STUDENT: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Snapshot and insights" },
    { id: "tickets", label: "My Tickets", icon: ClipboardList, hint: "Open and resolved issues" },
  ],
  ADMIN: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Operational summary" },
    { id: "analytics", label: "Analytics", icon: Gauge, hint: "SLA and trends" },
    { id: "tickets", label: "Ticket Ops", icon: ClipboardList, hint: "Triage and assignments" },
    { id: "staff", label: "Staff Onboarding", icon: UserCog, hint: "Invite maintenance staff" },
    { id: "users", label: "Manage Users", icon: Users, hint: "Directory and role audit" },
    { id: "broadcast", label: "Broadcast", icon: Megaphone, hint: "Message targeted audiences" },
  ],
  MAINTENANCE: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Workload pulse" },
    { id: "work-queue", label: "Work Queue", icon: Wrench, hint: "Assigned active tasks" },
    { id: "performance", label: "Performance", icon: Activity, hint: "Resolution metrics" },
    { id: "resolved", label: "Resolved", icon: CheckCircle2, hint: "Completed tickets" },
  ],
};

const roleMeta = {
  STUDENT: { label: "Student Portal", tone: "bg-campus-500/10 text-campus-600 dark:text-campus-300" },
  ADMIN: { label: "Admin Command", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  MAINTENANCE: { label: "Field Operations", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
};

const sectionForRole = (role) => navByRole[role?.toUpperCase()] || navByRole.STUDENT;

const NavItem = ({ item, collapsed, active, onSelect }) => {
  const Icon = item.icon;
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => onSelect(item.id, item.label)}
        title={collapsed ? item.label : undefined}
        className={`nav-item ${
          collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
        } ${active ? "nav-item-active" : ""}`}
      >
        <span className="flex items-center gap-3">
          <Icon size={18} />
          {!collapsed && (
            <span className="text-left">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.1em] opacity-65">{item.hint}</span>
            </span>
          )}
        </span>
      </button>

      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {item.label}
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse, activeSection, onSectionChange }) => {
  const { auth, logout } = useAuth();
  const role = auth?.role?.toUpperCase() || "STUDENT";
  const navItems = sectionForRole(role);
  const meta = roleMeta[role] || roleMeta.STUDENT;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={`glass-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-sidebar-collapsed" : "w-sidebar"}`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-5"} py-5`}>
          <Link to="/" className="no-underline">
            <CampusFixLogo collapsed={collapsed} roleLabel={meta.label} roleTone={meta.tone} />
          </Link>

          {!collapsed && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="interactive-control hidden h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-campus-300 lg:inline-flex"
                title="Go to Home"
              >
                <Home size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {collapsed && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="nav-item justify-center px-0 py-2.5"
              title="Home"
            >
              <Home size={18} />
            </button>
          </div>
        )}

        <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} pb-4`}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              Command Modules
            </p>
          )}
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeSection === item.id}
              onSelect={onSectionChange}
            />
          ))}
        </nav>

        <div className={`border-t border-gray-200/70 dark:border-slate-700/60 ${collapsed ? "p-2" : "p-3"}`}>
          {!collapsed && (
            <div className="mb-2 rounded-xl border border-campus-100 bg-campus-50/70 px-3 py-2 dark:border-campus-900/40 dark:bg-campus-900/20">
              <p className="text-[11px] font-semibold text-campus-700 dark:text-campus-300">System Status</p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-campus-600 dark:text-campus-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live telemetry enabled
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={`nav-item nav-item-danger ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2.5"}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-semibold">Sign Out</span>}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-2 hidden nav-item lg:flex ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2.5"}`}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span className="text-sm font-semibold">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
