'use client';

import {
  Activity,
  Briefcase,
  ChefHat,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
  Settings,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

/** Placeholder until comments API exposes pending count. */
const PENDING_COMMENTS_COUNT = 0;

const NAV: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
  badgeAlwaysVisible?: boolean;
}> = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/issues', label: 'Issues', icon: Newspaper },
  {
    href: '/comments',
    label: 'Comments',
    icon: MessageSquare,
    badgeCount: PENDING_COMMENTS_COUNT,
    badgeAlwaysVisible: true,
  },
  { href: '/subscribers', label: 'Subscribers', icon: Users },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/hobbies', label: 'Hobbies', icon: Target },
  { href: '/recipes', label: 'Recipes', icon: ChefHat },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/system-logs', label: 'System Logs', icon: Activity },
];

function isNavActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 md:flex-row md:pb-0">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">{`Eva's Admin`}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map(({ href, label, icon: Icon, badgeCount, badgeAlwaysVisible }) => {
            const active = isNavActive(href, pathname);
            const showBadge =
              typeof badgeCount === 'number' &&
              (badgeAlwaysVisible === true || badgeCount > 0);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {showBadge ? (
                  <span
                    className={cn(
                      'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums',
                      badgeCount > 0
                        ? active
                          ? 'bg-white/25 text-white'
                          : 'bg-amber-100 text-amber-900'
                        : active
                          ? 'bg-white/15 text-white/80'
                          : 'bg-zinc-100 text-zinc-500',
                    )}
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-zinc-200 bg-white px-2 py-2 md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon, badgeCount, badgeAlwaysVisible }) => {
          const active = isNavActive(href, pathname);
          const showBadge =
            typeof badgeCount === 'number' &&
            (badgeAlwaysVisible === true || badgeCount > 0);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center rounded-lg py-2 transition-colors',
                active ? 'text-zinc-900' : 'text-zinc-500',
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'text-zinc-900')} aria-hidden />
              {showBadge ? (
                <span
                  className={cn(
                    'absolute right-2 top-0.5 min-w-[1rem] rounded-full px-1 py-px text-center text-[10px] font-bold tabular-nums leading-none text-white',
                    badgeCount > 0 ? 'bg-amber-500' : 'bg-zinc-400',
                  )}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">{`Eva's Admin`}</h1>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
