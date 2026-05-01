'use client';

import { useCallback, useRef, useState } from 'react';
import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const NEWSLETTER_API = process.env.NEXT_PUBLIC_NEWSLETTER_API_URL || 'http://localhost:8081';
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type PresignResult = { uploadUrl: string; objectUrl: string };

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export function ImageUpload({ value, onChange, label = 'Image', className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const upload = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE) {
      setError('File must be under 10 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const presign = await newsletterApi.post<PresignResult>('/api/admin/media/presign', {
        filename: file.name,
        contentType: file.type,
      });

      await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      onChange(presign.objectUrl);
      setPreview(presign.objectUrl);
    } catch {
      setError('Upload failed — try again');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-zinc-800">{label}</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
          uploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100',
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-auto rounded object-contain"
          />
        ) : (
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        )}
        <span className="text-sm text-zinc-500">
          {uploading ? 'Uploading...' : 'Click or drop an image'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {value && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={value}
            className="flex-1 truncate rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-600"
          />
          <button
            type="button"
            onClick={() => { onChange(''); setPreview(null); }}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
