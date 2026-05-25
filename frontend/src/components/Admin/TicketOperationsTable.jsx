import { useMemo } from "react";
import { DataTable } from "../Common/DataTable";
import { StatusBadge } from "../Common/StatusBadge";
import { UrgencyBadge } from "../Common/UrgencyBadge";
import { MotionCardSurface } from "../Dashboard/MotionCardSurface.jsx";
import { formatDate, titleCase } from "../../utils/helpers";
import {
  getTicketBuildingName,
  getTicketLocationSummary,
  getTicketRequestTypeLabel,
  getTicketServiceDomainLabel,
} from "../../utils/ticketPresentation";

const SLA_TARGETS = { CRITICAL: 4, HIGH: 24, MEDIUM: 72, LOW: 168 };

const getSlaStatus = (ticket) => {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(ticket.status)) return "resolved";
  const targetHours = SLA_TARGETS[ticket.urgency] || 72;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  if (elapsed >= targetHours) return "breached";
  if (elapsed >= targetHours * 0.75) return "at-risk";
  return "on-track";
};

const slaColorMap = {
  "on-track": "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  "at-risk": "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  breached: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  resolved: "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
};

export const TicketOperationsTable = ({
  tickets,
  filters,
  setFilters,
  maintenanceUsers,
  onOpenTicket,
  statuses,
  serviceDomains,
  requestTypes,
  buildings,
  urgencyLevels,
  searchValue,
  onSearchChange,
}) => {
  const availableRequestTypes = useMemo(() => {
    if (!filters.serviceDomainKey) {
      return requestTypes;
    }
    return requestTypes.filter((requestType) => requestType.serviceDomainKey === filters.serviceDomainKey);
  }, [filters.serviceDomainKey, requestTypes]);

  const columns = useMemo(() => [
    {
      key: "id",
      header: "ID",
      render: (row) => <span className="font-semibold text-campus-600 dark:text-campus-400">#{row.id}</span>,
      accessor: (row) => row.id,
    },
    {
      key: "title",
      header: "Title",
      render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.title}</span>,
      accessor: (row) => row.title,
    },
    {
      key: "serviceDomain",
      header: "Domain",
      accessor: (row) => getTicketServiceDomainLabel(row),
    },
    {
      key: "requestType",
      header: "Request Type",
      accessor: (row) => getTicketRequestTypeLabel(row),
    },
    {
      key: "urgency",
      header: "Urgency",
      render: (row) => <UrgencyBadge urgency={row.urgency} />,
      accessor: (row) => row.urgency,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
      accessor: (row) => row.status,
    },
    {
      key: "sla",
      header: "SLA",
      sortable: false,
      render: (row) => {
        const sla = getSlaStatus(row);
        return (
          <span className={`pill-badge ${slaColorMap[sla]}`}>
            {sla === "resolved" ? "-" : titleCase(sla.replace("-", " "))}
          </span>
        );
      },
      accessor: (row) => getSlaStatus(row),
    },
    {
      key: "building",
      header: "Location",
      accessor: (row) => getTicketLocationSummary(row),
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-gray-900 dark:text-white">{getTicketBuildingName(row)}</p>
          {row.location && <p className="text-xs text-gray-400 dark:text-slate-500">{row.location}</p>}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Submitted",
      accessor: (row) => formatDate(row.createdAt),
    },
    {
      key: "assignee",
      header: "Assignee",
      accessor: (row) => row.assignedTo?.fullName || "Unassigned",
      render: (row) => row.assignedTo
        ? row.assignedTo.fullName
        : <span className="text-gray-300 dark:text-gray-600">Unassigned</span>,
    },
  ], []);

  const activeFilterCount = [
    filters.status,
    filters.serviceDomainKey,
    filters.requestTypeId,
    filters.buildingId,
    filters.urgency,
    filters.assignee,
    filters.reviewRequired,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      status: "",
      serviceDomainKey: "",
      requestTypeId: "",
      buildingId: "",
      urgency: "",
      assignee: "",
      reviewRequired: "",
    });
    onSearchChange?.("");
  };

  const filterBar = (
    <div className="mb-5 rounded-[1.3rem] border border-gray-100 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Refine queue</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Slice by workflow, service domain, request type, building, urgency, or assignee.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill-badge bg-white/80 text-gray-600 dark:bg-slate-950/80 dark:text-slate-200">
            {activeFilterCount} active filters
          </span>
          {(activeFilterCount > 0 || searchValue) && (
            <button type="button" onClick={clearFilters} className="btn-ghost interactive-control">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
        </select>
        <select
          value={filters.serviceDomainKey}
          onChange={(event) => setFilters((current) => ({
            ...current,
            serviceDomainKey: event.target.value,
            requestTypeId: "",
          }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Domains</option>
          {serviceDomains.map((serviceDomain) => (
            <option key={serviceDomain.id} value={serviceDomain.key}>{serviceDomain.label}</option>
          ))}
        </select>
        <select
          value={filters.requestTypeId}
          onChange={(event) => setFilters((current) => ({ ...current, requestTypeId: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Request Types</option>
          {availableRequestTypes.map((requestType) => (
            <option key={requestType.id} value={requestType.id}>{requestType.label}</option>
          ))}
        </select>
        <select
          value={filters.buildingId}
          onChange={(event) => setFilters((current) => ({ ...current, buildingId: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Buildings</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>{building.name}{building.active ? "" : " (Archived)"}</option>
          ))}
        </select>
        <select
          value={filters.urgency}
          onChange={(event) => setFilters((current) => ({ ...current, urgency: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Urgency</option>
          {urgencyLevels.map((urgency) => <option key={urgency} value={urgency}>{titleCase(urgency)}</option>)}
        </select>
        <select
          value={filters.assignee}
          onChange={(event) => setFilters((current) => ({ ...current, assignee: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Assignees</option>
          {maintenanceUsers.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
        </select>
        <select
          value={filters.reviewRequired}
          onChange={(event) => setFilters((current) => ({ ...current, reviewRequired: event.target.value }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200"
        >
          <option value="">All Queues</option>
          <option value="true">Needs specialist review</option>
          <option value="false">Standard workflow</option>
        </select>
      </div>
    </div>
  );

  return (
    <MotionCardSurface
      as="section"
      cardId="admin-ticket-operations"
      sectionId="tickets"
      className="motion-section dashboard-panel interactive-surface"
      trackSection
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ticket operations</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Review request state, SLA pressure, ownership, and date history in one place.
          </p>
        </div>
        <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">
          {tickets.length} visible tickets
        </span>
      </div>

      {filterBar}

      <DataTable
        data={tickets}
        columns={columns}
        pageSize={10}
        onRowClick={(row) => onOpenTicket(row.id)}
        exportFilename="tickets-report"
        exportTitle="Ticket Operations Report"
        title="Ticket log"
        emptyTitle="No tickets found"
        emptyMessage="Try adjusting the current scope or filters."
        exportable={false}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search title, request type, building, assignee, or status"
      />
    </MotionCardSurface>
  );
};
