'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Category, Post } from '@evalieu/common';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import { GameFileUpload } from '@/components/admin/GameFileUpload';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { newsletterApi } from '@/lib/api';
import { slugifyForGameFolder } from '@/lib/gameSlug';
import { cn } from '@/lib/utils';

const FORMATS = [
  'article',
  'photo-caption',
  'embedded-game',
  'project-link',
  'list',
  'recipe',
  'tracking-entry',
  'quote',
] as const;

const LAYOUTS = ['featured', 'column', 'brief', 'sidebar', 'pull-quote'] as const;
const VIDEO_TYPES = ['hosted', 'youtube', 'vimeo'] as const;
const GAME_TYPES = ['iframe', 'canvas', 'link'] as const;

const idOrEmpty = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? '' : Number(v)),
  z.union([z.literal(''), z.number().positive()]),
);

export const postFormSchema = z
  .object({
    title: z.string().min(1, 'Required'),
    body: z.string().min(1, 'Required'),
    excerpt: z.string().optional(),
    categoryId: z.coerce.number().refine((n) => n > 0, 'Pick a category'),
    subcategoryId: idOrEmpty,
    format: z.enum(FORMATS),
    layoutHint: z.enum(LAYOUTS),
    status: z.enum(['draft', 'published', 'archived', 'scheduled']),
    scheduledAt: z.string().optional(),
    tags: z.string(),
    coverImageUrl: z.string().optional(),
    galleryUrls: z.array(z.string()),
    videoUrl: z.string().optional(),
    videoType: z.enum(VIDEO_TYPES),
    quoteAuthor: z.string().optional(),
    quoteSource: z.string().optional(),
    gameUrl: z.string().optional(),
    gameType: z.enum(GAME_TYPES),
    issueId: idOrEmpty,
  })
  .superRefine((data, ctx) => {
    if (data.format === 'quote') {
      if (!data.quoteAuthor?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required for quote format', path: ['quoteAuthor'] });
      }
    }
    if (data.format === 'embedded-game') {
      if (!data.gameUrl?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Required for embedded game', path: ['gameUrl'] });
      }
    }
    if (data.videoUrl?.trim()) {
      if (!data.videoType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pick a video type', path: ['videoType'] });
      }
    }
  });

export type PostFormValues = z.infer<typeof postFormSchema>;

function valuesFromPost(p: Post): PostFormValues {
  return {
    title: p.title,
    body: p.body,
    excerpt: p.excerpt ?? '',
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId && p.subcategoryId > 0 ? p.subcategoryId : '',
    format: p.format,
    layoutHint: p.layoutHint,
    status: p.status,
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt).toISOString().slice(0, 16) : '',
    tags: (p.tags ?? []).join(', '),
    coverImageUrl: p.coverImageUrl ?? '',
    galleryUrls: p.galleryUrls?.length ? [...p.galleryUrls] : [''],
    videoUrl: p.videoUrl ?? '',
    videoType: p.videoType ?? 'youtube',
    quoteAuthor: p.quoteAuthor ?? '',
    quoteSource: p.quoteSource ?? '',
    gameUrl: p.gameUrl ?? '',
    gameType: p.gameType ?? 'iframe',
    issueId: p.issueId && p.issueId > 0 ? p.issueId : '',
  };
}

const EMPTY: PostFormValues = {
  title: '',
  body: '',
  excerpt: '',
  categoryId: 0,
  subcategoryId: '',
  format: 'article',
  layoutHint: 'column',
  status: 'draft',
  scheduledAt: '',
  tags: '',
  coverImageUrl: '',
  galleryUrls: [''],
  videoUrl: '',
  videoType: 'youtube',
  quoteAuthor: '',
  quoteSource: '',
  gameUrl: '',
  gameType: 'iframe',
  issueId: '',
};

function toPayload(v: PostFormValues): Record<string, unknown> {
  const subId = v.subcategoryId === '' ? null : v.subcategoryId;
  const issueId = v.issueId === '' ? null : v.issueId;
  const tags = v.tags
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const galleryUrls = v.galleryUrls.map((s) => s.trim()).filter(Boolean);
  const hasVideo = Boolean(v.videoUrl?.trim());
  return {
    title: v.title.trim(),
    body: v.body,
    excerpt: v.excerpt?.trim() || null,
    categoryId: v.categoryId,
    subcategoryId: subId,
    format: v.format,
    layoutHint: v.layoutHint,
    status: v.status,
    tags,
    coverImageUrl: v.coverImageUrl?.trim() || null,
    galleryUrls,
    videoUrl: hasVideo ? v.videoUrl!.trim() : null,
    videoType: hasVideo ? v.videoType : null,
    quoteAuthor: v.format === 'quote' ? v.quoteAuthor?.trim() || null : null,
    quoteSource: v.format === 'quote' ? v.quoteSource?.trim() || null : null,
    gameUrl: v.format === 'embedded-game' ? v.gameUrl?.trim() || null : null,
    gameType: v.format === 'embedded-game' ? v.gameType : null,
    scheduledAt: v.status === 'scheduled' && v.scheduledAt ? new Date(v.scheduledAt).toISOString() : null,
    issueId,
  };
}

type AdminPostFormProps = {
  postId?: number;
  initialPost?: Post | null;
};

export function AdminPostForm({ postId, initialPost }: AdminPostFormProps) {
  const router = useRouter();
  const { data: categories } = useSWR<Category[]>('/api/categories', () =>
    newsletterApi.get<Category[]>('/api/categories'),
  );
  const { data: issuesPage } = useSWR('/api/admin/issues?size=200&page=0', () =>
    newsletterApi.get<{ content: { id: number; title: string; month: number; year: number }[] }>(
      '/api/admin/issues?size=200&page=0',
    ),
  );

  const defaultValues = useMemo(
    () => (initialPost ? valuesFromPost(initialPost) : EMPTY),
    [initialPost],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialPost) reset(valuesFromPost(initialPost));
  }, [initialPost, reset]);

  const galleryUrls = watch('galleryUrls');
  const categoryId = watch('categoryId');
  const format = watch('format');
  const titleWatch = watch('title');
  const gameUploadSlug = useMemo(
    () => initialPost?.slug ?? slugifyForGameFolder(titleWatch || ''),
    [initialPost?.slug, titleWatch],
  );

  const subcategories = useMemo(() => {
    const cat = categories?.find((c) => c.id === categoryId);
    return cat?.subcategories ?? [];
  }, [categories, categoryId]);

  async function onSubmit(values: PostFormValues) {
    const body = toPayload(values);
    if (postId != null) {
      await newsletterApi.put<Post>(`/api/admin/posts/${postId}`, body);
    } else {
      await newsletterApi.post<Post>('/api/admin/posts', body);
    }
    router.push('/posts');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">{postId ? 'Edit post' : 'New post'}</h1>
        <Button type="button" variant="secondary" onClick={() => router.push('/posts')}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Input label="Title" required {...register('title')} error={errors.title?.message} />
        <RichTextEditor
          label="Body"
          value={watch('body')}
          onChange={(md) => setValue('body', md, { shouldValidate: true })}
          error={errors.body?.message}
        />
        <Textarea label="Excerpt" rows={4} {...register('excerpt')} error={errors.excerpt?.message} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Category" required {...register('categoryId')} error={errors.categoryId?.message}>
            <option value={0}>Select category…</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Subcategory"
            {...register('subcategoryId')}
            error={errors.subcategoryId?.message as string | undefined}
            disabled={subcategories.length === 0}
          >
            <option value="">None</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Format" required {...register('format')} error={errors.format?.message}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select label="Layout hint" required {...register('layoutHint')} error={errors.layoutHint?.message}>
            {LAYOUTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" required {...register('status')} error={errors.status?.message}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="scheduled">scheduled</option>
            <option value="archived">archived</option>
          </Select>
          <Select label="Issue" {...register('issueId')} error={errors.issueId?.message as string | undefined}>
            <option value="">None</option>
            {issuesPage?.content?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title} ({i.month}/{i.year})
              </option>
            ))}
          </Select>
        </div>

        {watch('status') === 'scheduled' && (
          <Input
            label="Publish at"
            type="datetime-local"
            {...register('scheduledAt')}
            error={errors.scheduledAt?.message}
          />
        )}

        {initialPost?.previewToken && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-800">Preview link</p>
            <p className="mt-1 break-all text-xs text-blue-700">
              {typeof window !== 'undefined'
                ? `${window.location.protocol}//${window.location.hostname.replace('admin', 'newsletter')}:3001/preview/${initialPost.previewToken}`
                : `/preview/${initialPost.previewToken}`}
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
              onClick={() => {
                const base = process.env.NEXT_PUBLIC_NEWSLETTER_URL || `${window.location.protocol}//localhost:3001`;
                void navigator.clipboard.writeText(`${base}/preview/${initialPost.previewToken}`);
              }}
            >
              Copy link
            </button>
          </div>
        )}

        <Input label="Tags (comma-separated)" {...register('tags')} error={errors.tags?.message} />
        <ImageUpload
          label="Cover image"
          value={watch('coverImageUrl') ?? ''}
          onChange={(url) => setValue('coverImageUrl', url)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-800">Gallery URLs</p>
          {galleryUrls?.map((_, idx) => (
            <div key={`g-${idx}`} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="https://…"
                {...register(`galleryUrls.${idx}` as const)}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={!galleryUrls || galleryUrls.length <= 1}
                onClick={() => {
                  const list = galleryUrls ?? [''];
                  const next = list.filter((__, i) => i !== idx);
                  setValue('galleryUrls', next.length ? next : ['']);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setValue('galleryUrls', [...(galleryUrls ?? ['']), ''])}
          >
            Add gallery URL
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Video URL" type="url" {...register('videoUrl')} error={errors.videoUrl?.message} />
          <Select label="Video type" {...register('videoType')} error={errors.videoType?.message}>
            {VIDEO_TYPES.map((vt) => (
              <option key={vt} value={vt}>
                {vt}
              </option>
            ))}
          </Select>
        </div>

        <div className={cn('grid gap-4 sm:grid-cols-2', format !== 'quote' && 'hidden')}>
          <Input label="Quote author" {...register('quoteAuthor')} error={errors.quoteAuthor?.message} />
          <Input label="Quote source" {...register('quoteSource')} error={errors.quoteSource?.message} />
        </div>

        <div className={cn('grid gap-4 sm:grid-cols-2', format !== 'embedded-game' && 'hidden')}>
          <Input label="Game URL" type="url" {...register('gameUrl')} error={errors.gameUrl?.message} />
          <Select label="Game type" {...register('gameType')} error={errors.gameType?.message}>
            {GAME_TYPES.map((gt) => (
              <option key={gt} value={gt}>
                {gt}
              </option>
            ))}
          </Select>
        </div>

        {format === 'embedded-game' ? (
          <GameFileUpload suggestedSlug={gameUploadSlug} onSuggestGameUrl={(u) => setValue('gameUrl', u)} />
        ) : null}

        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : postId ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </div>
    </form>
  );
}
