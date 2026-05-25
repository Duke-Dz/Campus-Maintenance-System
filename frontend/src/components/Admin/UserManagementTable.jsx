import { useMemo, useState } from "react";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";
import { DataTable } from "../Common/DataTable";
import { titleCase } from "../../utils/helpers";
import { formatSpecialtyLabel } from "../../utils/technicianSpecialties.js";

/**
 * User Management Table — DataTable with role filter and export
 */
export const UserManagementTable = ({ users = [] }) => {
    const [roleFilter, setRoleFilter] = useState("");

    const filteredUsers = useMemo(() => {
        if (!roleFilter) return users;
        return users.filter((u) => u.role === roleFilter);
    }, [users, roleFilter]);

    const columns = useMemo(() => [
        {
            key: "username",
            header: "Username",
            render: (row) => <span className="font-medium text-gray-900 dark:text-white">@{row.username}</span>,
            accessor: (row) => row.username,
        },
        {
            key: "fullName",
            header: "Name",
            accessor: (row) => row.fullName,
        },
        {
            key: "role",
            header: "Role",
            render: (row) => {
                const roleClass = row.role === "ADMIN"
                    ? "bg-campus-50 text-campus-600 dark:bg-campus-900/20 dark:text-campus-400"
                    : row.role === "MAINTENANCE"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
                return <span className={`pill-badge ${roleClass}`}>{titleCase(row.role)}</span>;
            },
            accessor: (row) => row.role,
        },
        {
            key: "email",
            header: "Email",
            accessor: (row) => row.email,
        },
        {
            key: "ticketCount",
            header: "Tickets",
            render: (row) => <span className="font-bold text-campus-600 dark:text-campus-400">{row.ticketCount}</span>,
            accessor: (row) => row.ticketCount,
        },
        {
            key: "specialties",
            header: "Specialties",
            render: (row) => row.role !== "MAINTENANCE"
                ? <span className="text-gray-300 dark:text-gray-600">-</span>
                : (
                    <div className="flex flex-wrap gap-1.5">
                        {(row.specialties || []).length > 0
                            ? row.specialties.map((specialty) => (
                                <span key={specialty} className="pill-badge bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                    {formatSpecialtyLabel(specialty)}
                                </span>
                            ))
                            : <span className="text-gray-300 dark:text-gray-600">Unspecified</span>}
                    </div>
                ),
            accessor: (row) => (row.specialties || []).join(", "),
        },
    ], []);

    const roleFilterBar = (
        <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="STUDENT">Student</option>
        </select>
    );

    return (
        <MotionCardSurface
            as="section"
            cardId="admin-user-management"
            sectionId="users"
            className="motion-section dashboard-panel interactive-surface"
            trackSection
        >
            <DataTable
                data={filteredUsers}
                columns={columns}
                pageSize={10}
                exportFilename="users-report"
                exportTitle="User Management Report"
                title="User Management"
                headerActions={roleFilterBar}
                emptyTitle="No users match this filter"
                emptyMessage="Adjust role or search terms to find accounts."
            />
        </MotionCardSurface>
    );
};
