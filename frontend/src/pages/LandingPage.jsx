import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { publicAnalyticsService } from "../services/publicAnalyticsService";
import {
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardPlus,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  LifeBuoy,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  PhoneCall,
  Shield,
  Sparkles,
  Sun,
  Timer,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "#about" },
  { label: "Community", href: "#community" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    icon: ClipboardPlus,
    title: "Smart Ticketing",
    desc: "Report issues with photos, location, and clear categories so staff can act quickly.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Zap,
    title: "Auto Assignment",
    desc: "Work is routed to available technicians based on urgency and current workload.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: BarChart3,
    title: "Live Metrics",
    desc: "Track resolved issues and queue pressure with auto-refreshing analytics cards.",
    color: "from-emerald-500 to-green-400",
  },
  {
    icon: Bell,
    title: "Status Alerts",
    desc: "Students and teams receive updates when tickets move from report to resolution.",
    color: "from-violet-500 to-fuchsia-400",
  },
  {
    icon: Shield,
    title: "SLA Visibility",
    desc: "Resolution timelines stay visible to admins with breach awareness built in.",
    color: "from-rose-500 to-pink-400",
  },
  {
    icon: MessageSquare,
    title: "In-App Collaboration",
    desc: "Built-in ticket communication reduces unclear hand-offs and manual follow-ups.",
    color: "from-indigo-500 to-blue-400",
  },
  {
    icon: Sparkles,
    title: "Duplicate Detection",
    desc: "Related tickets are flagged early so teams can merge effort and fix root causes.",
    color: "from-teal-500 to-cyan-400",
  },
  {
    icon: Users,
    title: "Mobile-First UI",
    desc: "Responsive interface with phone navigation toggle and desktop productivity layout.",
    color: "from-slate-500 to-gray-400",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Report",
    desc: "Students submit issue details in under a minute.",
    icon: ClipboardPlus,
    color: "text-blue-500",
  },
  {
    num: "02",
    title: "Auto-Route",
    desc: "The system automatically routes work to the best crew member; admins only step in when auto-routing fails.",
    icon: Timer,
    color: "text-amber-500",
  },
  {
    num: "03",
    title: "Resolve",
    desc: "Maintenance staff resolves the problems,updates status and closes the loop with proof.",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
];

const FAQS = [
  {
    question: "How do I submit a maintenance issue?",
    answer:
      "Open your dashboard, choose Submit Ticket, and include location, category, urgency, and a clear description.",
  },
  {
    question: "Can I track my request after submission?",
    answer:
      "Yes. Every ticket has a status timeline so you can follow approval, assignment, work-in-progress, and resolution updates.",
  },
  {
    question: "What happens if the same issue is reported by many students?",
    answer:
      "CampusFix detects likely duplicates and helps teams consolidate activity around one actionable maintenance task.",
  },
  {
    question: "Who can access analytics dashboards?",
    answer:
      "Role-based access controls limit administrative analytics to authorized personnel while students see their own ticket activity.",
  },
  {
    question: "How often are landing page analytics refreshed?",
    answer: "The public landing analytics sync automatically every 20 seconds when backend data is available.",
  },
  {
    question: "Can technicians attach completion evidence?",
    answer:
      "Yes. Maintenance users can upload after-work photos and notes before marking tickets as resolved.",
  },
  {
    question: "How is my personal data handled?",
    answer:
      "Data is used for account management, support operations, and ticket workflows. Only authorized users can access protected records.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the Contact Support page to submit your full name, email, category, subject, and detailed message.",
  },
];

const PRIVACY_POINTS = [
  "What we collect: account details, ticket content, attachments, and operational logs.",
  "Why we collect it: authentication, issue resolution, service reliability, and support operations.",
  "Legal basis: processing is tied to service delivery, security, and legitimate operational needs.",
  "Access controls: only authorized personnel can view protected user and ticket records.",
  "Retention: ticket and account data is kept only as long as required for operations and compliance.",
  "Sharing limits: no sale of personal data; third-party processors are limited to core service functions.",
  "Cross-system transfers: data may be processed in secure infrastructure environments with safeguards.",
  "Security practices: encryption in transit, role-based access, and audit logging are used to reduce risk.",
  "User rights: you can request access, correction, deletion, or export of eligible personal data.",
  "Breach response: security incidents are investigated and communicated under applicable obligations.",
  "Children and sensitive data: users should avoid submitting unnecessary sensitive personal information.",
  "Policy updates: material changes are reflected on this page with an updated effective date.",
];

const TERMS_POINTS = [
  "Account responsibility: keep credentials secure and do not share access tokens.",
  "Eligibility and access: accounts can be restricted, suspended, or removed for policy violations.",
  "Acceptable use: no abuse, false reports, spam, or attempts to disrupt platform operations.",
  "Ticket integrity: submissions must be accurate, lawful, and related to real campus maintenance issues.",
  "User content: by submitting ticket content, you grant rights needed to process and resolve issues.",
  "Platform changes: features and workflows may evolve as the system is improved over time.",
  "Third-party services: integrations may be subject to separate terms from external providers.",
  "Service availability: uptime targets are operational goals, not guaranteed uninterrupted service.",
  "Liability limits: the platform is provided as-is, with liability limited as allowed by law.",
  "Indemnity: misuse that causes legal or operational harm may trigger user responsibility.",
  "Termination: severe or repeated policy violations may result in account termination.",
  "Governing terms updates: continued use after updates constitutes acceptance of revised terms.",
];

const INITIAL_STATS = {
  totalTickets: null,
  resolvedTickets: null,
  openTickets: null,
  resolvedToday: null,
  averageResolutionHours: null,
  resolvedLast7Days: [],
  lastUpdatedAt: null,
};

const INITIAL_PUBLIC_CONFIG = {
  supportHours: "--",
  supportPhone: "--",
  supportTimezone: "Local campus time",
  urgentSlaHours: null,
  standardSlaHours: null,
};

const InstagramIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M16.5 7.5h.01" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const XBrandIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.901 1.5h3.182l-6.953 7.948L23.31 22.5h-6.404l-5.015-6.56L6.152 22.5H2.968l7.437-8.5L1.5 1.5h6.567l4.532 5.98L18.9 1.5zm-1.117 19.09h1.763L7.11 3.325H5.22L17.784 20.59z" />
  </svg>
);

const WhatsAppIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.11 4.93A10.86 10.86 0 0 0 12.06 2C6.09 2 1.25 6.84 1.25 12.81c0 1.9.5 3.76 1.43 5.4L1 23l4.95-1.63a10.73 10.73 0 0 0 5.11 1.3h.01c5.97 0 10.81-4.84 10.81-10.81a10.74 10.74 0 0 0-2.77-6.93zm-7.05 15.9c-1.63 0-3.22-.43-4.62-1.24l-.33-.2-2.94.97.96-2.86-.21-.34a8.94 8.94 0 0 1-1.37-4.75c0-4.94 4.02-8.96 8.97-8.96a8.9 8.9 0 0 1 6.37 2.65 8.9 8.9 0 0 1 2.59 6.32c0 4.94-4.02 8.96-8.96 8.96zm4.92-6.71c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14-.17.27-.69.87-.84 1.04-.15.17-.3.2-.57.07-.27-.14-1.12-.41-2.14-1.31-.79-.7-1.33-1.56-1.49-1.82-.16-.27-.02-.41.12-.54.12-.12.27-.3.4-.45.13-.15.18-.27.27-.45.09-.17.04-.33-.02-.47-.07-.14-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.72.33-.24.27-.95.93-.95 2.27s.97 2.63 1.11 2.81c.13.17 1.89 2.88 4.58 4.04.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.52-.08 1.58-.65 1.8-1.28.22-.63.22-1.17.15-1.28-.07-.11-.25-.17-.52-.31z" />
  </svg>
);

const LinkedInIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM2.75 9h4.45v12H2.75V9zm7.21 0h4.26v1.64h.06c.59-1.12 2.03-2.3 4.18-2.3 4.47 0 5.29 2.94 5.29 6.77V21H19.3v-5.17c0-1.23-.02-2.81-1.71-2.81-1.72 0-1.98 1.34-1.98 2.72V21H9.96V9z" />
  </svg>
);

const DiscordIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
  </svg>
);

const YouTubeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M23.5 7.2a3.2 3.2 0 0 0-2.24-2.27C19.1 4.3 12 4.3 12 4.3s-7.1 0-9.26.63A3.2 3.2 0 0 0 .5 7.2 33.6 33.6 0 0 0 0 12a33.6 33.6 0 0 0 .5 4.8 3.2 3.2 0 0 0 2.24 2.27c2.16.63 9.26.63 9.26.63s7.1 0 9.26-.63a3.2 3.2 0 0 0 2.24-2.27A33.6 33.6 0 0 0 24 12a33.6 33.6 0 0 0-.5-4.8zM9.6 15.15V8.85L15.3 12l-5.7 3.15z" />
  </svg>
);

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/campusfixsystems/",
    Icon: InstagramIcon,
    style:
      "border-pink-200 text-pink-500 hover:border-pink-400 hover:text-pink-600 hover:shadow-[0_0_28px_rgba(236,72,153,0.45)] dark:border-pink-900/40 dark:text-pink-300",
  },
  {
    label: "X",
    href: "https://x.com/campusfixsystems",
    Icon: XBrandIcon,
    style:
      "border-slate-300 text-slate-700 hover:border-slate-500 hover:text-black hover:shadow-[0_0_28px_rgba(148,163,184,0.4)] dark:border-slate-600 dark:text-gray-200 dark:hover:text-white",
  },
  {
    label: "WhatsApp",
    href: "https://www.whatsapp.com/",
    Icon: WhatsAppIcon,
    style:
      "border-emerald-200 text-emerald-500 hover:border-emerald-400 hover:text-emerald-600 hover:shadow-[0_0_28px_rgba(34,197,94,0.45)] dark:border-emerald-900/40 dark:text-emerald-300",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    Icon: LinkedInIcon,
    style:
      "border-sky-200 text-sky-500 hover:border-sky-400 hover:text-sky-600 hover:shadow-[0_0_28px_rgba(14,165,233,0.45)] dark:border-sky-900/40 dark:text-sky-300",
  },
  {
    label: "Discord",
    href: "https://discord.com/",
    Icon: DiscordIcon,
    style:
      "border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] dark:border-indigo-900/40 dark:text-indigo-300",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    Icon: YouTubeIcon,
    style:
      "border-rose-200 text-rose-500 hover:border-rose-400 hover:text-rose-600 hover:shadow-[0_0_28px_rgba(244,63,94,0.45)] dark:border-rose-900/40 dark:text-rose-300",
  },
];

const numberFormat = new Intl.NumberFormat("en-US");

const formatNumber = (value) => (value == null ? "--" : numberFormat.format(value));

const formatSyncTime = (value) => {
  if (!value) return "Waiting for sync";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waiting for sync";
  return `Updated ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const toPhoneHref = (value) => {
  if (!value) return "";
  const normalized = value.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
};

const weekdayFromIsoDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString([], { weekday: "short" });
};

const scrollToSection = (href) => {
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(
    () => typeof window === "undefined" || typeof window.IntersectionObserver !== "function"
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, visible]);

  return [ref, visible];
};

const usePublicAnalytics = () => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    let active = true;
    let timer = null;

    const load = async (force = false) => {
      if (!force && document.visibilityState === "hidden") return;
      try {
        const data = await publicAnalyticsService.getSummary();
        if (!active) return;
        setStats({ ...INITIAL_STATS, ...data });
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || "Live analytics is currently unavailable.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const startPolling = () => {
      if (timer !== null) return;
      timer = window.setInterval(() => {
        load();
      }, 20000);
    };

    const stopPolling = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
        return;
      }
      load(true);
      startPolling();
    };

    load(true);
    if (document.visibilityState !== "hidden") {
      startPolling();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return { stats, loading, error };
};

const usePublicLandingConfig = () => {
  const [config, setConfig] = useState(INITIAL_PUBLIC_CONFIG);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await publicAnalyticsService.getConfig();
        if (!active) return;
        setConfig({ ...INITIAL_PUBLIC_CONFIG, ...data });
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || "Support configuration is currently unavailable.");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { config, error };
};

const CampusFixLogo = ({ size = "md" }) => {
  const isLarge = size === "lg";
  const containerSize = isLarge ? "h-20 w-20" : "h-14 w-14";
  const dashedRing = isLarge ? "rounded-2xl border-2" : "rounded-xl border";
  const glowInset = isLarge ? "inset-1 rounded-xl" : "inset-[3px] rounded-lg";
  const innerSize = isLarge ? "h-16 w-16 rounded-2xl" : "h-11 w-11 rounded-xl";
  const wrenchSize = isLarge ? 28 : 20;
  const topBadge = isLarge ? "-top-1.5 -right-1.5 h-6 w-6" : "-top-1 -right-1 h-5 w-5";
  const bottomBadge = isLarge ? "-bottom-1 -left-1 h-5 w-5" : "-bottom-1 -left-1 h-4 w-4";
  const zapSize = isLarge ? 12 : 9;
  const shieldSize = isLarge ? 10 : 8;

  return (
    <div className="relative flex items-center gap-2.5">
      <div className={`relative flex ${containerSize} items-center justify-center`}>
        <div className={`absolute inset-0 ${dashedRing} border-dashed border-campus-300/60 dark:border-campus-500/30 animate-spin-slow`} />
        <div className={`absolute ${glowInset} bg-campus-400/10 dark:bg-campus-500/10 animate-pulse-ring`} />
        <div className={`relative flex ${innerSize} items-center justify-center bg-gradient-to-br from-campus-500 to-campus-700 shadow-lg shadow-campus-500/30`}>
          <Wrench size={wrenchSize} className="text-white animate-spin-reverse" style={{ animationDuration: "8s" }} />
        </div>
        <div className={`absolute ${topBadge} flex items-center justify-center rounded-full bg-amber-400 shadow-sm`}>
          <Zap size={zapSize} className="text-white" />
        </div>
        <div className={`absolute ${bottomBadge} flex items-center justify-center rounded-full bg-emerald-400 shadow-sm`}>
          <Shield size={shieldSize} className="text-white" />
        </div>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        Campus<span className="text-campus-500">Fix</span>
      </span>
    </div>
  );
};

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-campus-500 to-campus-600 text-white shadow-xl shadow-campus-500/30 transition hover:translate-y-[-2px] hover:shadow-campus-500/50"
    >
      <ArrowUp size={18} />
    </button>
  );
};

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, homePath } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const goToSection = (href) => {
    setMobileOpen(false);
    scrollToSection(href);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/85"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <Link to="/" className="no-underline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <CampusFixLogo />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => goToSection(link.href)}
              className="text-base font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-400"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-campus-600 dark:hover:text-campus-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
          </button>

          <div className="hidden items-center gap-2.5 lg:flex">
            {isAuthenticated ? (
              <Link to={homePath} className="btn-primary no-underline">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary no-underline">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation-menu" className="animate-slide-in-down border-t border-gray-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/95 lg:hidden">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => goToSection(link.href)}
              className="block w-full py-3 text-left text-base font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300"
            >
              {link.label}
            </button>
          ))}

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
            {isAuthenticated ? (
              <Link to={homePath} className="btn-primary w-full justify-center no-underline" onClick={() => setMobileOpen(false)}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost w-full justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary w-full justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const LiveAnalyticsPanel = ({ stats, loading, error }) => {
  const maxPoint = useMemo(() => {
    if (!stats.resolvedLast7Days?.length) return 1;
    return Math.max(...stats.resolvedLast7Days.map((item) => item.resolvedTickets), 1);
  }, [stats.resolvedLast7Days]);

  const tiles = [
    {
      label: "Resolved Issues",
      value: formatNumber(stats.resolvedTickets),
      helper: "All-time closed and resolved",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Open Queue",
      value: formatNumber(stats.openTickets),
      helper: "Current unresolved workload",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Resolved Today",
      value: formatNumber(stats.resolvedToday),
      helper: "Completed in the current day",
      accent: "text-campus-600 dark:text-campus-300",
    },
    {
      label: "Avg Resolution",
      value: stats.averageResolutionHours == null ? "--" : `${stats.averageResolutionHours.toFixed(1)}h`,
      helper: "Mean time to resolve",
      accent: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div id="live-analytics" className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/92 p-5 shadow-2xl shadow-campus-500/15 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/85">
      <div className="absolute -top-28 right-0 h-44 w-44 rounded-full bg-campus-400/20 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-campus-600 dark:text-campus-300">Live Operations Snapshot</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Real-time maintenance analytics</h3>
          </div>
          <span className="rounded-full border border-campus-200 bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:border-campus-800 dark:bg-campus-900/30 dark:text-campus-300">
            {loading ? "Syncing..." : formatSyncTime(stats.lastUpdatedAt)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-gray-200 bg-white/95 p-3.5 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">{tile.label}</p>
              <p className={`mt-2 text-2xl font-extrabold ${tile.accent}`}>{tile.value}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{tile.helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Resolved in last 7 days</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto-updates every 20s</p>
          </div>

          {stats.resolvedLast7Days?.length ? (
            <div className="mt-4 grid grid-cols-7 gap-2">
              {stats.resolvedLast7Days.map((point) => {
                const barHeight = Math.max((point.resolvedTickets / maxPoint) * 88, 8);
                return (
                  <div key={point.date} className="flex flex-col items-center gap-2">
                    <div className="flex h-24 items-end">
                      <div
                        className="w-6 rounded-t-md bg-gradient-to-t from-campus-600 to-campus-400"
                        style={{ height: `${barHeight}px` }}
                        title={`${point.date}: ${point.resolvedTickets}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{weekdayFromIsoDate(point.date)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No resolved-ticket trend data available yet.</p>
          )}
        </div>

        {error && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{error}</p>}
      </div>
    </div>
  );
};

const HeroSection = ({ stats, loading, error }) => (
  <section className="relative overflow-hidden pb-20 pt-32 sm:pt-36 lg:pb-24">
    <div className="absolute inset-0 bg-gradient-to-br from-campus-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-campus-950" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,_rgba(59,130,246,0.16),_transparent_45%),radial-gradient(circle_at_80%_70%,_rgba(14,165,233,0.12),_transparent_42%)]" />
    <div className="absolute left-12 top-24 h-72 w-72 rounded-full bg-campus-400/12 blur-3xl" />
    <div className="absolute bottom-12 right-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

    <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-campus-200 bg-campus-50/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-campus-700 dark:border-campus-700 dark:bg-campus-900/40 dark:text-campus-300">
          <Sparkles size={13} />
          Smart Campus Maintenance Platform
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Campus maintenance,
          <span className="bg-gradient-to-r from-campus-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent"> made effortless</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl">
          A centralized operations hub for students, technicians, and campus admins to report issues, coordinate fixes, and measure results with live visibility.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToSection("#privacy-policy")}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-campus-500 to-campus-600 px-7 py-3.5 text-sm font-semibold text-white no-underline shadow-xl shadow-campus-500/25 transition hover:from-campus-600 hover:to-campus-700"
          >
            Privacy Policy
            <FileText size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("#terms-and-conditions")}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-gray-300 bg-white/85 px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-200 dark:hover:border-campus-600 dark:hover:text-campus-300"
          >
            Terms and Conditions
            <Shield size={16} />
          </button>
        </div>
      </div>

      <LiveAnalyticsPanel stats={stats} loading={loading} error={error} />
    </div>
  </section>
);

const FeaturesSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="features" className="relative bg-white py-24 dark:bg-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:46px_46px]" />

      <div
        ref={ref}
        className={`relative z-10 mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <Sparkles size={12} />
            Features
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Built for modern campus maintenance teams
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Operations, communication, and accountability in one interface for students and staff.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={`group rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm transition-all duration-700 hover:-translate-y-1 hover:border-campus-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/85 dark:hover:border-campus-700 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3 shadow-lg`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="how-it-works" className="relative bg-gray-50 py-24 dark:bg-slate-950">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <Timer size={12} />
            How It Works
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">From report to resolution in 3 steps</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Transparent workflows keep students informed and teams aligned.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`relative rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-700 dark:border-slate-700 dark:bg-slate-900/80 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {i < STEPS.length - 1 && (
                <div className="absolute left-[62%] top-12 hidden h-0.5 w-[78%] bg-gradient-to-r from-campus-300 to-transparent md:block dark:from-campus-700" />
              )}

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 shadow-inner dark:bg-slate-800">
                <step.icon size={34} className={step.color} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-campus-600 dark:text-campus-300">Step {step.num}</p>
              <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="about" className="relative bg-white py-24 dark:bg-slate-900">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Users size={12} />
            About Us
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">Built by students, aligned with operations teams</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            CampusFix started as a response to delayed maintenance updates on campus. The platform is designed to improve visibility, accountability, and response speed for everyone involved in fixing campus issues.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div
            className={`rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center transition-all duration-700 dark:border-slate-700 dark:bg-slate-800/70 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "70ms" }}
          >
            <Clock size={22} className="mx-auto text-campus-500" />
            <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">Faster response visibility</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Tickets move through clear, trackable statuses.</p>
          </div>
          <div
            className={`rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center transition-all duration-700 dark:border-slate-700 dark:bg-slate-800/70 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "140ms" }}
          >
            <Shield size={22} className="mx-auto text-campus-500" />
            <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">Role-based security</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Access is controlled by user roles and authentication policy.</p>
          </div>
          <div
            className={`rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center transition-all duration-700 dark:border-slate-700 dark:bg-slate-800/70 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "210ms" }}
          >
            <TrendingUp size={22} className="mx-auto text-campus-500" />
            <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">Continuous improvement</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Operational metrics guide future feature updates.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CommunitySection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="community" className="relative overflow-hidden bg-gray-50 py-24 dark:bg-slate-950">
      <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-campus-300/10 blur-3xl" />

      <div
        ref={ref}
        className={`relative z-10 mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            <Award size={12} />
            Community
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">Stay connected with CampusFix</h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Join our channel to share feedback, report product issues, and follow release updates.
          </p>

          <a
            href="https://discord.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-3 rounded-2xl border border-[#5865F2]/70 bg-[#5865F2] px-8 py-4 text-base font-semibold text-white no-underline shadow-xl shadow-[#5865F2]/35 transition hover:-translate-y-0.5 hover:shadow-[#5865F2]/55"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
              <DiscordIcon className="h-5 w-5" />
            </span>
            Join Our Discord
            <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="faq" className="bg-white py-24 dark:bg-slate-900">
      <div
        ref={ref}
        className={`mx-auto max-w-4xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/30 dark:text-campus-300">
            <HelpCircle size={12} />
            FAQ
          </span>
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">Frequently asked questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Common questions from students, technicians, and administrators.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm open:border-campus-300 open:bg-campus-50/40 dark:border-slate-700 dark:bg-slate-900 dark:open:border-campus-700 dark:open:bg-campus-900/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-gray-900 dark:text-white">
                {faq.question}
                <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const PoliciesSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="policies" className="bg-gray-50 py-24 dark:bg-slate-950">
      <div
        ref={ref}
        className={`mx-auto grid max-w-7xl gap-6 px-5 transition-all duration-700 sm:px-6 lg:grid-cols-2 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <article id="privacy-policy" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-campus-100 text-campus-600 dark:bg-campus-900/40 dark:text-campus-300">
            <FileText size={20} />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">How CampusFix handles personal data, access rights, retention, and support usage.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-campus-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>

        <article id="terms-and-conditions" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
            <Shield size={20} />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Rules for responsible usage, platform access, and policy update expectations.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {TERMS_POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-violet-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="contact" className="bg-white pb-8 pt-16 dark:bg-slate-900 sm:pb-10 sm:pt-20">
      <div
        ref={ref}
        className={`mx-auto max-w-5xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-campus-50/40 to-blue-50/70 p-7 shadow-xl shadow-campus-500/10 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-campus-950 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-campus-100 px-3 py-1 text-xs font-semibold text-campus-700 dark:bg-campus-900/40 dark:text-campus-300">
                <LifeBuoy size={12} />
                Contact Us
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Need help from support?</h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                Use our support form to submit full name, email, issue category, subject, and message details. Include context so the team can respond with a complete fix path.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <Link to="/contact-support" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-4 py-3 text-sm font-semibold text-white no-underline transition hover:from-campus-600 hover:to-campus-700">
                Open Contact Support
                <ArrowRight size={16} />
              </Link>
              <a href="mailto:campusfixsystems@gmail.com" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 no-underline transition hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-campus-600 dark:hover:text-campus-300">
                campusfixsystems@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const QuickLinksSection = ({ config }) => {
  const [ref, visible] = useScrollReveal(0.12);
  const supportPhoneText = (config.supportPhone && config.supportPhone.trim()) || "+254 747988030";
  const supportPhoneHref = toPhoneHref(supportPhoneText);

  return (
    <section className="bg-white pb-6 dark:bg-slate-900 sm:pb-8">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="grid gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-blue-50/70 p-5 shadow-sm sm:p-6 lg:grid-cols-[1.2fr_1fr_1fr] dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-campus-950/50">
          <article className="rounded-2xl border border-gray-200/90 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/85">
            <div className="inline-flex items-center gap-2.5">
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-campus-500 to-campus-700 shadow-md shadow-campus-500/20">
                <Wrench size={16} className="text-white" />
                <span className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400">
                  <Zap size={8} className="text-white" />
                </span>
                <span className="absolute -bottom-1 -left-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400">
                  <Shield size={8} className="text-white" />
                </span>
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Campus<span className="text-campus-500">Fix</span>
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">We simplify campus maintenance communication and issue resolution.</p>
            <div className="mt-4 space-y-2 text-sm">
              <a href="mailto:campusfixsystems@gmail.com" className="inline-flex items-center gap-2 font-semibold text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                <Mail size={14} />
                campusfixsystems@gmail.com
              </a>
              <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Phone number</p>
                <a href={supportPhoneHref} className="mt-1 inline-flex items-center gap-2 font-semibold text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                  <PhoneCall size={14} />
                  {supportPhoneText}
                </a>
              </div>
              <p className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin size={14} />
                Nairobi, Kenya
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/90 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/85">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Quick links</p>
            <div className="mt-3 grid gap-2 text-sm">
              <button type="button" onClick={() => scrollToSection("#features")} className="text-left font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                Features
              </button>
              <button type="button" onClick={() => scrollToSection("#how-it-works")} className="text-left font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                How It Works
              </button>
              <button type="button" onClick={() => scrollToSection("#faq")} className="text-left font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                FAQ
              </button>
              <Link to="/contact-support" className="font-semibold text-gray-700 transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300 no-underline">
                Contact Support
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/90 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/85">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Legal</p>
            <div className="mt-3 grid gap-2.5 text-sm">
              <button type="button" onClick={() => scrollToSection("#terms-and-conditions")} className="text-left text-base font-semibold text-gray-900 transition hover:text-campus-600 dark:text-white dark:hover:text-campus-300">
                Terms & Conditions
              </button>
              <button type="button" onClick={() => scrollToSection("#privacy-policy")} className="text-left text-base font-semibold text-gray-900 transition hover:text-campus-600 dark:text-white dark:hover:text-campus-300">
                Privacy Policy
              </button>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-campus-500 to-campus-600 px-3 py-2 text-white shadow-md shadow-campus-500/25">
              <Globe size={16} className="text-white" />
              <span className="text-base font-medium text-white">English</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

const BottomSocialSection = () => {
  const [ref, visible] = useScrollReveal(0.08);

  return (
    <section className="bg-white pb-5 dark:bg-slate-900">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-5 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Follow CampusFix</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={`group flex h-14 w-14 items-center justify-center rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 dark:bg-slate-900/70 ${social.style}`}
            >
              <social.Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-slate-950">
    <p className="relative z-10 pb-6 text-center text-[11px] font-medium tracking-wide text-gray-600 dark:text-gray-500">
      {"\u00A9"} {new Date().getFullYear()} CampusFix Systems
    </p>
  </footer>
);

export const LandingPage = () => {
  const { stats, loading, error } = usePublicAnalytics();
  const { config } = usePublicLandingConfig();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <HeroSection stats={stats} loading={loading} error={error} />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CommunitySection />
      <FAQSection />
      <PoliciesSection />
      <ContactSection />
      <QuickLinksSection config={config} />
      <BottomSocialSection />
      <Footer />
      <ScrollTopButton />
    </div>
  );
};

