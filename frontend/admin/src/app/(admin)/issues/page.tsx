'use client';

import type { PagedResponse } from '@evalieu/common';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { newsletterApi } from '@/lib/api';

type IssueRow = {
  id: number;
  title: string;
  month: number;
  year: number;
  status: string;
  layoutPreference: string;
  coverImageUrl: string | null;
};

const issueSchema = z.object({
  title: z.string().min(1, 'Required'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(1900).max(2200),
  layoutPreference: z.enum(['newspaper', 'magazine']),
  status: z.enum(['draft', 'published']),
  coverImageUrl: z.string().optional(),
});

type IssueForm = z.infer<typeof issueSchema>;

function fetchIssues(page: number, size: number) {
  return newsletterApi.get<PagedResponse<IssueRow>>(`/api/admin/issues?page=${page}&size=${size}`);
}

export default function IssuesAdminPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const swrKey = `/api/admin/issues?page=${page}&size=${size}` as const;

  const { data, error, isLoading } = useSWR(swrKey, () => fetchIssues(page, size));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IssueRow | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const revalidateIssues = useCallback(
    () => void mutate((k: string | undefined) => typeof k === 'string' && k.includes('/api/admin/issues')),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      layoutPreference: 'newspaper',
      status: 'draft',
      coverImageUrl: '',
    },
  });

  function openNew() {
    setEditing(null);
    reset({
      title: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      layoutPreference: 'newspaper',
      status: 'draft',
      coverImageUrl: '',
    });
    setModalOpen(true);
  }

  function openEdit(row: IssueRow) {
    setEditing(row);
    reset({
      title: row.title,
      month: row.month,
      year: row.year,
      layoutPreference: row.layoutPreference as IssueForm['layoutPreference'],
      status: row.status as IssueForm['status'],
      coverImageUrl: row.coverImageUrl ?? '',
    });
    setModalOpen(true);
  }

  async function onSubmit(values: IssueForm) {
    const body = {
      title: values.title,
      month: values.month,
      year: values.year,
      layoutPreference: values.layoutPreference,
      status: values.status,
      coverImageUrl: values.coverImageUrl?.trim() || null,
    };

    if (editing) {
      await newsletterApi.put(`/api/admin/issues/${editing.id}`, body);
    } else {
      await newsletterApi.post(`/api/admin/issues`, body);
    }
    setModalOpen(false);
    await revalidateIssues();
  }

  async function confirmDelete(id: number) {
    await newsletterApi.delete(`/api/admin/issues/${id}`);
    setDeletingId(null);
    await revalidateIssues();
  }

  const columns: DataTableColumn<IssueRow>[] = [
    { id: 'title', header: 'Title', cell: (row) => <span className="font-medium">{row.title}</span> },
    {
      id: 'period',
      header: 'Month / Year',
      cell: (row) => `${row.month} / ${row.year}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    { id: 'layout', header: 'Layout', accessor: 'layoutPreference' },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => setDeletingId(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Issues</h1>
        <Button type="button" onClick={openNew}>
          New issue
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load issues.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="No issues yet."
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

      <Modal
        open={modalOpen}
        title={editing ? 'Edit issue' : 'New issue'}
        onClose={() => setModalOpen(false)}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" required {...register('title')} error={errors.title?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Month" type="number" min={1} max={12} required {...register('month')} error={errors.month?.message} />
            <Input label="Year" type="number" min={1900} max={2200} required {...register('year')} error={errors.year?.message} />
          </div>
          <Select label="Layout" required {...register('layoutPreference')} error={errors.layoutPreference?.message}>
            <option value="newspaper">newspaper</option>
            <option value="magazine">magazine</option>
          </Select>
          <Select label="Status" required {...register('status')} error={errors.status?.message}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </Select>
          <Input label="Cover image URL" type="url" {...register('coverImageUrl')} error={errors.coverImageUrl?.message} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deletingId != null}
        title="Delete issue?"
        onClose={() => setDeletingId(null)}
      >
        <p className="text-sm text-zinc-600">This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => deletingId != null && void confirmDelete(deletingId)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
