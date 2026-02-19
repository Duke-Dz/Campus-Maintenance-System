import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const DashboardShell = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area — offset by sidebar width on desktop */}
            <div className="lg:pl-sidebar">
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
