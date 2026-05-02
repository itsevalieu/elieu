# Phase 13 — Dark Mode, Search, Scheduled Publish & Draft Previews

**Status**: Complete

---

## 1. Dark Mode Toggle

### Architecture
- `ThemeContext` / `ThemeProvider` mirrors the existing `LayoutContext` pattern
- Theme stored as `data-theme="light"|"dark"` on `<html>`, alongside `data-layout`
- CSS custom properties cascade: `[data-theme="dark"]` overrides `:root` defaults, and `[data-theme="dark"][data-layout="magazine"]` overrides magazine-specific colors
- Persisted to `localStorage("themePreference")`; defaults to `prefers-color-scheme` media query on first visit

### CSS Variable Tokens
| Token | Light (newspaper) | Dark (newspaper) | Light (magazine) | Dark (magazine) |
|-------|----------|------|--------|------|
| `--color-bg` | `#faf8f4` | `#1a1a1a` | `#ffffff` | `#111111` |
| `--color-ink` | `#1a1a1a` | `#e8e4dd` | `#111111` | `#f0f0f0` |
| `--color-rule` | `#2a2a2a` | `#d4c9b8` | `#e5e5e5` | `#333333` |
| `--color-accent` | `#8b0000` | `#e05555` | `#2563eb` | `#60a5fa` |
| `--color-muted` | `#666666` | `#a0998e` | `#737373` | `#a3a3a3` |
| `--color-card` | `#ffffff` | `#242424` | `#ffffff` | `#1a1a1a` |
| `--color-code-bg` | `#f2efe8` | `#2a2a2a` | `#f4f4f5` | `#1e1e1e` |

### Components
- `ThemeToggle` — sun/moon icon button in the footer, next to `LayoutToggle`
- Smooth `transition: background 0.3s ease, color 0.3s ease` on `body`

---

## 2. Full-Text Search

### Backend
- **Flyway migration `V14`**: Adds `search_vector tsvector` column, GIN index, and trigger that auto-updates on INSERT/UPDATE of `title`, `excerpt`, `body`
- Weights: title = A, excerpt = B, body = C (ranking prioritizes title matches)
- Endpoints:
  - `GET /api/posts/search?q=&page=&size=` — public, searches published posts only
  - `GET /api/admin/posts/search?q=&page=&size=` — admin, searches all posts

### Frontend (newsletter)
- `/search` page with URL param `?q=` — client-side rendering with direct API fetch
- Search link added to `CategoryStrip` navigation

### Frontend (admin)
- Inline search bar on posts list page — filters via admin search endpoint
- "Clear" button to reset back to full listing

---

## 3. Scheduled Publishing

### Backend
- New post status: `"scheduled"` (alongside `draft`, `published`, `archived`)
- `scheduled_at TIMESTAMP` column on `posts` table
- `PostSchedulerService` with `@Scheduled(fixedRate = 60_000)` — polls every minute for posts where `status = 'scheduled'` and `scheduled_at <= NOW()`, transitions them to `published`
- `@EnableScheduling` added to `NewsletterApplication`
- Audit log entry `POST_PUBLISH_SCHEDULED` on auto-publish

### Frontend (admin)
- `scheduled` option in status dropdown
- `datetime-local` input conditionally shown when status = "scheduled"
- Blue `StatusBadge` for scheduled posts

---

## 4. Draft Preview

### Backend
- `preview_token VARCHAR(64)` column on `posts` — unique, generated as UUID (no dashes) on create/update
- `GET /api/posts/preview/{token}` — returns post regardless of status (no auth required)
- Unique index ensures no collisions

### Frontend (newsletter)
- `/preview/[token]` page renders the post with a yellow "Draft Preview — not published" banner
- `noindex` robots meta to prevent search engines from indexing previews

### Frontend (admin)
- Preview link shown on edit form when post has a `previewToken`
- Copy-to-clipboard button for sharing the preview URL

---

## Database Migration Summary

**`V14__add_search_scheduled_preview.sql`**:
1. `search_vector tsvector` + GIN index + trigger (full-text search)
2. `scheduled_at TIMESTAMP` + partial index (scheduled publishing)
3. `preview_token VARCHAR(64)` + unique index (draft previews)
