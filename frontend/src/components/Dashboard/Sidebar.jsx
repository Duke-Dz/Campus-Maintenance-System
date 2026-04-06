import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChartNoAxesCombined,
  CircleCheckBig,
  ContactRound,
  FileSpreadsheet,
  HardHat,
  Home,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  RadioTower,
  ScanSearch,
  Settings2,
  Ticket,
  TicketPlus,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { CampusFixLogo } from "../Common/CampusFixLogo";

const navByRole = {
  STUDENT: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Request snapshot" },
    { id: "report", label: "Submit Issue", icon: TicketPlus, hint: "Create a new request" },
    { id: "tracker", label: "Tracker", icon: Radar, hint: "Follow active requests" },
    { id: "tickets", label: "Requests", icon: Ticket, hint: "History and ratings" },
  ],
  ADMIN: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Campus operations pulse" },
    { id: "tickets", label: "Ticket Ops", icon: Ticket, hint: "Triage and assignments" },
    { id: "staff", label: "Staff", icon: HardHat, hint: "Invite maintenance crew" },
    { id: "users", label: "Users", icon: ContactRound, hint: "Directory and access review" },
    { id: "broadcast", label: "Broadcast", icon: RadioTower, hint: "Messages and schedules" },
    { id: "reports", label: "Reports", icon: FileSpreadsheet, hint: "Exports and record packs" },
    { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined, hint: "SLA and workload trends" },
    { id: "configuration", label: "Configuration", icon: Settings2, hint: "Buildings and service catalogs" },
  ],
  MAINTENANCE: [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Shift summary" },
    { id: "work-queue", label: "Focus Queue", icon: ScanSearch, hint: "Priority active tasks" },
    { id: "resolved", label: "Completed", icon: CircleCheckBig, hint: "Resolved requests" },
  ],
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
        data-dashboard-nav-id={item.id}
        className={`nav-item overflow-hidden ${collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"} ${active ? "nav-item-active" : ""}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="nav-item-icon">
            <Icon size={17} />
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold">{item.label}</span>
              <span className="block truncate text-[9px] font-medium uppercase tracking-[0.1em] text-gray-400 dark:text-slate-500">
                {item.hint}
              </span>
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
  const touchStartRef = useRef(null);
  const role = auth?.role?.toUpperCase() || "STUDENT";
  const navItems = sectionForRole(role);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartRef.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartRef.current;
    touchStartRef.current = null;
    if (deltaX < -60) onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        id="dashboard-sidebar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`dashboard-sidebar glass-sidebar fixed left-0 top-0 z-50 flex h-screen w-[min(90vw,var(--sidebar-width))] max-w-[320px] flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-w-none lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-sidebar-collapsed" : "lg:w-sidebar"}`}
      >
        <div className={`dashboard-brand-panel ${collapsed ? "px-2.5" : "px-4"} py-4`}>
          <div className={`flex items-start ${collapsed ? "justify-center" : "justify-between"} gap-3`}>
            <Link to="/" className="no-underline">
              <CampusFixLogo collapsed={collapsed} />
            </Link>

            {!collapsed && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.location.assign("/")}
                  className="interactive-control hidden h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white/80 text-gray-500 transition hover:text-campus-600 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-gray-400 dark:hover:text-campus-300 lg:inline-flex"
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

        </div>

        {collapsed && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="nav-item justify-center px-0 py-2.5"
              title="Home"
            >
              <span className="nav-item-icon">
                <Home size={17} />
              </span>
            </button>
          </div>
        )}

        <nav className={`flex-1 min-h-0 space-y-1.5 overflow-y-auto ${collapsed ? "px-2" : "px-3"} pb-4`}>
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400">
              Workspace
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

        <div className={`border-t border-gray-200/70 pt-3 dark:border-slate-700/60 ${collapsed ? "px-2 pb-3" : "px-3 pb-3"}`}>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={`nav-item nav-item-danger ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2.5"}`}
          >
            <span className="nav-item-icon">
              <LogOut size={17} />
            </span>
            {!collapsed && <span className="text-sm font-semibold">Sign Out</span>}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`mt-2 hidden nav-item lg:flex ${collapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2.5"}`}
          >
            <span className="nav-item-icon">
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </span>
            {!collapsed && <span className="text-sm font-semibold">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
