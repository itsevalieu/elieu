# Phase 5 — Hobby, Recipe & Life Tracking

**Status:** `[x]` Complete
**Repo areas:** `frontend/newsletter/`, `backend/newsletter-api/`
**Depends on:** Phase 2, Phase 4

## Goal

Surface hobby progress, recipes, reading lists, watch lists, and recommendations on the public newsletter site. These appear both as dedicated pages and as newsletter post types on the front page.

---

## Architecture

```mermaid
flowchart LR
    subgraph public [frontend/newsletter — public pages]
        RL[/tracking/reading]
        WL[/tracking/watching]
        HL[/tracking/hobbies]
        HD[/tracking/hobbies/:id]
        RI[/recipes]
        RD[/recipes/:slug]
    end

    subgraph api [newsletter-api]
        HOBBY_API["GET /api/hobbies\nGET /api/hobbies/:id"]
        RECIPE_API["GET /api/recipes\nGET /api/recipes/:slug"]
        READING_API["GET /api/tracking/reading"]
        WATCHING_API["GET /api/tracking/watching"]
        RECO_API["POST /api/recommendations"]
    end

    RL --> READING_API
    WL --> WATCHING_API
    HL --> HOBBY_API
    HD --> HOBBY_API
    RI --> RECIPE_API
    RD --> RECIPE_API
```

## Technical Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Reading/Watch list storage | Stored as hobbies with `category: 'reading'` or `category: 'watching'`; progress entries are individual items | Reuses existing hobby schema; no new tables |
| Recipe rendering | Structured JSON (ingredients array, steps array) rendered with dedicated components | Better than Markdown for recipes; enables future features like ingredient scaling |
| Recommendation form | Simple public endpoint with honeypot + rate limit; stored in `recommendations` table | Admin reviews in the admin app; no auto-publish |
| Data fetching | Server components with `revalidate: 300` (5 min) for tracking pages | Tracking data changes less frequently than posts |

---

## Tasks

### 1. Backend — New Endpoints

These extend the existing controllers from Phase 1.

- [ ] **Tracking endpoints** in `HobbyController`:
  - `GET /api/tracking/reading` — returns hobbies where `category='reading'` with entries, each entry representing a book
  - `GET /api/tracking/watching` — same for `category='watching'`

- [ ] **Reading/watching entry schema** (uses `hobby_progress_entries`):

```
Hobby (category='reading'):
  - name: "2026 Reading List"
  - progress_entries[]:
    - note: "The Great Gatsby — F. Scott Fitzgerald"
    - milestone: true (= finished)
    - entry_date: 2026-04-15
    - photo_url: cover image
    (rating stored in note as "★★★★☆" prefix or in a JSONB metadata field)
```

- [ ] **`V14__add_tracking_metadata.sql`** — add `metadata JSONB` column to `hobby_progress_entries`:

```sql
ALTER TABLE hobby_progress_entries
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
-- metadata: {"rating": 4, "author": "F. Scott Fitzgerald", "status": "finished", "type": "book"}
```

- [ ] **Recommendation endpoints**:
  - `POST /api/recommendations` — public; rate limit 3/IP/day; honeypot check
  - `GET /api/admin/recommendations?status=pending` — admin; filterable
  - `PATCH /api/admin/recommendations/{id}` — mark as reviewed

---

### 2. Shared Types — `frontend/common/`

- [ ] **`hobby.ts`**:

```typescript
export interface Hobby {
  id: number;
  name: string;
  category: string;
  startedAt: string | null;
  entries: HobbyProgressEntry[];
  createdAt: string;
}

export interface HobbyProgressEntry {
  id: number;
  hobbyId: number;
  entryDate: string;
  note: string | null;
  milestone: boolean;
  photoUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
```

- [ ] **`recipe.ts`**:

```typescript
export interface Recipe {
  id: number;
  name: string;
  slug: string;
  ingredients: string[];
  steps: string[];
  cookTime: string | null;
  rating: number | null;
  photoUrl: string | null;
  dateMade: string | null;
  postId: number | null;
  createdAt: string;
}
```

- [ ] **`recommendation.ts`**:

```typescript
export interface Recommendation {
  id: number;
  type: 'book' | 'show' | 'movie' | 'other';
  title: string;
  note: string | null;
  submittedBy: string | null;
  status: 'pending' | 'reviewed';
  createdAt: string;
}
```

---

### 3. Public Pages — `frontend/newsletter/src/app/tracking/`

- [ ] **`/tracking/reading/page.tsx`** (server component):
  - Three sections: "Currently Reading", "Finished", "Want to Read"
  - Each book shown as a card: cover image, title, author, rating (stars), date finished
  - Sorted by `entry_date` descending within each section
  - `<RecommendationWidget type="book" />` at the bottom

- [ ] **`/tracking/watching/page.tsx`**:
  - Two sections: "Currently Watching" (shows), "Watched" (finished)
  - Cards: poster/thumbnail, title, type badge (Show/Movie), rating, notes
  - `<RecommendationWidget type="show" />`

- [ ] **`/tracking/hobbies/page.tsx`**:
  - Grid of hobby cards (name, category, latest milestone, progress count)
  - Excludes reading/watching hobbies (those have dedicated pages)

- [ ] **`/tracking/hobbies/[id]/page.tsx`**:
  - Hobby name and description
  - Vertical timeline of progress entries (newest first): date, note, milestone star, photo

---

### 4. Public Pages — `frontend/newsletter/src/app/recipes/`

- [ ] **`/recipes/page.tsx`**:
  - Recipe grid: photo, name, cook time, rating, date made
  - Filter by tag/category (client-side filter or API param)

- [ ] **`/recipes/[slug]/page.tsx`**:
  - Recipe detail layout:

  ```
  ┌─────────────────────────────────────┐
  │  [Photo]                            │
  │  Recipe Name            ★★★★☆       │
  │  Cook time: 45 min                  │
  ├─────────────┬───────────────────────┤
  │ Ingredients │ Steps                 │
  │ • 2 cups... │ 1. Preheat oven...    │
  │ • 1 tsp...  │ 2. Mix flour and...   │
  │             │ 3. Bake for 30 min... │
  └─────────────┴───────────────────────┘
  ```

  - Ingredients rendered as a checklist (client component; reader can check off as they go)
  - Steps rendered as ordered list with larger text
  - Photo via `next/image`
  - Print-friendly layout via `@media print`

---

### 5. Recommendation Widget — `frontend/newsletter/src/components/shared/RecommendationWidget.tsx`

- [ ] `'use client'` component:
  - Heading: "Got a recommendation for me?"
  - Form: title input, optional note textarea, optional display name, hidden honeypot field
  - On submit: POST to `/api/recommendations` with `type` prop
  - Success: "Thanks! I'll check it out." toast
  - Error / rate limit: "Try again later." message

---

### 6. Newsletter Integration

- [ ] Tracking data can appear on the front page as post excerpts:
  - Admin creates a post with `format: 'tracking-entry'`, writes "This Month I Read" in the title, lists books in the body
  - Post renders like any other excerpt card on the front page
  - Link can go to `/tracking/reading` or to the individual post

- [ ] Recipe posts use `format: 'recipe'` — the `ExcerptCard` shows the recipe name, photo, and cook time; clicking links to `/recipes/[slug]`

---

## Decisions & Notes

| Decision | Choice | Why |
|----------|--------|-----|
| Reuse hobby schema for reading/watching | `category='reading'` + `category='watching'` | No new tables; `hobby_progress_entries` already has the shape needed for book/show tracking |
| Structured JSON for recipes over Markdown | JSON `ingredients[]` + `steps[]` | Enables interactive ingredients checklist, potential ingredient scaling, better mobile rendering |
| JSONB metadata column | `metadata JSONB` on `hobby_progress_entries` | Flexible per-entry data (rating, author, status) without schema changes per hobby type |
| Recommendation moderation | Admin reviews before display | Prevents spam from public recommendation form; no auto-publish risk |

<!-- Record additional decisions during implementation here -->
