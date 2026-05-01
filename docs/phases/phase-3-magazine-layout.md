# Phase 3 — Magazine Layout + Toggle

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`  
**Depends on:** Phase 2

## Goal

Add a second front page layout style (magazine) and a toggle so readers can switch between newspaper and magazine views. Preference persists across sessions.

---

## Tasks

### Magazine Layout Components

- [ ] `MagazineFrontPageGrid` — hero image full-width, bold sans-serif typography, card-based grid, color-coded category sections
- [ ] `MagazineHero` — large featured post with full-bleed image and overlay headline
- [ ] `MagazineCategoryStrip` — horizontal color-coded band per category
- [ ] `MagazineCard` — secondary post card with image thumbnail, category badge, headline, excerpt

### Layout Toggle

- [ ] `LayoutToggle` component in the masthead — "Newspaper / Magazine" switcher
- [ ] Preference saved to `localStorage` on toggle
- [ ] Preference also saved to `newsletter-api` (`POST /api/preferences/layout`) for cross-device persistence (anonymous session-based)
- [ ] URL param support: `?layout=magazine` overrides preference for shareable links

### Shared Infrastructure

- [ ] Layout context (`LayoutContext`) wraps both layout components — same data, different rendering
- [ ] Both layouts consume the same `posts`, `issue`, `categories` props — no duplicate API calls

### Styling

- [ ] Magazine typography system — sans-serif headlines (e.g. Inter or DM Sans), larger images, bolder color use
- [ ] Smooth CSS transition between layouts on toggle
- [ ] Responsive — magazine grid collapses to single column on mobile

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
