// components/ui/DataTable/DataTable.tsx
import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  enableFilter?: boolean;
  filterOptions?: FilterOption[];
  filterKey?: string;
  enablePagination?: boolean;
  meta?: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  currentPage?: number;
  onPageChange?: (page: number, search?: string, filter?: string) => void;
  actions?: (row: TData) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function DataTable<TData>({
  data,
  columns,
  loading = false,
  enableSearch = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  enableFilter = false,
  filterOptions = [],
  filterKey = '',
  enablePagination = false,
  meta,
  currentPage = 1,
  onPageChange,
  actions,
  emptyMessage = 'No data found',
  loadingMessage = 'Loading...',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== globalFilter) {
        setGlobalFilter(searchInput);
        if (onPageChange) {
          onPageChange(1, searchInput, selectedFilter);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, selectedFilter, onPageChange]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    if (onPageChange) {
      onPageChange(1, globalFilter, value);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage, globalFilter, selectedFilter);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const searchLower = filterValue.toLowerCase();
      return searchFields.some(field => {
        const value = row.getValue(field);
        return value && String(value).toLowerCase().includes(searchLower);
      });
    },
  });

  const totalPages = meta?.lastPage || 1;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {(enableSearch || enableFilter) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {enableSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            )}
            {enableFilter && filterOptions.length > 0 && (
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          <ChevronUp className={`w-3 h-3 ${header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <ChevronDown className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
               </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="mt-2 text-gray-500">{loadingMessage}</div>
                 </td>
               </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                 </td>
               </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                     </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {actions(row.original)}
                     </td>
                  )}
                 </tr>
              ))
            )}
          </tbody>
         </table>
      </div>

      {enablePagination && meta && meta.total > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * meta.perPage) + 1} to {Math.min(currentPage * meta.perPage, meta.total)} of {meta.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}