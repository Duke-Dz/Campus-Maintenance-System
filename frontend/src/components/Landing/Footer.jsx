import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";

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
  { label: "Instagram", href: "https://www.instagram.com/campusfixsystems/", Icon: InstagramIcon },
  { label: "X", href: "https://x.com/campusfixsystems", Icon: XBrandIcon },
  { label: "WhatsApp", href: "https://www.whatsapp.com/", Icon: WhatsAppIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/", Icon: LinkedInIcon },
  { label: "Discord", href: "https://discord.com/", Icon: DiscordIcon },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: YouTubeIcon },
];

export const Footer = () => {
  const [ref, visible] = useScrollReveal(0.08);

  return (
    <footer className="landing-section bg-white dark:bg-slate-950">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-5 pb-8 transition-all duration-700 sm:px-6 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="border-t border-gray-200/80 pt-6 dark:border-slate-700/70">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1 text-center lg:text-left">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Campus Maintenance System</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Built by CampusFix Systems</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{"\u00A9"} {new Date().getFullYear()} CampusFix Systems. All rights reserved.</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold lg:justify-end">
              <Link to="/contact-support" className="text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                Contact Support
              </Link>
              <Link to="/privacy-policy" className="text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300">
                Terms & Conditions
              </Link>
            </nav>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-end">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:-translate-y-0.5 hover:border-campus-300 hover:text-campus-600 dark:border-slate-700 dark:text-gray-300 dark:hover:border-campus-500 dark:hover:text-campus-300"
              >
                <social.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
