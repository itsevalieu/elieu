'use client';

import type { PagedResponse, Post, Recipe } from '@evalieu/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const rowSchema = z.object({
  text: z.string().min(1, 'Cannot be empty'),
});

const recipeSchema = z.object({
  name: z.string().min(1, 'Required'),
  ingredients: z.array(rowSchema).min(1, 'At least one ingredient'),
  steps: z.array(rowSchema).min(1, 'At least one step'),
  cookTime: z.string().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  photoUrl: z.string().optional(),
  dateMade: z.string().optional(),
  postId: z.string().optional(),
});

type RecipeForm = z.infer<typeof recipeSchema>;

function recipesKey(page: number, size: number) {
  return `/api/recipes?page=${page}&size=${size}` as const;
}

function StarRow({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-zinc-400">—</span>;
  return (
    <span className="inline-flex gap-0.5" aria-label={`Rating ${rating} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'size-4 shrink-0',
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200',
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function RecipesAdminPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const swrKey = recipesKey(page, size);

  const { data, error, isLoading } = useSWR(swrKey, () =>
    newsletterApi.get<PagedResponse<Recipe>>(swrKey),
  );

  const { data: postsData } = useSWR(`/api/admin/posts?page=0&size=500`, () =>
    newsletterApi.get<PagedResponse<Post>>('/api/admin/posts?page=0&size=500'),
  );
  const postOptions = postsData?.content ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const invalidate = useCallback(
    () =>
      void mutate((k: unknown) => typeof k === 'string' && k.startsWith('/api/recipes?')),
    [],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      ingredients: [{ text: '' }],
      steps: [{ text: '' }],
      cookTime: '',
      rating: null,
      photoUrl: '',
      dateMade: '',
      postId: '',
    },
  });

  const watchedRating = watch('rating');

  const {
    fields: ingFields,
    append: appendIng,
    remove: removeIng,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: 'steps' });

  function mapRecipeToForm(r: Recipe) {
    return {
      name: r.name,
      ingredients: r.ingredients.length ? r.ingredients.map((text) => ({ text })) : [{ text: '' }],
      steps: r.steps.length ? r.steps.map((text) => ({ text })) : [{ text: '' }],
      cookTime: r.cookTime ?? '',
      rating: r.rating ?? null,
      photoUrl: r.photoUrl ?? '',
      dateMade: r.dateMade ? r.dateMade.slice(0, 10) : '',
      postId: r.postId != null ? String(r.postId) : '',
    } satisfies RecipeForm;
  }

  function openNew() {
    setEditing(null);
    reset({
      name: '',
      ingredients: [{ text: '' }],
      steps: [{ text: '' }],
      cookTime: '',
      rating: null,
      photoUrl: '',
      dateMade: '',
      postId: '',
    });
    setModalOpen(true);
  }

  function openEdit(row: Recipe) {
    setEditing(row);
    reset(mapRecipeToForm(row));
    setModalOpen(true);
  }

  async function onSubmit(values: RecipeForm) {
    const ingredients = values.ingredients.map((r) => r.text.trim()).filter(Boolean);
    const steps = values.steps.map((r) => r.text.trim()).filter(Boolean);
    if (ingredients.length === 0 || steps.length === 0) return;

    const pidStr = values.postId?.trim();
    const pidNum = pidStr ? Number(pidStr) : NaN;

    const body: Record<string, unknown> = {
      name: values.name.trim(),
      ingredients,
      steps,
      cookTime: values.cookTime?.trim() || null,
      photoUrl: values.photoUrl?.trim() || null,
      dateMade: values.dateMade?.trim() || null,
      postId: Number.isFinite(pidNum) && pidNum > 0 ? pidNum : null,
      rating:
        values.rating != null && Number.isFinite(values.rating) && values.rating >= 1 && values.rating <= 5
          ? values.rating
          : null,
    };

    if (editing) {
      await newsletterApi.put<Recipe>(`/api/admin/recipes/${editing.id}`, body);
    } else {
      await newsletterApi.post<Recipe>('/api/admin/recipes', body);
    }

    setModalOpen(false);
    await invalidate();
  }

  async function confirmDelete(id: number) {
    await newsletterApi.delete(`/api/admin/recipes/${id}`);
    setDeletingId(null);
    await invalidate();
  }

  const columns: DataTableColumn<Recipe>[] = [
    { id: 'name', header: 'Name', cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: 'cookTime', header: 'Cook Time', cell: (row) => row.cookTime ?? '—' },
    {
      id: 'rating',
      header: 'Rating',
      cell: (row) => <StarRow rating={row.rating} />,
    },
    {
      id: 'dateMade',
      header: 'Date Made',
      cell: (row) => (row.dateMade ? new Date(row.dateMade).toLocaleDateString() : '—'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button type="button" variant="danger" size="sm" aria-label={`Delete ${row.name}`} onClick={() => setDeletingId(row.id)}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Recipes</h1>
        <Button type="button" onClick={openNew}>
          New Recipe
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load recipes.
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        emptyLabel="No recipes yet."
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

      <Modal open={modalOpen} title={editing ? 'Edit recipe' : 'New recipe'} onClose={() => setModalOpen(false)} className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
          <Input label="Name" required {...register('name')} error={errors.name?.message} />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Ingredients</label>
            {ingFields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <Input
                  className="flex-1"
                  aria-label={`Ingredient ${i + 1}`}
                  {...register(`ingredients.${i}.text`)}
                  error={errors.ingredients?.[i]?.text?.message}
                />
                <Button type="button" variant="secondary" onClick={() => removeIng(i)} disabled={ingFields.length <= 1}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => appendIng({ text: '' })}>
              Add ingredient
            </Button>
            {typeof errors.ingredients?.message === 'string' ? (
              <p className="text-sm text-red-600">{errors.ingredients.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">Steps</label>
            {stepFields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <span className="mt-3 w-6 shrink-0 text-sm font-semibold text-zinc-400">{i + 1}.</span>
                <Textarea
                  className="min-h-[4rem] flex-1"
                  rows={3}
                  {...register(`steps.${i}.text`)}
                  error={errors.steps?.[i]?.text?.message}
                />
                <Button type="button" variant="secondary" className="self-start" onClick={() => removeStep(i)} disabled={stepFields.length <= 1}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => appendStep({ text: '' })}>
              Add step
            </Button>
            {errors.steps?.message ? (
              <p className="text-sm text-red-600">{String(errors.steps.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Cook time" placeholder="e.g. 45 min" {...register('cookTime')} error={errors.cookTime?.message} />
            <Input label="Date made" type="date" {...register('dateMade')} error={errors.dateMade?.message} />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-zinc-700">Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue('rating', watchedRating === n ? null : n)}
                  className="rounded-lg border border-zinc-200 p-2 transition-colors hover:bg-zinc-50"
                  aria-pressed={watchedRating != null && watchedRating >= n}
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={cn(
                      'size-7',
                      watchedRating != null && n <= watchedRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300',
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
            {(watchedRating == null || watchedRating === 0) ? (
              <p className="mt-1 text-xs text-zinc-500">
                Tap the same star level again to clear the rating (optional).
              </p>
            ) : null}
            {errors.rating?.message ? <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p> : null}
          </div>

          <Input label="Photo URL" type="url" {...register('photoUrl')} error={errors.photoUrl?.message} />

          <Select label="Link to post (optional)" {...register('postId')} error={errors.postId?.message}>
            <option value="">None</option>
            {postOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.slug})
              </option>
            ))}
          </Select>

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

      <Modal open={deletingId != null} title="Delete recipe?" onClose={() => setDeletingId(null)}>
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
