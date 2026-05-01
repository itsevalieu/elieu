'use client';

import type { PagedResponse, SystemLog } from '@evalieu/common';
import { Fragment, useMemo, useState } from 'react';
import useSWR from 'swr';

import { Button } from '@/components/ui/Button';
import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type SeverityTab = '' | 'ERROR' | 'WARN' | 'INFO';

function severityBadgeClass(sev: string): string {
  switch (sev) {
    case 'ERROR':
      return 'bg-red-100 text-red-900 ring-red-600/15';
    case 'WARN':
      return 'bg-amber-100 text-amber-900 ring-amber-600/15';
    case 'INFO':
      return 'bg-sky-100 text-sky-900 ring-sky-600/15';
    default:
      return 'bg-zinc-100 text-zinc-800 ring-zinc-600/15';
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

export default function SystemLogsPage() {
  const [severity, setSeverity] = useState<SeverityTab>('');
  const [page, setPage] = useState(0);
  const size = 50;
  const [expanded, setExpanded] = useState<number | null>(null);

  const swrPath = useMemo(() => {
    const q = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (severity) q.set('severity', severity);
    return `/api/admin/system-logs?${q}`;
  }, [page, severity]);

  const { data, error, isLoading } = useSWR<PagedResponse<SystemLog>>(swrPath, () =>
    newsletterApi.get<PagedResponse<SystemLog>>(swrPath),
  );

  const tabs: { id: SeverityTab; label: string }[] = [
    { id: '', label: 'All' },
    { id: 'ERROR', label: 'ERROR' },
    { id: 'WARN', label: 'WARN' },
    { id: 'INFO', label: 'INFO' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">System logs</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Runtime diagnostics from newsletter-api — expand a row for the full payload.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {tabs.map((t) => {
          const active = severity === t.id;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setSeverity(t.id);
                setPage(0);
                setExpanded(null);
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-red-600">Unable to load system logs.</p> : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-semibold text-zinc-700">Severity</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Service</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Message</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Endpoint</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            ) : !data?.content?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No logs for this filter.
                </td>
              </tr>
            ) : (
              data.content.map((log) => (
                <Fragment key={log.id}>
                  <tr
                    className={cn(
                      'cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50',
                      expanded === log.id ? 'bg-zinc-50' : '',
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpanded((v) => (v === log.id ? null : log.id))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpanded((v) => (v === log.id ? null : log.id));
                      }
                    }}
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                          severityBadgeClass(log.severity),
                        )}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="max-w-[8rem] px-4 py-3 align-top font-mono text-xs text-zinc-800">
                      {log.service}
                    </td>
                    <td className="max-w-md px-4 py-3 align-top text-zinc-800">
                      <span className="line-clamp-2" title={log.message}>
                        {truncate(log.message, 180)}
                      </span>
                    </td>
                    <td className="max-w-[10rem] px-4 py-3 align-top text-xs text-zinc-600">
                      {log.endpoint ? (
                        <span className="line-clamp-2 break-all">{log.endpoint}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs whitespace-nowrap text-zinc-500">
                      {new Date(log.loggedAt).toLocaleString()}
                    </td>
                  </tr>
                  {expanded === log.id ? (
                    <tr className="bg-zinc-50">
                      <td colSpan={5} className="space-y-3 px-4 py-5 text-zinc-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Full message
                        </p>
                        <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 text-xs leading-relaxed">
                          {log.message}
                        </pre>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Stack trace
                        </p>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 text-xs text-red-950 leading-relaxed">
                          {log.stackTrace?.trim()?.length ? log.stackTrace : '—'}
                        </pre>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          {!data?.content?.length ? ' ' : `${data.totalElements ?? 0} total entries`}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 0 || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading || !data || page >= ((data.totalPages ?? 1) - 1) || data.totalElements === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
