import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const COLLAPSED_KEY = "campusfix-sidebar-collapsed";
const sectionLabels = {
  dashboard: "Overview",
  analytics: "Analytics",
  tickets: "Ticket Operations",
  report: "Report Issue",
  tracker: "Tracker",
  users: "User Management",
  staff: "Staff Onboarding",
  broadcast: "Broadcast",
  "work-queue": "Work Queue",
  performance: "Performance",
  resolved: "Resolved",
};

export const DashboardShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSectionLabel, setActiveSectionLabel] = useState("Overview");
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

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

    window.dispatchEvent(
      new CustomEvent("dashboard:navigate", {
        detail: { id: sectionId, label: label || "" },
      })
    );

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("[data-dashboard-section='true']"));
    if (sections.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id;
        if (!id) return;
        setActiveSection(id);
        setActiveSectionLabel(sectionLabels[id] || "Overview");
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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

  return (
    <div className="dashboard-app min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="dashboard-background" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <div
        className={`relative z-10 transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar"
        }`}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          activeSectionLabel={activeSectionLabel}
        />

        <main className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
