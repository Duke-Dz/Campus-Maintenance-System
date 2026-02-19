import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

/**
 * Warns the user 5 minutes before their JWT token expires.
 * Place this component once inside the app (e.g. in DashboardShell or main.jsx).
 */
export const SessionExpiryWarning = () => {
    const { auth, logout } = useAuth();
    const timerRef = useRef(null);

    useEffect(() => {
        if (!auth?.token) return;

        // Decode JWT payload to get exp
        try {
            const payload = JSON.parse(atob(auth.token.split(".")[1]));
            const expMs = payload.exp * 1000;
            const now = Date.now();
            const msUntilExpiry = expMs - now;
            const warnAtMs = msUntilExpiry - 5 * 60 * 1000; // 5 min before

            if (warnAtMs <= 0) {
                // Already less than 5 min remaining
                if (msUntilExpiry > 0) {
                    toast("Your session will expire soon. Please save your work.", {
                        icon: "⏰",
                        duration: 8000,
                    });
                }
                return;
            }

            timerRef.current = setTimeout(() => {
                toast(
                    (t) => (
                        <div className="flex items-center gap-3">
                            <span>⏰</span>
                            <div>
                                <p className="text-sm font-semibold">Session Expiring</p>
                                <p className="text-xs text-gray-500">Your session expires in 5 minutes. Save your work.</p>
                            </div>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    logout();
                                    window.location.href = "/login";
                                }}
                                className="rounded-lg bg-campus-500 px-3 py-1 text-xs font-semibold text-white hover:bg-campus-600"
                            >
                                Re-login
                            </button>
                        </div>
                    ),
                    { duration: 5 * 60 * 1000, id: "session-expiry" }
                );
            }, warnAtMs);

            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        } catch {
            // Invalid token format — ignore
        }
    }, [auth?.token, logout]);

    return null;
};
