import { useState } from "react";
import { Plus } from "lucide-react";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";
import { formatDate } from "../../utils/helpers";
import { TECHNICIAN_SPECIALTIES, formatSpecialtyLabel } from "../../utils/technicianSpecialties.js";

/**
 * Staff onboarding form.
 */
export const StaffOnboarding = ({
    maintenanceUsers,
    onInviteStaff,
    latestInvite,
}) => {
    const [staffForm, setStaffForm] = useState({ email: "", fullName: "", specialties: [] });
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
            setStaffNotice("Invite queued. The account appears after the invite is accepted.");
            setStaffForm({ email: "", fullName: "", specialties: [] });
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to create staff invitation.";
            setStaffError(message);
        } finally {
            setStaffLoading(false);
        }
    };

    const toggleSpecialty = (specialty) => {
        setStaffForm((current) => {
            const exists = current.specialties.includes(specialty);
            return {
                ...current,
                specialties: exists
                    ? current.specialties.filter((value) => value !== specialty)
                    : [...current.specialties, specialty],
            };
        });
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
                    <input
                        required
                        maxLength={120}
                        autoComplete="name"
                        name="fullName"
                        value={staffForm.fullName}
                        onChange={(e) => setStaffForm((p) => ({ ...p, fullName: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                        placeholder="e.g. James Mwangi"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                    <input
                        required
                        type="email"
                        autoComplete="email"
                        name="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-campus-400 focus:ring-2 focus:ring-campus-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-campus-900/30"
                        placeholder="e.g. jmwangi@campus.local"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Areas of Specialization</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {TECHNICIAN_SPECIALTIES.map((specialty) => {
                            const active = staffForm.specialties.includes(specialty.value);
                            return (
                                <button
                                    key={specialty.value}
                                    type="button"
                                    onClick={() => toggleSpecialty(specialty.value)}
                                    className={`rounded-full border px-3 py-2 text-xs font-medium transition ${active
                                        ? "border-campus-500 bg-campus-50 text-campus-700 dark:border-campus-500 dark:bg-campus-900/30 dark:text-campus-200"
                                        : "border-gray-200 bg-white text-gray-600 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300"}`}
                                >
                                    {specialty.label}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Select at least one specialty so CampusFix can match tickets to the right technician.
                    </p>
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                    <button disabled={staffLoading || staffForm.specialties.length === 0} className="btn-primary interactive-control">
                        <Plus size={16} />
                        {staffLoading ? "Sending invite..." : "Send Invite"}
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
                    <p>Latest invite: {latestInvite.email} expires on {formatDate(latestInvite.expiresAt)}.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(latestInvite.specialties || []).map((specialty) => (
                            <span key={specialty} className="pill-badge bg-white/80 text-campus-700 dark:bg-slate-900/70 dark:text-campus-200">
                                {formatSpecialtyLabel(specialty)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </MotionCardSurface>
    );
};
