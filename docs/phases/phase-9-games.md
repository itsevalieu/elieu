# Phase 9 — Games Integration

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`, `backend/newsletter-api/`  
**Depends on:** Phase 2

## Goal

Support embedded playable games in the newsletter — either hosted as static files in S3 or linked externally. Games appear as a content category with their own post format.

---

## Tasks

### Content Model

- [ ] `embedded-game` format already in Post schema (Phase 1)
- [ ] Add fields to post: `game_url` (S3 or external URL), `game_type` (iframe | canvas | link), `game_thumbnail_url`

### Backend

- [ ] S3 upload support for static game files (HTML/JS/CSS bundles) — via existing presigned URL endpoint with `content-type` validation
- [ ] `game_url` stored on post; served via CloudFront

### Public Frontend

- [ ] `GameEmbed` component:
  - [ ] `iframe` mode — renders `<iframe src={game_url} sandbox="allow-scripts allow-same-origin" />` with fixed aspect ratio container
  - [ ] `canvas` mode — injects game script into page
  - [ ] `link` mode — "Play Game →" button linking externally
- [ ] Fullscreen toggle on game embed
- [ ] Games appear on article pages when format = `embedded-game`
- [ ] Games category page (`/categories/games`) — lists all game posts with thumbnail previews and "Play" button

### Admin

- [ ] New post form already handles `embedded-game` format via format selector
- [ ] Additional fields shown when format = `embedded-game`: game URL (manual entry or S3 upload), game type selector, thumbnail upload
- [ ] Game file upload to S3 — accepts `.zip` (extracted server-side) or direct `index.html` + assets

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
