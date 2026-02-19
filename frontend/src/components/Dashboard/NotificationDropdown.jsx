import {
    Bell,
    AlertCircle,
    ClipboardCheck,
    CheckCircle2,
    Wrench,
    UserCheck,
    X,
} from "lucide-react";

const notifications = [
    {
        id: 1,
        icon: ClipboardCheck,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        title: "Ticket #42 Submitted",
        description: "A new electrical issue was reported in Block A, Room 204.",
        date: "Today, 2:30 PM",
        isNew: true,
    },
    {
        id: 2,
        icon: UserCheck,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        title: "Auto-Assigned to Mike",
        description: "Ticket #40 (plumbing) was automatically assigned based on workload.",
        date: "Today, 11:15 AM",
        isNew: true,
    },
    {
        id: 3,
        icon: AlertCircle,
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        title: "SLA At Risk",
        description: "Ticket #38 (HIGH urgency) has 2 hours remaining before SLA breach.",
        date: "Today, 9:00 AM",
        isNew: true,
    },
    {
        id: 4,
        icon: Wrench,
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        title: "Ticket #35 Resolved",
        description: "HVAC issue in Library resolved by John. Before/after photos uploaded.",
        date: "Yesterday, 5:00 PM",
        isNew: false,
    },
    {
        id: 5,
        icon: Bell,
        iconBg: "bg-gray-100 dark:bg-gray-800",
        iconColor: "text-gray-600 dark:text-gray-400",
        title: "Admin Announcement",
        description: "Scheduled water shutdown in Block C on Feb 22, 6 AM – 10 AM.",
        date: "Feb 18, 2026",
        isNew: false,
    },
];

export const NotificationDropdown = ({ onClose }) => {
    return (
        <div className="animate-slide-in-down absolute right-0 top-full mt-2 w-[380px] overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-dropdown dark:border-slate-700/50 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                    <span className="pill-badge bg-ember/10 text-ember">
                        3 New
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Notification list */}
            <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                        <div
                            key={n.id}
                            className={`flex gap-3.5 border-b border-gray-50 px-5 py-4 transition-colors hover:bg-gray-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${n.isNew ? "bg-campus-50/40 dark:bg-campus-900/5" : ""
                                }`}
                        >
                            <div
                                className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${n.iconBg}`}
                            >
                                <Icon size={18} className={n.iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {n.title}
                                    </p>
                                    {n.isNew && (
                                        <span className="mt-0.5 flex-shrink-0 rounded-full bg-campus-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                            New
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                    {n.description}
                                </p>
                                <div className="mt-1.5 flex items-center gap-3">
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                        {n.date}
                                    </span>
                                    <button className="text-[11px] font-semibold text-campus-500 hover:text-campus-600 transition-colors">
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-gray-100 px-5 py-3 dark:border-slate-700/50">
                <button
                    className="flex-1 rounded-xl bg-campus-50 px-4 py-2.5 text-sm font-semibold text-campus-600 transition-all duration-200 hover:bg-campus-100 dark:bg-campus-900/20 dark:text-campus-400 dark:hover:bg-campus-900/30"
                >
                    Mark All Read
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
