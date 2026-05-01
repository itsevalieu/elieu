'use client';

import { FileEdit, MessageSquarePlus, Newspaper, Users } from 'lucide-react';
import useSWR from 'swr';

import { newsletterApi } from '@/lib/api';

type Overview = {
  totalPublished: number;
  totalDrafts: number;
  totalArchived: number;
  totalSubscribers: number;
  pendingComments: number;
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Newspaper;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
        <Icon className="h-6 w-6 text-zinc-800" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR('/api/admin/stats/overview', () =>
    newsletterApi.get<Overview>('/api/admin/stats/overview'),
  );

  if (error) {
    return <p className="text-red-600">Unable to load dashboard stats.</p>;
  }

  if (isLoading || !data) {
    return <p className="text-zinc-500">Loading overview…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Newspaper} label="Total published" value={data.totalPublished} />
        <StatCard icon={FileEdit} label="Total drafts" value={data.totalDrafts} />
        <StatCard icon={Users} label="Subscribers" value={data.totalSubscribers} />
        <StatCard icon={MessageSquarePlus} label="Pending comments" value={data.pendingComments} />
      </div>
    </div>
  );
}
