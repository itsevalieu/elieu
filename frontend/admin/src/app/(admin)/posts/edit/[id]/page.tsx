'use client';

import type { Post } from '@evalieu/common';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { AdminPostForm } from '@/components/admin/AdminPostForm';
import { newsletterApi } from '@/lib/api';

export default function EditPostPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, error, isLoading } = useSWR(
    Number.isFinite(id) ? `/api/admin/posts/${id}` : null,
    () => newsletterApi.get<Post>(`/api/admin/posts/${id}`),
  );

  if (!Number.isFinite(id)) {
    return <p className="text-red-600">Invalid post id.</p>;
  }

  if (error) return <p className="text-red-600">Could not load post.</p>;

  if (isLoading || !data) {
    return <p className="text-zinc-500">Loading post…</p>;
  }

  return <AdminPostForm postId={id} initialPost={data} />;
}
