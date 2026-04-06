import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ExportDropdown } from "./ExportDropdown";
import { exportToCSV, exportToPDF } from "../../services/exportService";

/**
 * Reusable data table with pagination, sorting, search, and export.
 */
export const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  onRowClick,
  searchable = true,
  exportable = true,
  exportFilename = "export",
  exportTitle = "Report",
  title,
  headerActions,
  emptyTitle = "No data found",
  emptyMessage = "Try adjusting your filters.",
  className = "",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  recordLabel = "records",
  searchAccessor,
}) => {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [internalSearch, setInternalSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const isControlledSearch = typeof searchValue === "string";
  const activeSearch = isControlledSearch ? searchValue : internalSearch;
  const deferredSearch = useDeferredValue(activeSearch);

  const updateSearch = (value) => {
    if (isControlledSearch) {
      startTransition(() => {
        onSearchChange?.(value);
      });
    } else {
      startTransition(() => {
        setInternalSearch(value);
      });
    }
    setPage(0);
  };

  useEffect(() => {
    setRowsPerPage(pageSize);
  }, [pageSize]);

  const indexedRows = useMemo(
    () => data.map((row, index) => ({
      row,
      rowKey: row.id ?? `row-${index}`,
      searchText: String(
        searchAccessor
          ? searchAccessor(row)
          : columns.map((column) => (typeof column.accessor === "function" ? column.accessor(row) : row[column.key])).join(" ")
      ).toLowerCase(),
    })),
    [columns, data, searchAccessor]
  );

  const searchedRows = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return indexedRows;
    return indexedRows.filter((item) => item.searchText.includes(query));
  }, [deferredSearch, indexedRows]);

  const searchedData = useMemo(() => searchedRows.map((item) => item.row), [searchedRows]);

  const sortedData = useMemo(() => {
    if (!sortKey) return searchedData;
    const column = columns.find((item) => item.key === sortKey);
    if (!column) return searchedData;

    return [...searchedData].sort((left, right) => {
      const leftValue = typeof column.accessor === "function" ? column.accessor(left) : left[column.key];
      const rightValue = typeof column.accessor === "function" ? column.accessor(right) : right[column.key];
      const leftString = String(leftValue ?? "");
      const rightString = String(rightValue ?? "");
      const leftNumber = Number(leftString);
      const rightNumber = Number(rightString);

      let comparison;
      if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        comparison = leftNumber - rightNumber;
      } else {
        comparison = leftString.localeCompare(rightString);
      }

      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [columns, searchedData, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages - 1);
  const pagedData = useMemo(
    () => sortedData.slice(clampedPage * rowsPerPage, (clampedPage + 1) * rowsPerPage),
    [clampedPage, rowsPerPage, sortedData]
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const handleExport = (format) => {
    const exportColumns = columns.map((column) => ({
      key: column.key,
      header: column.header,
      accessor: column.accessor,
    }));

    if (format === "csv") exportToCSV(sortedData, exportColumns, exportFilename);
    if (format === "pdf") exportToPDF(sortedData, exportColumns, exportFilename, exportTitle);
  };

  const visiblePages = useMemo(() => {
    const totalVisible = Math.min(totalPages, 5);
    return Array.from({ length: totalVisible }, (_, index) => {
      if (totalPages <= 5) return index;
      if (clampedPage < 3) return index;
      if (clampedPage > totalPages - 4) return totalPages - 5 + index;
      return clampedPage - 2 + index;
    });
  }, [clampedPage, totalPages]);

  const renderCellValue = (column, row) =>
    column.render
      ? column.render(row)
      : (typeof column.accessor === "function" ? column.accessor(row) : row[column.key]) ?? "--";

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) {
      return <ArrowUpDown size={12} className="text-gray-300 dark:text-slate-600" />;
    }
    return sortDir === "asc"
      ? <ArrowUp size={12} className="text-campus-500" />
      : <ArrowDown size={12} className="text-campus-500" />;
  };

  return (
    <div className={`data-table-wrapper ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
              {title}
            </h3>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill-badge bg-white/80 text-gray-600 dark:bg-slate-900/80 dark:text-slate-200">
              {sortedData.length} {recordLabel}
            </span>
            {activeSearch.trim() && (
              <span className="pill-badge bg-campus-50 text-campus-700 dark:bg-campus-900/20 dark:text-campus-300">
                Filtered by "{activeSearch.trim()}"
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {searchable && (
            <label className="dashboard-table-search relative flex min-w-0 flex-1 items-center px-3 sm:min-w-[240px] sm:flex-none">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={activeSearch}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent py-2 pl-8 text-sm outline-none dark:text-gray-200"
              />
            </label>
          )}
          {headerActions}
          {exportable && <ExportDropdown onExport={handleExport} disabled={sortedData.length === 0} />}
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-gray-200 bg-white/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{emptyTitle}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {pagedData.map((row, index) => (
              onRowClick ? (
                <button
                  key={row.id ?? index}
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="dashboard-mobile-card w-full rounded-[1.15rem] border border-gray-200/70 bg-white/80 px-4 py-4 text-left shadow-sm transition hover:border-campus-200 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:hover:border-campus-700/40"
                >
                  <div className="space-y-3">
                    {columns.map((column) => (
                      <div key={column.key} className="grid grid-cols-[86px_minmax(0,1fr)] gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">{column.header}</span>
                        <div className="min-w-0 text-sm text-gray-700 dark:text-gray-200">{renderCellValue(column, row)}</div>
                      </div>
                    ))}
                  </div>
                </button>
              ) : (
                <div
                  key={row.id ?? index}
                  className="dashboard-mobile-card rounded-[1.15rem] border border-gray-200/70 bg-white/80 px-4 py-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/70"
                >
                  <div className="space-y-3">
                    {columns.map((column) => (
                      <div key={column.key} className="grid grid-cols-[86px_minmax(0,1fr)] gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">{column.header}</span>
                        <div className="min-w-0 text-sm text-gray-700 dark:text-gray-200">{renderCellValue(column, row)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="dashboard-table-frame hidden overflow-x-auto lg:block">
            <table className="dashboard-data-table min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-700">
              <thead className="bg-gray-50/80 dark:bg-slate-800/90">
                <tr className="text-left">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 ${
                        column.sortable !== false ? "cursor-pointer select-none transition hover:text-gray-700 dark:hover:text-gray-200" : ""
                      }`}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {column.header}
                        {column.sortable !== false && <SortIcon colKey={column.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-950/70">
                {pagedData.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-900/80 ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-3 py-3 text-gray-700 dark:text-gray-200">
                        {renderCellValue(column, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
            <div className="flex w-full flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:w-auto sm:justify-start">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
                className="dashboard-table-select px-2 py-1 text-xs"
              >
                {[10, 25, 50].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
              <span>
                {clampedPage * rowsPerPage + 1}-{Math.min((clampedPage + 1) * rowsPerPage, sortedData.length)} of {sortedData.length}
              </span>
            </div>

            <div className="flex w-full items-center justify-center gap-1 sm:w-auto sm:justify-end">
              <button
                type="button"
                disabled={clampedPage === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="dashboard-pagination-btn inline-flex h-8 w-8 items-center justify-center transition hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:hidden">
                Page {clampedPage + 1} of {totalPages}
              </span>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`hidden h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition sm:inline-flex ${
                    pageNumber === clampedPage
                      ? "dashboard-pagination-btn-active"
                      : "dashboard-pagination-btn text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNumber + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={clampedPage >= totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                className="dashboard-pagination-btn inline-flex h-8 w-8 items-center justify-center transition hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
