# Phase 4 — Unified Admin App (PWA)

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/admin/` (new), `backend/newsletter-api/`, `backend/portfolio-api/`  
**Depends on:** Phase 1

## Goal

Build the standalone admin Next.js app that manages all content — newsletter posts, issues, portfolio projects, achievements — from a single login. Mobile-optimized and installable as a PWA.

---

## Tasks

### Project Setup

- [ ] Create `frontend/admin/` as a new Next.js 15 app
- [ ] Add to npm workspaces in root `package.json`
- [ ] Add to `turbo.json` build pipeline
- [ ] Configure `@evalieu/common` dependency
- [ ] Set up `src/lib/api.ts` — authenticated fetch wrapper (attaches JWT cookie)
- [ ] Set up `src/lib/auth.ts` — login, logout, token refresh, session check

### Auth

- [ ] Login page (`/login`) — email + password form, POST to `newsletter-api /api/auth/login`
- [ ] Middleware — redirect unauthenticated requests to `/login`
- [ ] Token refresh on expiry (silent refresh via `/api/auth/refresh`)
- [ ] Logout clears httpOnly cookie via `/api/auth/logout`

### Layout & Navigation

- [ ] `AdminShell` — sidebar nav + top bar wrapper for all admin pages
- [ ] Sidebar nav items: Dashboard, Posts, Issues, Comments, Subscribers, Portfolio, Hobbies & Tracking, Recipes, Settings, System Logs
- [ ] Pending comment count badge on Comments nav item (live, polls every 60s)
- [ ] Mobile-responsive sidebar (collapses to bottom nav on small screens)

### Newsletter — Posts

- [ ] Post list page (`/posts`) — table with title, category, status, published date, views, reactions, comment count; sortable + filterable
- [ ] New post page (`/posts/new`) — form with:
  - [ ] Title, excerpt fields
  - [ ] Category + subcategory selectors
  - [ ] Format selector (article, photo-caption, quote, recipe, etc.)
  - [ ] Layout hint selector (featured, column, brief, sidebar, pull-quote)
  - [ ] Issue assignment dropdown
  - [ ] Tag input
  - [ ] Markdown editor with live preview (TipTap or MDX Editor)
  - [ ] Cover image upload (drag-and-drop → S3 presigned URL)
  - [ ] Gallery image upload (multi-image)
  - [ ] Quote-specific fields (quote_author, quote_source) — shown when format = quote
  - [ ] Status toggle (draft / published)
  - [ ] Save draft + Publish buttons
- [ ] Edit post page (`/posts/[id]/edit`) — same form, pre-filled
- [ ] Delete / archive post action

### Newsletter — Issues

- [ ] Issue list page (`/issues`) — table with month/year, title, status, post count
- [ ] New/edit issue page — title, month, year, layout preference, cover image, status
- [ ] Issue builder — drag-and-drop reorder posts within an issue, preview front page layout
- [ ] "Send Newsletter" button — triggers monthly email send to all confirmed subscribers (with confirmation modal)

### Portfolio — Projects

- [ ] Project list page (`/portfolio/projects`) — table with title, status, featured flag, achievement count
- [ ] New/edit project page — all fields (title, description, longDescription, technologies, images, demoUrl, githubUrl, featured)
- [ ] Delete / archive project action

### Portfolio — Achievements

- [ ] Achievement list per project (`/portfolio/projects/[id]/achievements`) — timeline view
- [ ] "Log Achievement" button — quick form: title, date, context note, optional photo upload
- [ ] Edit / delete achievement

### Hobbies & Tracking

- [ ] Hobby list + new hobby form (name, category, started_at)
- [ ] Hobby detail — progress log with "Add Entry" (date, note, milestone, photo)
- [ ] Reading list — books with status (reading, finished, want-to-read), rating, notes
- [ ] Watch list — shows/movies with status, rating, notes
- [ ] Recipes — list + form (name, ingredients, steps, cook_time, rating, date_made, photo)

### Quotes

- [ ] Quotes are created via the New Post form with format = `quote`; no separate section needed

### Settings

- [ ] Settings page — site name, publication name, Ko-fi URL, default layout preference, admin email for alerts, email alert threshold (errors/hour)

### PWA

- [ ] `manifest.json` — app name, icons, display: standalone, theme color
- [ ] Service worker (Next.js `next-pwa` or custom) — offline shell, cache static assets
- [ ] "Add to Home Screen" prompt on mobile

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
