import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, PanelsTopLeft, Workflow } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import HoverGradientNavBar from "@/components/ui/hover-gradient-nav-bar";
import { CampusFixLogo } from "./CampusFixLogo";

export const Navbar = ({ links = [] }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, homePath } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navIcons = [PanelsTopLeft, Workflow, HelpCircle];

  const getNavTopOffset = () => {
    const nav = document.querySelector("[data-landing-navbar='true']");
    if (!nav) return 16;
    return Math.max(0, nav.getBoundingClientRect().height + 12);
  };

  const goToSection = (href) => {
    if (!href?.startsWith("#")) return;
    const sectionId = href.slice(1);
    const target = document.getElementById(sectionId);
    if (!target) return;

    const top = Math.max(
      0,
      window.scrollY + target.getBoundingClientRect().top - getNavTopOffset()
    );
    window.scrollTo({ top, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", href);
    }
  };

  return (
    <nav
      data-landing-navbar="true"
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/85"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <Link to="/" className="no-underline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <CampusFixLogo />
        </Link>

        {links.length > 0 ? (
          <div className="hidden items-center gap-6 lg:flex">
            <HoverGradientNavBar
              items={links.map((link, index) => ({
                label: link.label,
                icon: navIcons[index % navIcons.length],
                onClick: () => goToSection(link.href),
              }))}
            />
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              to={homePath}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 no-underline transition hover:text-campus-600 dark:text-gray-200 dark:hover:text-campus-300"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle isDark={theme === "dark"} onToggle={() => toggleTheme()} className="shadow-sm" />
        </div>
      </div>
      {links.length > 0 ? (
        <div className="border-t border-gray-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/85 lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
            {links.map((link, index) => {
              const Icon = navIcons[index % navIcons.length];
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => goToSection(link.href)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-campus-400 hover:text-campus-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:border-campus-500 dark:hover:text-campus-300"
                >
                  <Icon size={13} />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
};
