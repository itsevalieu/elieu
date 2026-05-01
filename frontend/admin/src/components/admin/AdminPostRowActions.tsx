'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { newsletterApi } from '@/lib/api';

type Props = {
  postId: number;
  onDeleted?: () => void;
};

export function AdminPostActions({ postId, onDeleted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await newsletterApi.delete(`/api/admin/posts/${postId}`);
      setConfirmOpen(false);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/posts/edit/${postId}`}
        className="inline-flex rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
      >
        Edit
      </Link>
      <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
        Delete
      </Button>
      <Modal open={confirmOpen} title="Delete post?" onClose={() => setConfirmOpen(false)}>
        <p className="text-sm text-zinc-600">This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={deleting} onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
