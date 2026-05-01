'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyLabel?: string;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** When false, footer pagination controls are hidden (full list in one view). */
  showPagination?: boolean;
};

function defaultCell<T>(row: T, column: DataTableColumn<T>) {
  if (column.cell) return column.cell(row);
  if (column.accessor != null) {
    const v = row[column.accessor];
    if (v == null) return '—';
    return String(v);
  }
  return null;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  emptyLabel = 'No rows yet.',
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showPagination = true,
}: DataTableProps<T>) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(totalElements, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id != null ? String(row.id) : i}
                  className={cn('border-b border-zinc-100 last:border-0', 'hover:bg-zinc-50/80')}
                >
                  {columns.map((col) => (
                    <td key={col.id} className="max-w-xs truncate px-4 py-3 text-zinc-800">
                      {defaultCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination ? (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          {totalElements === 0
            ? '0 results'
            : `Showing ${from}–${to} of ${totalElements}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onPageSizeChange ? (
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <span>Per page</span>
              <select
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 0 || isLoading}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[5rem] text-center text-sm tabular-nums text-zinc-700">
              Page {Math.min(totalPages || 1, page + 1)} / {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={
                isLoading ||
                totalPages <= 0 ||
                page >= totalPages - 1 ||
                totalElements === 0
              }
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
