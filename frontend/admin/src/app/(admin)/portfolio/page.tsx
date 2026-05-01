'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Achievement } from '@evalieu/common';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { portfolioApi } from '@/lib/api';

type PortfolioProjectApi = {
  id: number;
  name: string;
  description: string | null;
  achievements?: PortfolioAchievementApi[] | null;
};

type PortfolioAchievementApi = Pick<Achievement, 'title' | 'context'> & {
  id: number;
  date: string;
  photoUrl?: string | null;
};

const achievementSchema = z.object({
  title: z.string().min(1, 'Required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  context: z.string().optional(),
  photoUrl: z
    .string()
    .optional()
    .refine((s) => !s?.trim() || /^https?:\/\//i.test(s.trim()), { message: 'Must be http(s) URL or empty' }),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

export default function PortfolioAdminPage() {
  const { data: projects, isLoading, error } = useSWR('/api/projects', () =>
    portfolioApi.get<PortfolioProjectApi[]>('/api/projects'),
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [achievementOpen, setAchievementOpen] = useState(false);
  const invalidate = useCallback(() => void mutate('/api/projects'), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      date: new Date().toISOString().slice(0, 10),
      context: '',
      photoUrl: '',
    },
  });

  const selectedProject = projects?.find((p) => p.id === selectedId) ?? null;
  const achievements = selectedProject?.achievements ?? [];

  async function submitAchievement(form: AchievementFormValues) {
    if (selectedProject == null) return;
    const body = {
      title: form.title.trim(),
      date: form.date,
      context: form.context?.trim() || '',
      photoUrl: form.photoUrl?.trim() || null,
    };
    await portfolioApi.post(`/api/projects/${selectedProject.id}/achievements`, body);
    reset({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      context: '',
      photoUrl: '',
    });
    setAchievementOpen(false);
    await invalidate();
  }

  const columns: DataTableColumn<PortfolioProjectApi>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      cell: (row) => <span className="font-semibold">{row.name}</span>,
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      cell: (row) => (
        <span className="line-clamp-2 max-w-xl" title={row.description ?? undefined}>
          {row.description?.trim() ? row.description : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <Button
          type="button"
          variant={selectedId === row.id ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedId(row.id)}
        >
          {selectedId === row.id ? 'Selected' : 'View'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Portfolio</h1>
        <Button type="button" variant="secondary" size="sm" disabled={selectedProject == null} onClick={() => setAchievementOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Add achievement
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load portfolio projects.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={projects ?? []}
        isLoading={isLoading}
        emptyLabel="No projects."
        page={0}
        totalPages={1}
        totalElements={projects?.length ?? 0}
        pageSize={Math.max(projects?.length ?? 10, 10)}
        onPageChange={() => {}}
        showPagination={false}
      />

      {selectedProject ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">{selectedProject.name}</h2>
              <p className="mt-1 text-sm text-zinc-600">{selectedProject.description || 'No description.'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-800">Achievements ({achievements.length})</p>
            <ul className="mt-3 divide-y divide-zinc-100">
              {achievements.length === 0 ? (
                <li className="py-8 text-center text-sm text-zinc-500">No achievements yet.</li>
              ) : (
                achievements.map((a) => (
                  <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-zinc-900">{a.title}</p>
                      <p className="text-xs text-zinc-500">{a.date}</p>
                      {a.context ? <p className="mt-1 text-sm text-zinc-700">{a.context}</p> : null}
                      {a.photoUrl ? (
                        <a href={a.photoUrl} className="mt-1 text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          Photo link
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      ) : (
        <p className="text-sm text-zinc-500">Select a project row to inspect achievements.</p>
      )}

      <Modal
        open={achievementOpen}
        title={`Add achievement${selectedProject ? ` — ${selectedProject.name}` : ''}`}
        onClose={() => setAchievementOpen(false)}
      >
        {selectedProject == null ? (
          <p className="text-sm text-zinc-600">Pick a project first.</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(submitAchievement)}>
            <Input label="Title" required {...register('title')} error={errors.title?.message} />
            <Input label="Date" type="date" required {...register('date')} error={errors.date?.message} />
            <Textarea label="Context" rows={4} {...register('context')} error={errors.context?.message} />
            <Input label="Photo URL" type="url" {...register('photoUrl')} error={errors.photoUrl?.message} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setAchievementOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save achievement'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
