'use client';

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  ChefHat,
  FileText,
  LogIn,
  MessageSquare,
  Minus,
  Newspaper,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

import { newsletterApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type TopPostRow = {
  id: number;
  title: string;
  slug: string;
  viewCount: number;
  totalReactions: number;
  commentCount: number;
  publishedAt: string | null;
};

type RecentActivityRow = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  performedAt: string;
};

type SubscriberPoint = {
  month: string;
  cumulativeTotalConfirmed: number;
};

type DashboardOverview = {
  postsByStatus: Record<string, number>;
  totalSubscribersConfirmed: number;
  pendingComments: number;
  postsPublishedLast30Days: number;
  newSubscribersLast30Days: number;
  newSubscribersPrev30DaysWindow: number;
  postsPublishedPrev30DaysWindow: number;
  systemErrorsLast24h: number;
  systemWarningsLast24h: number;
  systemErrorsPrev24h: number;
  systemWarningsPrev24h: number;
  topPostsPublishedLast30Days: TopPostRow[];
  recentActivity: RecentActivityRow[];
  subscriberGrowth: SubscriberPoint[];
};

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d);
}

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function trendMeta(current: number, previous: number): { label: string; dir: 'up' | 'down' | 'flat' } {
  if (current === previous) {
    return { label: 'Flat vs prior window', dir: 'flat' };
  }
  if (previous === 0) {
    return { label: current > 0 ? 'New activity' : 'No prior data', dir: current > 0 ? 'up' : 'flat' };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct > 0 ? '+' : '';
  return { label: `${sign}${pct}% vs prior window`, dir: pct > 0 ? 'up' : 'down' };
}

function activityIconForAction(action: string): LucideIcon {
  if (action.startsWith('POST')) return FileText;
  if (action.startsWith('COMMENT')) return MessageSquare;
  if (action.startsWith('SITE')) return Settings;
  if (action.startsWith('ISSUE')) return BookOpen;
  if (action.startsWith('RECIPE') || action.startsWith('HOBBY')) return ChefHat;
  if (action.startsWith('NEWSLETTER')) return Newspaper;
  if (action.startsWith('RECOMMENDATION')) return Sparkles;
  if (action === 'ADMIN_LOGIN') return LogIn;
  return Activity;
}

function TrendCue({ dir }: { dir: 'up' | 'down' | 'flat' }) {
  const Icon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const cls =
    dir === 'up' ? 'text-emerald-600' : dir === 'down' ? 'text-amber-700' : 'text-zinc-400';
  return <Icon className={cn('h-4 w-4', cls)} aria-hidden />;
}

type StatTone = 'neutral' | 'good' | 'attention' | 'danger';

function OverviewStatCard({
  label,
  value,
  trendLabel,
  trendDir,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  trendLabel: string;
  trendDir: 'up' | 'down' | 'flat';
  icon: LucideIcon;
  tone: StatTone;
}) {
  const border =
    tone === 'danger'
      ? 'border-red-200 bg-red-50/40'
      : tone === 'attention'
        ? 'border-amber-200 bg-amber-50/35'
        : tone === 'good'
          ? 'border-emerald-200 bg-emerald-50/30'
          : 'border-zinc-200 bg-white';
  const iconBg =
    tone === 'danger'
      ? 'bg-red-100 text-red-800'
      : tone === 'attention'
        ? 'bg-amber-100 text-amber-900'
        : tone === 'good'
          ? 'bg-emerald-100 text-emerald-900'
          : 'bg-zinc-100 text-zinc-800';

  return (
    <div className={cn('flex gap-4 rounded-xl border p-5 shadow-sm', border)}>
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <TrendCue dir={trendDir} />
          <span>{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}

function SubscriberBars({ points }: { points: SubscriberPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.cumulativeTotalConfirmed));
  const chartPx = 160;
  return (
    <div className="mt-4 flex gap-2">
      {points.map((p) => {
        const barH = Math.max(16, Math.round((p.cumulativeTotalConfirmed / max) * chartPx));
        return (
          <div key={p.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="flex w-full max-w-[3rem] flex-col justify-end"
              style={{ height: chartPx }}
            >
              <div
                className="w-full rounded-md bg-zinc-800"
                style={{ height: barH }}
                title={`${p.month}: ${p.cumulativeTotalConfirmed}`}
                role="img"
                aria-label={`${p.month}: ${p.cumulativeTotalConfirmed} cumulative subscribers`}
              />
            </div>
            <span className="truncate text-center text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              {p.month.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR('/api/admin/stats/overview', () =>
    newsletterApi.get<DashboardOverview>('/api/admin/stats/overview'),
  );

  const { data: topPostsData } = useSWR('/api/admin/stats/top-posts?limit=10', () =>
    newsletterApi.get<TopPostRow[]>('/api/admin/stats/top-posts?limit=10'),
  );

  if (error) {
    return <p className="text-red-600">Unable to load dashboard stats.</p>;
  }

  if (isLoading || !data) {
    return <p className="text-zinc-500">Loading overview…</p>;
  }

  const published = data.postsByStatus.published ?? 0;
  const postTrend = trendMeta(data.postsPublishedLast30Days, data.postsPublishedPrev30DaysWindow);
  const subTrend = trendMeta(data.newSubscribersLast30Days, data.newSubscribersPrev30DaysWindow);
  const errTrend = trendMeta(data.systemErrorsLast24h, data.systemErrorsPrev24h);

  const pendingTone: StatTone =
    data.pendingComments === 0 ? 'good' : data.pendingComments > 8 ? 'attention' : 'neutral';
  const errorsTone: StatTone =
    data.systemErrorsLast24h === 0 ? 'good' : data.systemErrorsLast24h > 5 ? 'danger' : 'attention';

  const topPostsTable: TopPostRow[] = topPostsData ?? data.topPostsPublishedLast30Days;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600">Overview, traffic signals, and recent admin activity.</p>
        </div>
      </header>

      <section aria-labelledby="stat-cards">
        <h2 id="stat-cards" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewStatCard
            icon={Newspaper}
            label="Published posts"
            value={published}
            trendLabel={`${data.postsPublishedLast30Days} published last 30 days · ${postTrend.label}`}
            trendDir={postTrend.dir}
            tone="neutral"
          />
          <OverviewStatCard
            icon={Users}
            label="Confirmed subscribers"
            value={data.totalSubscribersConfirmed}
            trendLabel={`${data.newSubscribersLast30Days} new (30d) · ${subTrend.label}`}
            trendDir={subTrend.dir}
            tone="good"
          />
          <OverviewStatCard
            icon={Sparkles}
            label="Pending comments"
            value={data.pendingComments}
            trendLabel={
              data.pendingComments === 0 ? 'Inbox clear' : 'Awaiting moderation'
            }
            trendDir="flat"
            tone={pendingTone}
          />
          <OverviewStatCard
            icon={ShieldAlert}
            label="System errors (24h)"
            value={data.systemErrorsLast24h}
            trendLabel={`${data.systemWarningsLast24h} warnings · ${errTrend.label}`}
            trendDir={errTrend.dir}
            tone={errorsTone}
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Top posts</h2>
              <p className="mt-1 text-xs text-zinc-500">
                All-time views among published posts. Until the rankings load, rows show last-30-days leaders from the overview.
              </p>
            </div>
            <span className="hidden shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:inline">
              By views
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">Views</th>
                  <th className="pb-2 pr-4">Reactions</th>
                  <th className="pb-2 pr-4">Comments</th>
                  <th className="pb-2">Published</th>
                </tr>
              </thead>
              <tbody>
                {topPostsTable.length === 0 ? (
                  <tr>
                    <td className="py-6 text-zinc-500" colSpan={5}>
                      No published posts yet.
                    </td>
                  </tr>
                ) : (
                  topPostsTable.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                      <td className="max-w-xs py-3 pr-4 font-medium text-zinc-900">
                        <Link
                          href={`/posts/edit/${row.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-zinc-700">{row.viewCount}</td>
                      <td className="py-3 pr-4 tabular-nums text-zinc-700">{row.totalReactions}</td>
                      <td className="py-3 pr-4 tabular-nums text-zinc-700">{row.commentCount}</td>
                      <td className="py-3 text-zinc-600">{formatShortDate(row.publishedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">System health</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">Errors · last 24h</dt>
              <dd className={cn('font-semibold tabular-nums', errorsTone === 'good' ? 'text-emerald-700' : 'text-red-700')}>
                {data.systemErrorsLast24h}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">Warnings · last 24h</dt>
              <dd className="font-semibold tabular-nums text-amber-800">{data.systemWarningsLast24h}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">Draft / archived</dt>
              <dd className="tabular-nums text-zinc-800">
                {(data.postsByStatus.draft ?? 0) + (data.postsByStatus.archived ?? 0)} total
              </dd>
            </div>
          </dl>
          <Link
            href="/system-logs"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            <Activity className="h-4 w-4" aria-hidden />
            Open system logs
          </Link>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">Recent activity</h2>
            <Link
              href="/audit-log"
              className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline"
            >
              Full audit log
            </Link>
          </div>
          <ol className="relative mt-6 space-y-4 border-l border-zinc-200 pl-6">
            {data.recentActivity.length === 0 ? (
              <li className="text-sm text-zinc-500">No audit entries yet.</li>
            ) : (
              data.recentActivity.map((item) => {
                const ActIcon = activityIconForAction(item.action);
                return (
                  <li key={item.id} className="relative">
                    <span
                      className="absolute -left-[13px] top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-zinc-800 shadow-sm"
                      aria-hidden
                    >
                      <ActIcon className="h-3.5 w-3.5 shrink-0" />
                    </span>
                    <p className="text-sm font-medium text-zinc-900">{item.description}</p>
                    <p className="text-xs text-zinc-500">{formatRelative(item.performedAt)}</p>
                  </li>
                );
              })
            )}
          </ol>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Subscriber growth</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Cumulative confirmed subscribers at month end (UTC). Chart placeholder — Tremor can replace this later.
          </p>
          {data.subscriberGrowth.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No subscriber history yet.</p>
          ) : (
            <SubscriberBars points={data.subscriberGrowth} />
          )}
        </section>
      </div>
    </div>
  );
}
