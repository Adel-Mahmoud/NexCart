import React, { useState, useMemo, ReactNode, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../table";
import Button from "../button/Button";
import { Search, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export interface Column<T> {
  key: keyof T | "actions";
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface DataTableProps<T> {
  data?: T[];
  columns: Column<T>[];
  loading?: boolean;

  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];

  enableFilter?: boolean;
  filterOptions?: FilterOption[];
  filterKey?: keyof T;

  enablePagination?: boolean;
  meta?: Meta | null;
  currentPage?: number;
  onPageChange?: (page: number, searchTerm?: string, filterValue?: string) => void;

  actions?: (item: T) => ReactNode;

  emptyMessage?: string;
  loadingMessage?: string;
  tableClassName?: string;
  title?: string;
  onRefresh?: () => void;
}

const DataTable = <T extends Record<string, any>>({
  data = [],
  columns,
  loading = false,

  enableSearch = true,
  searchPlaceholder = "بحث...",
  searchFields = [],

  enableFilter = false,
  filterOptions = [],
  filterKey,
  enablePagination = true,
  meta = null,
  currentPage = 1,
  onPageChange,

  actions,

  emptyMessage = "لا توجد بيانات",
  loadingMessage = "جاري التحميل...",
  tableClassName = "",
  title,
  onRefresh,
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (enablePagination && onPageChange) {
      onPageChange(1, debouncedSearch, filterValue);
    }
  }, [debouncedSearch, filterValue]);

  const processedData = useMemo(() => {
    if (enablePagination) return safeData;

    let result = safeData;

    if (enableSearch && debouncedSearch.trim()) {
      const lower = debouncedSearch.toLowerCase();
      const fields = searchFields.length
        ? searchFields
        : (Object.keys(result[0] || {}) as (keyof T)[]);

      result = result.filter((item) =>
        fields.some((field) =>
          String(item[field] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    if (enableFilter && filterValue !== "all" && filterKey) {
      result = result.filter(
        (item) => String(item[filterKey]) === filterValue
      );
    }

    return result;
  }, [
    safeData,
    debouncedSearch,
    filterValue,
    searchFields,
    filterKey,
    enableSearch,
    enableFilter,
    enablePagination,
  ]);

  const filteredData = useMemo(() => {
    if (!enableFilter || filterValue === "all" || !filterKey) {
      return processedData;
    }

    return processedData.filter(
      (item) => String(item[filterKey]) === filterValue
    );
  }, [processedData, enableFilter, filterValue, filterKey]);

  const displayedData = useMemo(() => {
    return enablePagination ? safeData : filteredData;
  }, [enablePagination, safeData, filteredData]);

  const renderCell = (item: T, column: Column<T>) => {
    if (column.key === "actions" && actions) return actions(item);
    if (column.render) return column.render(item);
    return String(item[column.key] ?? "");
  };

  const goToPage = (page: number) => {
    if (!meta || !onPageChange) return;
    if (page >= 1 && page <= meta.last_page) {
      onPageChange(page, searchTerm, filterValue);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  const getPageNumbers = () => {
    if (!meta) return [];
    const pages = [];
    const lastPage = meta.last_page;
    const current = currentPage;

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(lastPage);
      } else if (current >= lastPage - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = lastPage - 4; i <= lastPage; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(lastPage);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Header with title and refresh */}
      {(title || onRefresh) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Search and Filter Bar */}
      {(enableSearch || enableFilter) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {enableSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {enableFilter && filterOptions.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none cursor-pointer"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-sm">
        <div className="overflow-x-auto">
          <Table className={`min-w-full ${tableClassName}`}>
            <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    isHeader
                    className={`px-4 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300 ${col.className || ""}`}
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{loadingMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                      {(searchTerm || filterValue !== "all") && (
                        <button
                          onClick={clearSearch}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          مسح الفلتر
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedData.map((item, i) => (
                  <TableRow
                    key={item.id || i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${col.className || ""}`}
                      >
                        {renderCell(item, col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && meta && meta.last_page > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            عرض {((currentPage - 1) * meta.per_page) + 1} إلى{" "}
            {Math.min(currentPage * meta.per_page, meta.total)} من {meta.total} نتيجة
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, idx) => (
              page === -1 ? (
                <span key={`dots-${idx}`} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === meta.last_page}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;