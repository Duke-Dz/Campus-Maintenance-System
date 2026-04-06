import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../../hooks/useAuth";
import { scrollToDashboardSection } from "./scrollToDashboardSection";

const COLLAPSED_KEY = "campusfix-sidebar-collapsed";
const OPEN_STUDENT_COMPOSER_EVENT = "dashboard:open-student-composer";
const sectionLabels = {
  dashboard: "Overview",
  analytics: "Analytics",
  reports: "Reports",
  tickets: "Requests",
  configuration: "Configuration",
  report: "Submit Issue",
  tracker: "Tracker",
  users: "User Management",
  staff: "Staff",
  broadcast: "Broadcast",
  "work-queue": "Focus Queue",
  performance: "Performance",
  resolved: "Completed",
};

export const DashboardShell = ({ children }) => {
  const { auth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSectionLabel, setActiveSectionLabel] = useState("Overview");
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const role = auth?.role?.toUpperCase() || "STUDENT";
  const effectiveCollapsed = collapsed && isDesktop;
  const roleLabel = role === "ADMIN" ? "Admin" : role === "MAINTENANCE" ? "Maintenance" : "Student";

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage limitations
      }
      return next;
    });
  };

  const handleSectionChange = (sectionId, label) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    setActiveSectionLabel(label || sectionLabels[sectionId] || "Overview");

    if (role === "STUDENT" && sectionId === "report") {
      window.dispatchEvent(new CustomEvent(OPEN_STUDENT_COMPOSER_EVENT));
      if (!isDesktop) {
        setSidebarOpen(false);
      }
      return;
    }

    window.dispatchEvent(
      new CustomEvent("dashboard:navigate", {
        detail: { id: sectionId, label: label || "" },
      })
    );

    scrollToDashboardSection(sectionId);

    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let frameId = null;
    const getSections = () => Array.from(document.querySelectorAll("[data-dashboard-section='true']")).filter(
      (section) => Boolean(section.id)
    );

    const updateActiveSection = () => {
      const sections = getSections();
      if (sections.length === 0) {
        return;
      }

      const topBarRect = document.querySelector(".command-topbar")?.getBoundingClientRect();
      const stickyOffset = (topBarRect ? Math.max(0, topBarRect.bottom) : 0) + 20;
      const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

      let candidate = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top - stickyOffset <= 0) {
          candidate = section;
        } else {
          break;
        }
      }
      if (reachedBottom) {
        candidate = sections[sections.length - 1];
      }

      const nextId = candidate.id;
      if (!nextId) {
        return;
      }

      setActiveSection((current) => (current === nextId ? current : nextId));
      setActiveSectionLabel(sectionLabels[nextId] || "Overview");
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateActiveSection();
      });
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("dashboard:navigate", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("dashboard:navigate", scheduleUpdate);
    };
  }, [children]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handlePreferenceSync = (event) => {
      const next = Boolean(event.detail?.collapsed);
      setCollapsed(next);
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage limitations
      }
    };

    window.addEventListener("dashboard:sidebar-collapsed", handlePreferenceSync);
    return () => window.removeEventListener("dashboard:sidebar-collapsed", handlePreferenceSync);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = `${roleLabel} Dashboard | CampusFix`;
  }, [roleLabel, activeSectionLabel]);

  return (
    <div
      className={`dashboard-app dashboard-role-${role.toLowerCase()} min-h-screen bg-bg-light dark:bg-bg-dark`}
      data-dashboard-role={role}
    >
      <div className="dashboard-background" />
      <div className="dashboard-shape-1" />
      <div className="dashboard-shape-2" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={effectiveCollapsed}
        onToggleCollapse={toggleCollapse}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <div
        className={`dashboard-content-shell relative z-10 overflow-x-clip transition-all duration-300 ease-in-out ${
          effectiveCollapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar"
        }`}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen((current) => !current)}
          isMenuOpen={sidebarOpen}
          activeSectionLabel={activeSectionLabel}
        />

        <main className="px-3 pb-8 pt-4 sm:px-5 sm:pt-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
