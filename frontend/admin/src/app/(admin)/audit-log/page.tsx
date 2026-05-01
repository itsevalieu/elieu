'use client';

import type { AdminAuditLog, PagedResponse } from '@evalieu/common';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { newsletterApi } from '@/lib/api';

const AUDIT_ACTIONS = [
  '',
  'ADMIN_LOGIN',
  'POST_CREATE',
  'POST_UPDATE',
  'POST_DELETE',
  'COMMENT_APPROVE',
  'COMMENT_REJECT',
  'COMMENT_DELETE',
  'SITE_SETTING_UPDATE',
  'SITE_SETTINGS_REPLACE',
  'ISSUE_CREATE',
  'ISSUE_UPDATE',
  'ISSUE_DELETE',
  'NEWSLETTER_SEND',
  'HOBBY_CREATE',
  'HOBBY_UPDATE',
  'HOBBY_DELETE',
  'HOBBY_ENTRY_CREATE',
  'HOBBY_ENTRY_DELETE',
  'RECIPE_CREATE',
  'RECIPE_UPDATE',
  'RECIPE_DELETE',
  'RECOMMENDATION_REVIEWED',
] as const;

const ENTITY_TYPES = [
  '',
  'Post',
  'Comment',
  'Issue',
  'SiteSetting',
  'AdminUser',
  'Hobby',
  'HobbyProgressEntry',
  'Recipe',
  'Recommendation',
] as const;

function detailPreview(d: Record<string, unknown> | null): string {
  if (!d || typeof d !== 'object') return '—';
  try {
    return JSON.stringify(d).slice(0, 220);
  } catch {
    return '…';
  }
}

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');

  const swrPath = useMemo(() => {
    const q = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (actionFilter) q.set('action', actionFilter);
    if (entityFilter) q.set('entityType', entityFilter);
    return `/api/admin/audit-log?${q}`;
  }, [page, size, actionFilter, entityFilter]);

  const { data, error, isLoading } = useSWR<PagedResponse<AdminAuditLog>>(swrPath, () =>
    newsletterApi.get<PagedResponse<AdminAuditLog>>(swrPath),
  );

  const columns: DataTableColumn<AdminAuditLog>[] = [
    {
      id: 'action',
      header: 'Action',
      accessor: 'action',
      cell: (row) => <span className="font-medium text-zinc-900">{row.action}</span>,
    },
    {
      id: 'entityType',
      header: 'Entity',
      accessor: 'entityType',
    },
    {
      id: 'entityId',
      header: 'Entity ID',
      accessor: 'entityId',
      cell: (row) => (row.entityId != null ? String(row.entityId) : '—'),
    },
    {
      id: 'detail',
      header: 'Detail',
      accessor: 'detail',
      cell: (row) => (
        <code className="block max-w-md truncate rounded bg-zinc-100 px-2 py-1 text-[11px] text-zinc-800">
          {detailPreview(row.detail)}
        </code>
      ),
    },
    {
      id: 'performedAt',
      header: 'Timestamp',
      accessor: 'performedAt',
      cell: (row) => (
        <span className="whitespace-nowrap text-zinc-600">
          {new Date(row.performedAt).toLocaleString()}
        </span>
      ),
    },
  ];

  function resetFilters() {
    setActionFilter('');
    setEntityFilter('');
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Audit log</h1>
          <p className="mt-1 text-sm text-zinc-600">Immutable trace of authenticated admin mutations.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Action"
          value={actionFilter}
          onChange={(e) => {
            setPage(0);
            setActionFilter(e.target.value);
          }}
        >
          <option value="">All actions</option>
          {AUDIT_ACTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        <Select
          label="Entity type"
          value={entityFilter}
          onChange={(e) => {
            setPage(0);
            setEntityFilter(e.target.value);
          }}
        >
          <option value="">All entities</option>
          {ENTITY_TYPES.filter(Boolean).map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      {error ? <p className="text-red-600">Unable to load audit log.</p> : null}

      <DataTable<AdminAuditLog>
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="No audit entries matched these filters."
        page={page}
        totalPages={data?.totalPages ?? 1}
        totalElements={data?.totalElements ?? 0}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPage(0);
          setSize(s);
        }}
      />
    </div>
  );
}
