'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { slugifyForGameFolder } from '@/lib/gameSlug';
import { newsletterApi } from '@/lib/api';

type RowStatus =
  | { phase: 'idle' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'done' }
  | { phase: 'error'; message: string };

type QueueRow = { id: string; file: File; status: RowStatus };

type GamePresignResponse = {
  uploadUrl: string;
  objectUrl: string;
  assetsBaseUrl?: string | null;
};

function putWithProgress(
  uploadUrl: string,
  body: Blob,
  contentType: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((100 * evt.loaded) / evt.total));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed (network)'));
    xhr.send(body);
  });
}

function rowId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

type Props = {
  /** Resolved post slug when editing; otherwise derive from title in the parent. */
  suggestedSlug: string;
  /** Called after a successful batch with the public `games/{slug}/` HTTPS prefix (no trailing slash guarantee). */
  onBaseUrlResolved?: (assetsBaseUrl: string) => void;
  /** Suggested playable URL when assets include `index.html`. */
  onSuggestGameUrl?: (entryUrl: string) => void;
};

export function GameFileUpload({ suggestedSlug, onBaseUrlResolved, onSuggestGameUrl }: Props) {
  const [folderSlug, setFolderSlug] = useState(suggestedSlug);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [lastAssetsBase, setLastAssetsBase] = useState<string | null>(null);
  const [hasIndexHtml, setHasIndexHtml] = useState(false);

  useEffect(() => {
    setFolderSlug(suggestedSlug);
  }, [suggestedSlug]);

  const onDrop = useCallback((accepted: File[]) => {
    setQueue((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      const next = [...prev];
      for (const file of accepted) {
        const id = rowId(file);
        if (seen.has(id)) continue;
        seen.add(id);
        next.push({ id, file, status: { phase: 'idle' } });
      }
      return next;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const uploadAll = async () => {
    const slug = folderSlug.trim() || slugifyForGameFolder('');
    const snapshot = [...queue];
    if (snapshot.length === 0) return;
    setBatchRunning(true);
    let assetsBase: string | null = null;
    let sawIndex = false;

    try {
      for (let i = 0; i < snapshot.length; i++) {
        const row = snapshot[i];
        const { file } = row;
        const applyStatus = (status: RowStatus) => {
          setQueue((prev) =>
            prev.map((r) => (r.id === row.id ? { ...r, status } : r)),
          );
        };

        applyStatus({ phase: 'uploading', progress: 0 });
        try {
          const contentType = file.type || 'application/octet-stream';
          const presign = await newsletterApi.post<GamePresignResponse>('/api/admin/media/presign-game', {
            gameSlug: slug,
            filename: file.name,
            contentType,
          });
          if (presign.assetsBaseUrl) {
            assetsBase = presign.assetsBaseUrl;
          }
          await putWithProgress(presign.uploadUrl, file, contentType, (p) =>
            applyStatus({ phase: 'uploading', progress: p }),
          );
          applyStatus({ phase: 'done' });
          const lower = file.name.toLowerCase();
          if (lower.endsWith('index.html') || lower.endsWith('index.htm')) {
            sawIndex = true;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Upload failed';
          applyStatus({ phase: 'error', message: msg });
        }
      }

      setHasIndexHtml(sawIndex);
      if (assetsBase) {
        setLastAssetsBase(assetsBase);
        onBaseUrlResolved?.(assetsBase);
      }
    } finally {
      setBatchRunning(false);
    }
  };

  const clearFinished = () => {
    setQueue((prev) => prev.filter((r) => r.status.phase !== 'done'));
  };

  const clearAll = () => {
    setQueue([]);
    setLastAssetsBase(null);
    setHasIndexHtml(false);
  };

  const applyIndexGameUrl = () => {
    if (!lastAssetsBase) return;
    const base = lastAssetsBase.endsWith('/') ? lastAssetsBase : `${lastAssetsBase}/`;
    onSuggestGameUrl?.(`${base}index.html`);
  };

  return (
    <div className="space-y-4 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">Game file uploads</h2>
        <p className="mt-1 text-xs text-zinc-600">
          Files upload to{' '}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px]">games/</code>
          … on the configured bucket. Use an entry HTML path as <strong>Game URL</strong> (often{' '}
          <code className="text-[11px]">…/index.html</code>
          ).
        </p>
      </div>

      <Input
        label="Upload folder slug"
        value={folderSlug}
        onChange={(e) => setFolderSlug(e.target.value)}
        placeholder={slugifyForGameFolder('my-game')}
      />

      <div
        {...getRootProps()}
        className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-600 outline-none transition hover:border-zinc-400 hover:bg-zinc-50 ${isDragActive ? 'border-amber-400 bg-amber-50/60' : ''}`}
      >
        <input {...getInputProps()} />
        Drop game assets here or click to select (multi-file).
      </div>

      {queue.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {queue.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-white px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-800">{row.file.name}</span>
              <span className="shrink-0 text-xs text-zinc-500">
                {row.status.phase === 'idle' ? 'Queued' : null}
                {row.status.phase === 'uploading' ? `${row.status.progress}%` : null}
                {row.status.phase === 'done' ? (
                  <span className="text-emerald-600">Uploaded</span>
                ) : null}
                {row.status.phase === 'error' ? <span className="text-red-600">{row.status.message}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => uploadAll()} disabled={batchRunning || queue.length === 0}>
          {batchRunning ? 'Uploading…' : 'Upload all'}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={clearFinished} disabled={batchRunning}>
          Clear uploaded
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={clearAll} disabled={batchRunning}>
          Clear list
        </Button>
        {lastAssetsBase && hasIndexHtml ? (
          <Button type="button" variant="secondary" size="sm" onClick={applyIndexGameUrl}>
            Set Game URL → index.html
          </Button>
        ) : null}
      </div>

      {lastAssetsBase ? (
        <p className="break-all font-mono text-[11px] text-zinc-600">
          <span className="font-semibold text-zinc-800">Assets base:</span> {lastAssetsBase}
        </p>
      ) : null}
    </div>
  );
}
