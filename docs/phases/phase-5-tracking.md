# Phase 5 — Hobby, Recipe & Life Tracking

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`, `backend/newsletter-api/`  
**Depends on:** Phase 2, Phase 4

## Goal

Surface hobby progress, recipes, reading lists, watch lists, and recommendations on the public newsletter site. These appear both as dedicated pages and as newsletter post types on the front page.

---

## Tasks

### Public Pages (`frontend/newsletter/`)

- [ ] `/tracking/reading` — books currently reading, finished, want-to-read; with ratings and notes
- [ ] `/tracking/watching` — shows/movies with status and ratings
- [ ] `/tracking/hobbies` — hobby list with progress timeline per hobby
- [ ] `/tracking/hobbies/[id]` — individual hobby detail with full progress log and photos
- [ ] `/recipes` — recipe index, filterable by category/tags
- [ ] `/recipes/[slug]` — recipe detail with ingredients, steps, cook time, photos, rating

### Recommendation Widget

- [ ] `RecommendationRequest` component — embedded on tracking pages; reader submits a book/show/movie suggestion via a form
- [ ] Form POSTs to `newsletter-api POST /api/recommendations` — stored in DB for admin review
- [ ] Admin sees recommendation submissions in the admin under Hobbies & Tracking
- [ ] Rate-limited (3/IP/day) and honeypot-protected

### Newsletter Integration

- [ ] Tracking entries can be added as posts with format = `tracking-entry`; they appear on the front page (e.g. "This Month I Read", "Currently Watching")
- [ ] Recipe posts use format = `recipe`; link through to `/recipes/[slug]`
- [ ] Hobby progress milestones can be published as brief post excerpts

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
