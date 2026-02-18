export const ROLES = {
  STUDENT: "STUDENT",
  MAINTENANCE: "MAINTENANCE",
  ADMIN: "ADMIN",
};

export const STATUSES = [
  "SUBMITTED",
  "APPROVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

export const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "CLEANING",
  "IT",
  "FURNITURE",
  "STRUCTURAL",
  "SAFETY",
  "OTHER",
];

export const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const STATUS_COLORS = {
  SUBMITTED: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  APPROVED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  ASSIGNED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  CLOSED: "bg-mint/20 text-mint dark:bg-mint/20 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export const URGENCY_COLORS = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200",
};
