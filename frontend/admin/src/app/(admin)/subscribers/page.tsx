'use client';

import type { PagedResponse } from '@evalieu/common';
import { useCallback, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { newsletterApi } from '@/lib/api';

type SubscriberRow = {
  id: number;
  email: string;
  displayName: string | null;
  status: string;
  confirmedAt?: string | null;
  createdAt?: string;
};

export default function SubscribersPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const swrKey = `/api/admin/subscribers?page=${page}&size=${size}` as const;

  const { data, error, isLoading } = useSWR(swrKey, () =>
    newsletterApi.get<PagedResponse<SubscriberRow>>(swrKey),
  );

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const invalidate = useCallback(() => void mutate((k: unknown) => typeof k === 'string' && k.startsWith('/api/admin/subscribers')), []);

  async function confirmDelete(id: number) {
    setDeleting(true);
    try {
      await newsletterApi.delete(`/api/admin/subscribers/${id}`);
      setConfirmId(null);
      await invalidate();
    } finally {
      setDeleting(false);
    }
  }

  const columns: DataTableColumn<SubscriberRow>[] = [
    { id: 'email', header: 'Email', cell: (r) => <span className="font-medium">{r.email}</span> },
    {
      id: 'name',
      header: 'Display name',
      cell: (r) => r.displayName ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: 'confirmed',
      header: 'Confirmed date',
      cell: (r) =>
        r.confirmedAt ? new Date(r.confirmedAt).toLocaleString() : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (r) => (
        <Button type="button" variant="danger" size="sm" onClick={() => setConfirmId(r.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Subscribers</h1>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load subscribers.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="No subscribers yet."
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        pageSize={size}
        onPageChange={(p) => setPage(Math.max(0, p))}
        onPageSizeChange={(next) => {
          setPage(0);
          setSize(next);
        }}
      />

      <Modal open={confirmId != null} title="Delete subscriber?" onClose={() => !deleting && setConfirmId(null)}>
        <p className="text-sm text-zinc-600">Remove this email from the mailing list.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={deleting} onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={deleting} onClick={() => confirmId != null && void confirmDelete(confirmId)}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
