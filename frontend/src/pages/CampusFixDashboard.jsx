import { useState } from "react";
import {
    ArrowUp,
    CheckCircle2,
    Copy,
    CreditCard,
    ExternalLink,
    Link2,
    Radio,
    Send,
    TrendingUp,
    Users,
    Wallet,
    Zap,
    Heart,
    Check,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/* ------------------------------------------------------------------ */
/*  Welcome Banner                                                     */
/* ------------------------------------------------------------------ */
const WelcomeBanner = ({ username }) => {
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const emoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

    return (
        <div className="saas-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xl font-bold text-white shadow-lg shadow-mint/20">
                        {(username || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-mint dark:border-surface-dark" />
                </div>

                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {emoji} {greeting}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {username || "Admin User"}
                    </h2>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="pill-badge bg-brand-50 text-mint dark:bg-brand-700/20 dark:text-brand-300">
                            <CheckCircle2 size={12} />
                            Business Status: Verified
                        </span>
                    </div>
                </div>
            </div>

            <button className="btn-danger">
                <Zap size={16} />
                Submit KYC
            </button>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Balance Card                                                       */
/* ------------------------------------------------------------------ */
const BalanceCard = () => (
    <div className="saas-card relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-mint/20 to-transparent blur-2xl" />

        <div className="relative">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-700/20">
                    <Wallet size={16} className="text-mint" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Service Tokens
                </h3>
            </div>

            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Available Balance</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                KES <span className="tabular-nums">0.00</span>
            </p>

            <button className="btn-primary mt-5 w-full">
                <ArrowUp size={16} />
                Top Up Tokens
            </button>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Quick Actions Grid                                                 */
/* ------------------------------------------------------------------ */
const quickActions = [
    {
        label: "Payment Channels",
        icon: Radio,
        bg: "bg-blue-100 dark:bg-blue-900/30",
        color: "text-blue-600 dark:text-blue-400",
    },
    {
        label: "Send STK Push",
        icon: Send,
        bg: "bg-purple-100 dark:bg-purple-900/30",
        color: "text-purple-600 dark:text-purple-400",
    },
    {
        label: "Create Link",
        icon: Link2,
        bg: "bg-amber-100 dark:bg-amber-900/30",
        color: "text-amber-600 dark:text-amber-400",
    },
    {
        label: "Fundraiser",
        icon: Heart,
        bg: "bg-rose-100 dark:bg-rose-900/30",
        color: "text-rose-600 dark:text-rose-400",
    },
];

const QuickActions = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((action) => {
            const Icon = action.icon;
            return (
                <button
                    key={action.label}
                    className="saas-card group flex flex-col items-center gap-3 py-6 text-center hover:shadow-card-hover"
                >
                    <div className={`icon-wrap ${action.bg}`}>
                        <Icon size={22} className={action.color} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {action.label}
                    </span>
                </button>
            );
        })}
    </div>
);

/* ------------------------------------------------------------------ */
/*  Lipwa Link Copier                                                  */
/* ------------------------------------------------------------------ */
const LipwaLink = () => {
    const [copied, setCopied] = useState(false);
    const url = "https://lipwa.app/payhero-demo";

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // fallback
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="saas-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Lipwa Link
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Share this link with your customers to receive payments.
                    </p>
                </div>
                <span className="pill-badge bg-brand-50 text-mint dark:bg-brand-700/20 dark:text-brand-300">
                    <CheckCircle2 size={12} />
                    ACTIVE
                </span>
            </div>

            <div className="mt-4 flex">
                <input
                    readOnly
                    value={url}
                    className="flex-1 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300"
                />
                <button
                    onClick={onCopy}
                    className={`flex items-center gap-2 rounded-r-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${copied
                            ? "bg-brand-600"
                            : "bg-mint hover:bg-brand-600"
                        }`}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Statistics Grid                                                    */
/* ------------------------------------------------------------------ */
const stats = [
    {
        label: "Payments",
        value: "0",
        icon: CreditCard,
        bg: "bg-blue-100 dark:bg-blue-900/30",
        color: "text-blue-600 dark:text-blue-400",
        trend: "+0%",
    },
    {
        label: "Customers",
        value: "0",
        icon: Users,
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        color: "text-emerald-600 dark:text-emerald-400",
        trend: "+0%",
    },
    {
        label: "Channels",
        value: "0",
        icon: Radio,
        bg: "bg-purple-100 dark:bg-purple-900/30",
        color: "text-purple-600 dark:text-purple-400",
        trend: "+0%",
    },
    {
        label: "Transactions",
        value: "0",
        icon: TrendingUp,
        bg: "bg-amber-100 dark:bg-amber-900/30",
        color: "text-amber-600 dark:text-amber-400",
        trend: "+0%",
    },
];

const StatsGrid = () => (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
            const Icon = stat.icon;
            return (
                <div key={stat.label} className="saas-card group">
                    <div className="flex items-center justify-between">
                        <div className={`icon-wrap ${stat.bg}`}>
                            <Icon size={20} className={stat.color} />
                        </div>
                        <span className="pill-badge bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                            {stat.trend}
                        </span>
                    </div>
                    <p className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
            );
        })}
    </div>
);

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                */
/* ------------------------------------------------------------------ */
export const PayHeroDashboard = () => {
    const { auth } = useAuth();
    const username = auth?.fullName || auth?.username || "Admin User";

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <WelcomeBanner username={username} />

            {/* Balance + Quick Actions row */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <BalanceCard />
                </div>
                <div className="lg:col-span-2">
                    <QuickActions />
                </div>
            </div>

            {/* Lipwa Link */}
            <LipwaLink />

            {/* Statistics Grid */}
            <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    General Statistics
                </h3>
                <StatsGrid />
            </div>
        </div>
    );
};
