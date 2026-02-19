import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const COLLAPSED_KEY = "campusfix-sidebar-collapsed";

export const DashboardShell = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(COLLAPSED_KEY) === "true"; } catch { return false; }
    });

    const toggleCollapse = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch { /* ignore */ }
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
            />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className={`transition-all duration-300 ease-in-out ${collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar"}`}>
                {/* Top bar */}
                <TopBar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
};
