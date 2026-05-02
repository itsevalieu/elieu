'use client';

import { cn } from '@/lib/utils';

const green = new Set(['published', 'approved', 'confirmed']);
const blue = new Set(['scheduled']);
const yellow = new Set(['draft', 'pending']);
const red = new Set(['archived', 'rejected', 'unsubscribed']);

function toneFor(status: string) {
  const s = status.trim().toLowerCase();
  if (green.has(s)) return 'green';
  if (blue.has(s)) return 'blue';
  if (yellow.has(s)) return 'yellow';
  if (red.has(s)) return 'red';
  return 'neutral';
}

const toneCls: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-900 ring-emerald-600/20',
  blue: 'bg-blue-100 text-blue-900 ring-blue-600/20',
  yellow: 'bg-amber-100 text-amber-900 ring-amber-600/20',
  red: 'bg-red-100 text-red-800 ring-red-600/20',
  neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-500/15',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = toneFor(status);
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        toneCls[tone],
      )}
    >
      {status}
    </span>
  );
}
