'use client';

import type { Comment, PagedResponse } from '@evalieu/common';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type StatusTab = 'pending' | 'approved' | 'rejected';

export default function CommentsAdminPage() {
  const [tab, setTab] = useState<StatusTab>('pending');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const swrKey = `/api/admin/comments?status=${tab}&page=${page}&size=${size}` as const;

  const { data, error, isLoading } = useSWR<PagedResponse<Comment>>(swrKey, () =>
    newsletterApi.get<PagedResponse<Comment>>(swrKey),
  );

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const invalidate = useCallback(
    () => void mutate((k: unknown) => typeof k === 'string' && k.startsWith('/api/admin/comments')),
    [],
  );

  async function setStatus(commentId: number, status: 'approved' | 'rejected') {
    setBusyId(commentId);
    try {
      await newsletterApi.patch<Comment>(`/api/admin/comments/${commentId}`, { status });
      await invalidate();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(commentId: number) {
    setBusyId(commentId);
    try {
      await newsletterApi.delete(`/api/admin/comments/${commentId}`);
      setDeleteTarget(null);
      await invalidate();
    } finally {
      setBusyId(null);
    }
  }

  const columns: DataTableColumn<Comment>[] = [
    {
      id: 'author',
      header: 'Author',
      accessor: 'authorName',
      cell: (row) => <span className="font-medium">{row.authorName}</span>,
    },
    {
      id: 'post',
      header: 'Post',
      accessor: 'postId',
      cell: (row) => (
        <Link href={`/posts/edit/${row.postId}`} className="font-medium text-zinc-900 underline-offset-4 hover:underline">
          #{row.postId}
        </Link>
      ),
    },
    {
      id: 'body',
      header: 'Body',
      accessor: 'body',
      cell: (row) => (
        <span className="line-clamp-2 max-w-[20rem]" title={row.body}>
          {row.body}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          {tab === 'pending' ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => void setStatus(row.id, 'approved')}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => void setStatus(row.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          ) : tab === 'rejected' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busyId === row.id}
              onClick={() => void setStatus(row.id, 'approved')}
            >
              Approve
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={busyId === row.id}
              onClick={() => void setStatus(row.id, 'rejected')}
            >
              Reject
            </Button>
          )}
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={busyId === row.id}
            onClick={() => setDeleteTarget(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const tabs: { id: StatusTab; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Comments</h1>
      </div>

      <nav className="flex gap-2 border-b border-zinc-200">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setPage(0);
            }}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800',
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load comments.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="Nothing in this tab."
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

      <Modal open={deleteTarget != null} title="Delete comment?" onClose={() => setDeleteTarget(null)}>
        <p className="text-sm text-zinc-600">This permanently removes the comment.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busyId != null} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={busyId != null} onClick={() => deleteTarget != null && void remove(deleteTarget)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
