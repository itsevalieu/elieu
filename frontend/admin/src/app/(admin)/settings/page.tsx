'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { newsletterApi } from '@/lib/api';

type Row = { key: string; value: string };

export default function SettingsPage() {
  const { data, error, isLoading } = useSWR('/api/admin/settings', () =>
    newsletterApi.get<Record<string, string>>('/api/admin/settings'),
  );

  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    setRows(next.map(([key, value]) => ({ key, value })));
  }, [data]);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  async function handleSave() {
    const payload: Record<string, string> = {};
    const seen = new Set<string>();

    for (const r of rows) {
      const k = r.key.trim();
      const v = r.value.trim();
      if (!k) continue;

      const lower = k.toLowerCase();

      if (seen.has(lower)) {
        alert(`Duplicate key "${k}"`);

        return;
      }
      seen.add(lower);
      payload[k] = v;
    }

    setSaving(true);
    try {
      await newsletterApi.put<Record<string, string>>('/api/admin/settings', payload);
      await mutate('/api/admin/settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Site settings</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setRows((r) => [...r, { key: '', value: '' }])}>
            Add row
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving || isLoading}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load settings.
        </p>
      ) : null}

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-600">No settings defined. Use &quot;Add row&quot;.</p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Input
                label="Key"
                value={row.key}
                onChange={(e) => updateRow(i, { key: e.target.value })}
                autoComplete="off"
              />
              <Input label="Value" value={row.value} onChange={(e) => updateRow(i, { value: e.target.value })} autoComplete="off" />
              <Button type="button" variant="danger" size="sm" className="sm:mb-px" onClick={() => removeRow(i)}>
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
