import {
  AlertCircle,
  Bell,
  ClipboardCheck,
  MessageCircle,
  Megaphone,
  UserCheck,
  X,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";

const typeConfig = {
  TICKET_UPDATE: {
    icon: ClipboardCheck,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  ASSIGNMENT: {
    icon: UserCheck,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  SLA_BREACH: {
    icon: AlertCircle,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  COMMENT: {
    icon: MessageCircle,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  CHAT: {
    icon: MessageCircle,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  ANNOUNCEMENT: {
    icon: Megaphone,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
};

const configFor = (type) => typeConfig[type] || typeConfig.TICKET_UPDATE;

export const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  loading = false,
  error = "",
  onClose,
  onOpenNotification,
  onMarkAllRead,
}) => (
  <div className="animate-slide-in-down absolute right-0 top-full mt-2 w-[390px] overflow-hidden rounded-2xl border border-gray-200/70 bg-white/95 shadow-dropdown backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700/60">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <span className="pill-badge bg-ember/10 text-ember">{unreadCount} New</span>
      </div>
      <button
        onClick={onClose}
        className="interactive-control rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
      >
        <X size={16} />
      </button>
    </div>

    <div className="max-h-[360px] overflow-y-auto">
      {loading && (
        <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
      )}
      {!loading && error && (
        <p className="px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {!loading && !error && notifications.length === 0 && (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500">
            <Bell size={18} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
        </div>
      )}

      {!loading &&
        !error &&
        notifications.map((notification) => {
          const config = configFor(notification.type);
          const Icon = config.icon;
          return (
            <button
              type="button"
              key={notification.id}
              onClick={() => onOpenNotification?.(notification)}
              className={`interactive-row flex w-full gap-3.5 border-b border-gray-50 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
                !notification.read ? "bg-campus-50/40 dark:bg-campus-900/5" : ""
              }`}
            >
              <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
                <Icon size={18} className={config.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                  {!notification.read && (
                    <span className="mt-0.5 flex-shrink-0 rounded-full bg-campus-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{notification.message}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">{formatDate(notification.createdAt)}</span>
                  {notification.linkUrl && (
                    <span className="text-[11px] font-semibold text-campus-500">Open</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
    </div>

    <div className="flex gap-2 border-t border-gray-100 px-5 py-3 dark:border-slate-700/50">
      <button
        onClick={onMarkAllRead}
        className="interactive-control flex-1 rounded-xl bg-campus-50 px-4 py-2.5 text-sm font-semibold text-campus-600 transition-all duration-200 hover:bg-campus-100 dark:bg-campus-900/20 dark:text-campus-400 dark:hover:bg-campus-900/30"
      >
        Mark All Read
      </button>
      <button
        onClick={onClose}
        className="interactive-control flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
      >
        Close
      </button>
    </div>
  </div>
);
