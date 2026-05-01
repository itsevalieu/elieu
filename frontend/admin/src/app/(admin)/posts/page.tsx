'use client';

import type { PagedResponse, Post } from '@evalieu/common';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

import { AdminPostActions } from '@/components/admin/AdminPostRowActions';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { newsletterApi } from '@/lib/api';

function fetchPosts(page: number, size: number) {
  return newsletterApi.get<PagedResponse<Post>>(`/api/admin/posts?page=${page}&size=${size}`);
}

export default function PostsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const swrKey = `/api/admin/posts?page=${page}&size=${size}` as const;

  const { data, error, isLoading, mutate } = useSWR(swrKey, () => fetchPosts(page, size));

  const refetch = useCallback(() => void mutate(), [mutate]);

  const columns: DataTableColumn<Post>[] = [
    { id: 'title', header: 'Title', accessor: 'title', cell: (row) => <span className="font-medium">{row.title}</span> },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    { id: 'category', header: 'Category', accessor: 'categoryName' },
    { id: 'format', header: 'Format', accessor: 'format' },
    {
      id: 'publishedAt',
      header: 'Published',
      accessor: 'publishedAt',
      cell: (row) =>
        row.publishedAt ? new Date(row.publishedAt).toLocaleString() : '—',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => <AdminPostActions postId={row.id} onDeleted={refetch} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Posts</h1>
        <Link
          href="/posts/new"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
        >
          New post
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load posts.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="No posts yet."
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
    </div>
  );
}
