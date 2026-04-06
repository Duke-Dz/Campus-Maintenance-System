import { useState } from "react";
import { Plus } from "lucide-react";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";
import { formatDate } from "../../utils/helpers";

/**
 * Staff onboarding form.
 */
export const StaffOnboarding = ({
    maintenanceUsers,
    onInviteStaff,
    latestInvite,
}) => {
    const [staffForm, setStaffForm] = useState({ email: "", fullName: "" });
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffError, setStaffError] = useState("");
    const [staffNotice, setStaffNotice] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStaffLoading(true);
        setStaffError("");
        setStaffNotice("");
        try {
            await onInviteStaff(staffForm);
            setStaffNotice(`Invite queued. The account appears after the invite is accepted.`);
            setStaffForm({ email: "", fullName: "" });
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to create staff invitation.";
            setStaffError(message);
        } finally {
            setStaffLoading(false);
        }
    };

    return (
        <MotionCardSurface
            as="section"
            cardId="admin-staff-onboarding"
            sectionId="staff"
            className="motion-section dashboard-panel interactive-surface"
            trackSection
        >
            <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Staff Onboarding</h3>
                <span className="pill-badge bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400">
                    {maintenanceUsers.length} active maintenance users
                </span>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</label>
                    <input required maxLength={120} autoComplete="name" name="fullName"
                        value={staffForm.fullName}
                        onChange={(e) => setStaffForm((p) => ({ ...p, fullName: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                        placeholder="e.g. James Mwangi"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                    <input required type="email" autoComplete="email" name="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                        placeholder="e.g. jmwangi@campus.local"
                    />
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                    <button disabled={staffLoading} className="btn-primary interactive-control">
                        <Plus size={16} />
                        {staffLoading ? "Sending Invite…" : "Send Invite"}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Staff choose a username and password when they accept the invite by email.
                    </p>
                </div>
            </form>

            {staffError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{staffError}</p>}
            {staffNotice && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{staffNotice}</p>}
            {latestInvite && (
                <div className="mt-3 rounded-xl border border-campus-100 bg-campus-50/60 px-4 py-3 text-xs text-campus-700 dark:border-campus-900/40 dark:bg-campus-900/20 dark:text-campus-300">
                    Latest invite: {latestInvite.email} expires on {formatDate(latestInvite.expiresAt)}.
                </div>
            )}
        </MotionCardSurface>
    );
};
