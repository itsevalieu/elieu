# Phase 8 — Analytics, Ads, Ko-fi & Admin Dashboard

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`, `frontend/portfolio/`, `frontend/admin/`, `backend/newsletter-api/`  
**Depends on:** Phase 4, Phase 6, Phase 7

## Goal

Full admin dashboard with content metrics, subscriber analytics, system health monitoring, and audit history. Add Google Analytics, AdSense, and Ko-fi to the public sites.

---

## Tasks

### Google Analytics 4

- [ ] Create GA4 property and get Measurement ID
- [ ] Add GA4 script to `frontend/newsletter` and `frontend/portfolio` via Next.js `Script` component
- [ ] Custom event tracking:
  - [ ] Layout toggle (newspaper ↔ magazine)
  - [ ] Category page click
  - [ ] Excerpt → article click-through
  - [ ] Share button click (by type: copy, native, social)
  - [ ] Reaction submitted
  - [ ] Comment submitted
  - [ ] Subscribe form submit
  - [ ] Ko-fi button click
- [ ] Privacy: respect `prefers-reduced-tracking`, add cookie consent notice if required

### Google AdSense

- [ ] Apply for AdSense and add verification meta tag
- [ ] Ad slot components built into both layout grids:
  - [ ] Sidebar ad slot (newspaper layout)
  - [ ] Between-section ad slot (both layouts)
  - [ ] Article page footer ad slot
- [ ] `show_ads` toggle per issue in admin — can disable ads for specific issues

### Ko-fi

- [ ] Ko-fi embed widget in newsletter sidebar and article page footer ("Support this newsletter")
- [ ] Optional Ko-fi goal widget on front page
- [ ] `ko_fi_url` setting in admin Settings page — no code change needed to update

### Admin Dashboard (`/` in `frontend/admin`)

**Content Overview Cards**
- [ ] Total posts (published / draft / archived)
- [ ] Posts this month vs last month
- [ ] Drafts in progress with last-edited time
- [ ] Upcoming/scheduled posts

**Post Performance Table**
- [ ] Columns: title, category, views, unique visitors, reactions (emoji breakdown on hover), comment count, shares, published date
- [ ] Sortable by any column; filterable by category/status/date range
- [ ] 30-day sparkline per post
- [ ] Click-through rate: excerpt impressions vs article opens

**Engagement Feed**
- [ ] Live activity log — new comments (pending), new reactions, new subscribers — reverse chronological
- [ ] Quick-action buttons: approve comment, view post
- [ ] Polls every 60s

**Subscriber Metrics**
- [ ] Total confirmed subscribers + growth chart (weekly/monthly)
- [ ] Recent signups with source page
- [ ] Unsubscribe rate per issue send
- [ ] Email open rate + click rate per issue

**System Health Panel**
- [ ] Live status tiles for: newsletter-api, portfolio-api, PostgreSQL, S3, SES
- [ ] Powered by `GET /api/health` on each service — green/yellow/red
- [ ] API error rate chart (errors/hour, last 7 days, by endpoint)
- [ ] SES bounce rate + complaint rate gauges with threshold warnings

**System Log Viewer (`/system-logs`)**
- [ ] Filterable by severity (ERROR/WARN/INFO), service, time range
- [ ] Stack trace expandable inline
- [ ] Clear old logs button (manual, admin only)
- [ ] Email alert setting — configure errors/hour threshold; alert fires to admin email via SES

**Audit Log Viewer (`/audit-log`)**
- [ ] Full history of every admin action: timestamp, action type, entity, detail
- [ ] Searchable by action type, entity, date range
- [ ] Read-only — no deletion of audit records

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
