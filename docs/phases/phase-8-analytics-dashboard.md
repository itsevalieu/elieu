# Phase 8 — Analytics, Ads, Ko-fi & Admin Dashboard

**Status:** `[ ]` Not started
**Repo areas:** `frontend/newsletter/`, `frontend/portfolio/`, `frontend/admin/`, `backend/newsletter-api/`
**Depends on:** Phase 4, Phase 6, Phase 7

## Goal

Full admin dashboard with content metrics, subscriber analytics, system health monitoring, and audit history. Add Google Analytics, AdSense, and Ko-fi to the public sites.

---

## Architecture

```mermaid
flowchart TD
    subgraph dashboard [frontend/admin — Dashboard /]
        CO[Content Overview Cards]
        PP[Post Performance Table]
        EF[Engagement Feed]
        SM[Subscriber Metrics]
        SH[System Health Panel]
    end

    subgraph log_pages [frontend/admin — Log Pages]
        SL[/system-logs — Log Viewer]
        AL[/audit-log — Audit Viewer]
    end

    subgraph api [newsletter-api]
        STATS["/api/admin/stats/*"]
        HEALTH["/api/health"]
        LOGS_API["/api/admin/system-logs"]
        AUDIT_API["/api/admin/audit-log"]
    end

    subgraph external [External Services]
        GA[Google Analytics 4]
        ADS[Google AdSense]
        KOFI[Ko-fi Widget]
    end

    CO --> STATS
    PP --> STATS
    EF --> STATS
    SM --> STATS
    SH --> HEALTH
    SL --> LOGS_API
    AL --> AUDIT_API
```

## Technical Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| GA4 integration | `@next/third-parties` Google tag manager or direct `gtag.js` via `next/script` | Official Next.js integration; tree-shakeable |
| Custom events | `gtag('event', ...)` calls from client components | Standard GA4 custom events; no additional library |
| AdSense | `<ins class="adsbygoogle">` in dedicated `<AdSlot>` component | Standard AdSense embed; conditional rendering via admin setting |
| Ko-fi | Ko-fi button widget (JavaScript embed) + floating button | No backend; Ko-fi handles payment |
| Dashboard charts | Recharts (`AreaChart`, `BarChart`, `PieChart`) | Lightweight, composable, good for sparklines and time-series |
| Dashboard data | `/api/admin/stats/overview`, `/api/admin/stats/posts`, `/api/admin/stats/engagement` | Dedicated aggregation endpoints; cached for 5 minutes |
| Real-time updates | `useSWR` with `refreshInterval` | Engagement feed polls every 60s; health panel every 30s |

---

## Tasks

### 1. Admin Stats Endpoints — Backend

- [ ] **`StatsController.java`** — new controller in newsletter-api:

```java
@GetMapping("/api/admin/stats/overview")
public OverviewStats getOverview() {
    return OverviewStats.builder()
        .totalPublished(postRepo.countByStatus("published"))
        .totalDrafts(postRepo.countByStatus("draft"))
        .totalArchived(postRepo.countByStatus("archived"))
        .publishedThisMonth(postRepo.countPublishedSince(startOfMonth()))
        .publishedLastMonth(postRepo.countPublishedBetween(startOfLastMonth(), startOfMonth()))
        .totalSubscribers(subscriberRepo.countByStatus("confirmed"))
        .pendingComments(commentRepo.countByStatus("pending"))
        .build();
}

@GetMapping("/api/admin/stats/posts")
public PagedResponse<PostStats> getPostStats(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) String sortBy,    // views, reactions, comments
    @RequestParam(required = false) String category,
    @RequestParam(required = false) String dateRange   // 7d, 30d, 90d, all
) { ... }

@GetMapping("/api/admin/stats/engagement")
public List<EngagementEvent> getRecentEngagement(
    @RequestParam(defaultValue = "50") int limit
) {
    // Union of: recent pending comments + recent reactions + recent subscribers
    // Ordered by timestamp descending
}

@GetMapping("/api/admin/stats/subscribers")
public SubscriberStats getSubscriberStats() {
    return SubscriberStats.builder()
        .totalConfirmed(subscriberRepo.countByStatus("confirmed"))
        .weeklyGrowth(subscriberRepo.countConfirmedSince(daysAgo(7)))
        .monthlyGrowth(subscriberRepo.countConfirmedSince(daysAgo(30)))
        .recentSignups(subscriberRepo.findTop10ByStatusOrderByCreatedAtDesc("confirmed"))
        .build();
}
```

- [ ] **DTOs**: `OverviewStats`, `PostStats`, `EngagementEvent`, `SubscriberStats`

---

### 2. Admin Dashboard — Frontend (`frontend/admin/src/app/page.tsx`)

- [ ] **Content Overview Cards** — grid of stat cards:
  - Published / Drafts / Archived counts with icons
  - "Published this month" with comparison to last month (green arrow up or red arrow down)
  - Pending comments count (links to moderation queue)
  - Uses `useSWR('/api/admin/stats/overview', { refreshInterval: 300000 })`

- [ ] **Post Performance Table** — `@tanstack/react-table`:
  - Columns: title, category, views, unique visitors, reactions total, top emoji, comment count, shares, published date
  - Sort by clicking column headers
  - Filter toolbar: category dropdown, date range selector, status dropdown
  - Each row expandable to show emoji breakdown
  - 30-day view sparkline per post (Recharts `<Sparkline>` with `<AreaChart>`)

- [ ] **Engagement Feed** — real-time activity list:

```typescript
function EngagementFeed() {
  const { data } = useSWR('/api/admin/stats/engagement', { refreshInterval: 60000 });

  return (
    <ul>
      {data?.map(event => (
        <li key={event.id}>
          {event.type === 'comment' && <CommentEvent event={event} />}
          {event.type === 'reaction' && <ReactionEvent event={event} />}
          {event.type === 'subscriber' && <SubscriberEvent event={event} />}
        </li>
      ))}
    </ul>
  );
}
```

  - Comment events: "New comment on [Post Title] by [Author]" + approve button
  - Reaction events: "[Emoji] on [Post Title]"
  - Subscriber events: "New subscriber from [source page]"

- [ ] **Subscriber Metrics** — Recharts `<AreaChart>`:
  - X axis: weeks or months
  - Y axis: cumulative subscriber count
  - Tooltip: new subscribers that period, unsubscribe rate

- [ ] **System Health Panel** — grid of status tiles:

```typescript
function HealthPanel() {
  const { data } = useSWR('/api/health', { refreshInterval: 30000 });
  const { data: portfolioHealth } = useSWR('http://localhost:8080/api/health', { refreshInterval: 30000 });

  return (
    <div className="grid grid-cols-5 gap-4">
      <StatusTile label="Newsletter API" status={data?.status} />
      <StatusTile label="Portfolio API" status={portfolioHealth?.status} />
      <StatusTile label="PostgreSQL" status={data?.db} />
      <StatusTile label="S3" status={data?.s3} />
      <StatusTile label="SES" status={data?.ses} />
    </div>
  );
}
```

  - Green = healthy, yellow = degraded, red = down

---

### 3. System Log Viewer — `/system-logs`

- [ ] DataTable with columns: severity (color-coded badge), service, message (truncated), endpoint, timestamp
- [ ] Filter bar: severity dropdown, service dropdown, date range picker
- [ ] Click row to expand: full message + stack trace
- [ ] **Error rate chart** — Recharts `<BarChart>`: errors per hour, last 7 days, colored by endpoint
- [ ] **Email alert config**: threshold input (errors/hour) + admin email input; saves to site_settings

---

### 4. Audit Log Viewer — `/audit-log`

- [ ] DataTable: timestamp, action (badge), entity type, entity ID (link to entity), detail JSON
- [ ] Search: text search across action and entity type
- [ ] Filter: action type dropdown, entity type dropdown, date range
- [ ] Read-only — no delete actions

---

### 5. Google Analytics 4 — Public Sites

- [ ] **`frontend/newsletter/src/app/layout.tsx`** and **`frontend/portfolio/src/app/layout.tsx`**:

```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Layout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  );
}
```

- [ ] **Custom events** — `frontend/newsletter/src/lib/analytics.ts`:

```typescript
export function trackEvent(name: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}

// Usage:
trackEvent('layout_toggle', { from: 'newspaper', to: 'magazine' });
trackEvent('share_click', { type: 'copy', postSlug: 'my-post' });
trackEvent('reaction', { emoji: '❤️', postSlug: 'my-post' });
trackEvent('subscribe_submit', { source: 'sidebar' });
```

---

### 6. Google AdSense — Public Sites

- [ ] **`AdSlot.tsx`** component — `frontend/newsletter/src/components/shared/AdSlot.tsx`:

```typescript
export function AdSlot({ slot, format = 'auto' }: { slot: string; format?: string }) {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);

  return (
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
```

- [ ] Placement in newspaper layout: sidebar (1 slot), between sections (1 slot)
- [ ] Placement in magazine layout: between category strips (1 slot)
- [ ] Article page: footer (1 slot)
- [ ] `show_ads` setting per issue — admin can toggle off for specific issues

---

### 7. Ko-fi Widget

- [ ] **`KofiWidget.tsx`** — `frontend/newsletter/src/components/shared/KofiWidget.tsx`:
  - Fetches `ko_fi_url` from site settings (or hardcoded initially)
  - Renders Ko-fi button embed script
  - Placed in newsletter sidebar and article footer
  - Optional goal widget on front page (enabled via admin setting)

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
