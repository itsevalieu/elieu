'use client';

import type { Hobby, HobbyProgressEntry } from '@evalieu/common';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const HOBBY_CATEGORIES = [
  'woodworking',
  'watercolor',
  'gardening',
  'coding',
  'gamedev',
  'writing',
  'reading',
  'watching',
  'other',
] as const;

const HOBBY_LIST_KEY = '/api/hobbies' as const;

const hobbySchema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.enum([
    'woodworking',
    'watercolor',
    'gardening',
    'coding',
    'gamedev',
    'writing',
    'reading',
    'watching',
    'other',
  ]),
  startedAt: z.string().optional(),
});

type HobbyFormValues = z.infer<typeof hobbySchema>;

const entrySchema = z.object({
  entryDate: z.string().min(1, 'Required'),
  note: z.string().optional(),
  milestone: z.boolean(),
  photoUrl: z.string().optional(),
});

type EntryFormValues = z.infer<typeof entrySchema>;

export default function HobbiesAdminPage() {
  const { data: hobbiesRaw, error, isLoading } = useSWR(HOBBY_LIST_KEY, () =>
    newsletterApi.get<Hobby[]>(HOBBY_LIST_KEY),
  );

  const hobbies = useMemo(
    () =>
      (hobbiesRaw ?? []).map((h) => ({
        ...h,
        entries: Array.isArray(h.entries) ? h.entries : [],
      })),
    [hobbiesRaw],
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = selectedId != null ? hobbies.find((h) => h.id === selectedId) : undefined;
  const detailKey =
    selectedId != null ? (`/api/hobbies/${selectedId}` as const) : null;

  const { data: detailHobby } = useSWR(
    detailKey,
    detailKey ? () => newsletterApi.get<Hobby>(detailKey) : null,
  );

  const activeHobby = detailHobby ?? selected;

  const [hobbyModalOpen, setHobbyModalOpen] = useState(false);
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
  const [deletingHobbyId, setDeletingHobbyId] = useState<number | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

  const invalidateHobbies = useCallback(
    () => void mutate((k: unknown) => typeof k === 'string' && k.startsWith('/api/hobbies')),
    [],
  );

  const {
    register: registerHobby,
    handleSubmit: handleSubmitHobby,
    reset: resetHobby,
    formState: { errors: hobbyErrors, isSubmitting: hobbySubmitting },
  } = useForm<HobbyFormValues>({
    resolver: zodResolver(hobbySchema),
    defaultValues: {
      name: '',
      category: 'other',
      startedAt: '',
    },
  });

  const {
    register: registerEntry,
    handleSubmit: handleSubmitEntry,
    reset: resetEntry,
    formState: { errors: entryErrors, isSubmitting: entrySubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      entryDate: '',
      note: '',
      milestone: false,
      photoUrl: '',
    },
  });

  function openNewHobby() {
    setEditingHobby(null);
    resetHobby({
      name: '',
      category: 'other',
      startedAt: '',
    });
    setHobbyModalOpen(true);
  }

  function openEditHobby(row: Hobby) {
    setEditingHobby(row);
    resetHobby({
      name: row.name,
      category: row.category as HobbyFormValues['category'],
      startedAt: row.startedAt ? row.startedAt.slice(0, 10) : '',
    });
    setHobbyModalOpen(true);
  }

  async function onSubmitHobby(values: HobbyFormValues) {
    const startedAt = values.startedAt?.trim() || null;
    const body = {
      name: values.name.trim(),
      category: values.category,
      startedAt,
    };

    if (editingHobby) {
      await newsletterApi.put<Hobby>(`/api/admin/hobbies/${editingHobby.id}`, body);
    } else {
      await newsletterApi.post<Hobby>('/api/admin/hobbies', body);
    }

    setHobbyModalOpen(false);
    await invalidateHobbies();
  }

  async function confirmDeleteHobby(id: number) {
    await newsletterApi.delete(`/api/admin/hobbies/${id}`);
    setDeletingHobbyId(null);
    if (selectedId === id) setSelectedId(null);
    await invalidateHobbies();
  }

  function openAddEntry() {
    resetEntry({
      entryDate: new Date().toISOString().slice(0, 10),
      note: '',
      milestone: false,
      photoUrl: '',
    });
    setEntryModalOpen(true);
  }

  async function onSubmitEntry(values: EntryFormValues) {
    if (selectedId == null) return;
    await newsletterApi.post<HobbyProgressEntry>(`/api/admin/hobbies/${selectedId}/entries`, {
      entryDate: values.entryDate,
      note: values.note?.trim() || null,
      milestone: values.milestone,
      photoUrl: values.photoUrl?.trim() || null,
    });
    setEntryModalOpen(false);
    await invalidateHobbies();
    await mutate(`/api/hobbies/${selectedId}`);
  }

  async function confirmDeleteEntry(entryId: number) {
    await newsletterApi.delete(`/api/admin/hobbies/entries/${entryId}`);
    setDeletingEntryId(null);
    await invalidateHobbies();
    if (selectedId != null) await mutate(`/api/hobbies/${selectedId}`);
  }

  const entries = useMemo(() => {
    const list = Array.isArray(activeHobby?.entries) ? activeHobby!.entries : [];
    return [...list].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    );
  }, [activeHobby]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Hobbies</h1>
        <Button type="button" onClick={openNewHobby}>
          Add Hobby
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load hobbies.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">Your hobbies</h2>
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : hobbies.length === 0 ? (
            <p className="text-sm text-zinc-500">No hobbies yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {hobbies.map((h) => {
                const count = Array.isArray(h.entries) ? h.entries.length : 0;
                const sel = selectedId === h.id;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(h.id)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                        sel
                          ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900 ring-offset-2'
                          : 'border-zinc-200 bg-white hover:border-zinc-300',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-zinc-900">{h.name}</span>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                          {count} {count === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">{h.category}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Started{' '}
                        {h.startedAt ? new Date(h.startedAt).toLocaleDateString() : '—'}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          {selectedId == null ? (
            <p className="text-sm text-zinc-500">Select a hobby to view and edit entries.</p>
          ) : !activeHobby ? (
            <p className="text-sm text-zinc-500">Loading hobby…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">{activeHobby.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500 capitalize">{activeHobby.category}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="secondary" size="sm" aria-label="Edit hobby" onClick={() => openEditHobby(activeHobby)}>
                    <Pencil className="size-4" aria-hidden />
                  </Button>
                  <Button type="button" variant="danger" size="sm" aria-label="Delete hobby" onClick={() => setDeletingHobbyId(activeHobby.id)}>
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <h3 className="text-sm font-medium text-zinc-700">Progress</h3>
                <Button type="button" size="sm" onClick={openAddEntry}>
                  Add Entry
                </Button>
              </div>

              {entries.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">No entries yet.</p>
              ) : (
                <ul className="space-y-4">
                  {entries.map((e) => (
                    <li key={e.id} className="rounded-lg border border-zinc-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <time className="text-sm font-medium text-zinc-800">
                            {new Date(e.entryDate).toLocaleDateString()}
                          </time>
                          {e.note ? (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{e.note}</p>
                          ) : (
                            <p className="mt-2 text-sm italic text-zinc-400">No note</p>
                          )}
                          {e.milestone ? (
                            <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                              Milestone
                            </span>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-start gap-3">
                          {e.photoUrl ? (
                            <Image
                              src={e.photoUrl}
                              alt=""
                              width={80}
                              height={80}
                              className="h-20 w-20 rounded-md object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-100 text-[10px] text-zinc-400">
                              No photo
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            aria-label="Delete entry"
                            onClick={() => setDeletingEntryId(e.id)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <Modal
        open={hobbyModalOpen}
        title={editingHobby ? 'Edit hobby' : 'New hobby'}
        onClose={() => setHobbyModalOpen(false)}
        className="max-w-md"
      >
        <form onSubmit={handleSubmitHobby(onSubmitHobby)} className="space-y-4">
          <Input label="Name" required {...registerHobby('name')} error={hobbyErrors.name?.message} />
          <Select label="Category" required {...registerHobby('category')} error={hobbyErrors.category?.message}>
            {HOBBY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Started" type="date" {...registerHobby('startedAt')} error={hobbyErrors.startedAt?.message} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setHobbyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={hobbySubmitting}>
              {hobbySubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={entryModalOpen} title="New progress entry" onClose={() => setEntryModalOpen(false)} className="max-w-md">
        <form onSubmit={handleSubmitEntry(onSubmitEntry)} className="space-y-4">
          <Input label="Date" type="date" required {...registerEntry('entryDate')} error={entryErrors.entryDate?.message} />
          <Textarea label="Note" rows={4} {...registerEntry('note')} error={entryErrors.note?.message} />
          <div className="flex items-center gap-2">
            <input id="milestone" type="checkbox" className="rounded border-zinc-300 text-zinc-900" {...registerEntry('milestone')} />
            <label htmlFor="milestone" className="text-sm text-zinc-700">
              Milestone
            </label>
          </div>
          <Input label="Photo URL" type="url" {...registerEntry('photoUrl')} error={entryErrors.photoUrl?.message} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={entrySubmitting}>
              {entrySubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deletingHobbyId != null} title="Delete hobby?" onClose={() => setDeletingHobbyId(null)}>
        <p className="text-sm text-zinc-600">This removes the hobby and all progress entries.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setDeletingHobbyId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => deletingHobbyId != null && void confirmDeleteHobby(deletingHobbyId)}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal open={deletingEntryId != null} title="Delete entry?" onClose={() => setDeletingEntryId(null)}>
        <p className="text-sm text-zinc-600">This progress entry cannot be recovered.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setDeletingEntryId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => deletingEntryId != null && void confirmDeleteEntry(deletingEntryId)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
