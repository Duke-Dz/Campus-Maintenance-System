import {
  ChartNoAxesCombined,
  CircleCheckBig,
  ContactRound,
  LayoutDashboard,
  RadioTower,
  Radar,
  ScanSearch,
  Settings2,
  Ticket,
  TicketPlus,
} from "lucide-react";

export const roleDashboardConfig = {
  STUDENT: {
    roleLabel: "Student Workspace",
    headerVariant: "student",
    density: "comfortable",
    navGroups: [
      {
        label: "Workspace",
        items: [
          { id: "dashboard", label: "Home", icon: LayoutDashboard, hint: "Personal request hub" },
          { id: "report", label: "Report Issue", icon: TicketPlus, hint: "File a new request" },
          { id: "tracker", label: "Current Request", icon: Radar, hint: "Track active work" },
          { id: "tickets", label: "History", icon: Ticket, hint: "Search past requests" },
        ],
      },
    ],
    sectionLabels: {
      dashboard: "Home",
      report: "Report Issue",
      tracker: "Current Request",
      tickets: "Request History",
    },
    primaryAction: { label: "Report Issue", sectionId: "report" },
  },
  MAINTENANCE: {
    roleLabel: "Maintenance Console",
    headerVariant: "maintenance",
    density: "compact",
    navGroups: [
      {
        label: "Shift Console",
        items: [
          { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Shift summary" },
          { id: "work-queue", label: "Focus Queue", icon: ScanSearch, hint: "Priority active work" },
          { id: "resolved", label: "Completed", icon: CircleCheckBig, hint: "Resolved log" },
        ],
      },
    ],
    sectionLabels: {
      dashboard: "Overview",
      "work-queue": "Focus Queue",
      resolved: "Completed",
    },
    primaryAction: { label: "Open Queue", sectionId: "work-queue" },
  },
  ADMIN: {
    roleLabel: "Operations Center",
    headerVariant: "admin",
    density: "compact",
    navGroups: [
      {
        label: "Operations",
        items: [
          { id: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Campus pulse" },
          { id: "tickets", label: "Ticket Ops", icon: Ticket, hint: "Triage and assignments" },
          { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined, hint: "SLA and workload" },
        ],
      },
      {
        label: "Management",
        items: [
          { id: "people", label: "People", icon: ContactRound, hint: "Users and staff" },
          { id: "broadcast", label: "Broadcast", icon: RadioTower, hint: "Messages and schedules" },
          { id: "configuration", label: "Configuration", icon: Settings2, hint: "Buildings and catalog" },
        ],
      },
    ],
    sectionLabels: {
      dashboard: "Overview",
      tickets: "Ticket Ops",
      analytics: "Analytics",
      people: "People",
      broadcast: "Broadcast",
      configuration: "Configuration",
    },
    primaryAction: { label: "Open Ticket Ops", sectionId: "tickets" },
  },
};

export const getRoleDashboardConfig = (role) => roleDashboardConfig[role?.toUpperCase()] || roleDashboardConfig.STUDENT;
