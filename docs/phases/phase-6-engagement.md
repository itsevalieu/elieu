# Phase 6 — Engagement: Comments, Reactions & Sharing

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`, `frontend/admin/`, `backend/newsletter-api/`  
**Depends on:** Phase 2, Phase 4

## Goal

Let readers react to posts with emojis, submit comments (moderated), and share posts/issues. Engagement counts are visible on front page excerpt cards.

---

## Tasks

### Emoji Reactions

**Backend**
- [ ] `POST /api/posts/{id}/reactions` — accepts emoji, session fingerprint; enforces one reaction per session per post; updates denormalized `reaction_counts` on post
- [ ] `DELETE /api/posts/{id}/reactions` — removes reaction for session; updates counts
- [ ] Rate limiting: max 20 reaction changes/IP/hour

**Frontend**
- [ ] `ReactionBar` component — renders emoji buttons with counts; highlights current session's reaction
- [ ] Optimistic UI update on click; sync to API
- [ ] Session fingerprint — generated client-side (hashed from browser signals, stored in sessionStorage), sent as header
- [ ] Front page excerpt cards show top 1–2 emojis + total count

### Comments

**Backend**
- [ ] `POST /api/posts/{id}/comments` — accepts display name, email, body; honeypot field check; rate limit 3/IP/hr; status = pending; increments pending count
- [ ] `GET /api/posts/{id}/comments` — returns approved comments only
- [ ] `GET /api/admin/comments` — returns all comments filterable by status, post
- [ ] `PATCH /api/admin/comments/{id}` — approve or reject
- [ ] `DELETE /api/admin/comments/{id}` — delete
- [ ] Approved comment increments denormalized `comment_count` on post

**Frontend — public**
- [ ] `CommentForm` — display name, message fields; hidden honeypot field; submit with loading state and success/error feedback
- [ ] `CommentList` — renders approved comments below article; shows count
- [ ] Front page excerpt cards show 💬 N badge

**Frontend — admin**
- [ ] Moderation queue page (`/comments`) — list of pending comments with post title, author name, body preview; approve/reject/delete actions
- [ ] Pending count badge in sidebar nav, polled every 60s
- [ ] Bulk approve/reject

### Sharing

**Frontend**
- [ ] `ShareBar` component — on article pages and issue pages
  - [ ] Copy link button (clipboard API) with "Copied!" feedback
  - [ ] Web Share API button (native share sheet on mobile)
  - [ ] Pre-filled share text for social (title + URL)
- [ ] "Share this issue" button on front page — generates link to `/issues/[slug]`
- [ ] Open Graph tags on all post and issue pages (title, description, cover image, URL)
- [ ] Twitter Card meta tags

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
