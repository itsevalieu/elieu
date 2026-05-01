# Phase 10 — React Native Mobile App

**Status:** `[ ]` Not started  
**Repo areas:** `mobile/newsletter-app/` (new)  
**Depends on:** Phase 4

## Goal

Native iOS and Android admin app for writing posts, logging portfolio achievements, moderating comments, and tracking hobbies — all from your phone. Built with Expo, sharing types from `@evalieu/common`.

---

## Tasks

### Project Setup

- [ ] Create `mobile/newsletter-app/` using Expo (managed workflow)
- [ ] Add `@evalieu/common` as a dependency (via monorepo local reference)
- [ ] Configure API base URL via Expo constants (dev vs production)
- [ ] Auth: JWT stored in `expo-secure-store`; refresh token logic mirroring web admin
- [ ] Navigation: Expo Router (file-based, matches web admin structure mentally)

### Auth Screens

- [ ] Login screen — email + password, POST to newsletter-api `/api/auth/login`
- [ ] Auto-refresh token on app foreground
- [ ] Logout

### Bottom Tab Navigation

- [ ] Posts
- [ ] Portfolio
- [ ] Tracking
- [ ] Comments
- [ ] Settings

### Posts

- [ ] Post list — filterable by status and category
- [ ] New post screen — title, excerpt, category, format, layout hint, issue assignment, tag input, Markdown text area, cover image picker
- [ ] Edit post screen — same form pre-filled
- [ ] Image picker — camera or photo library via `expo-image-picker`; upload via S3 presigned URL
- [ ] Draft / publish toggle

### Portfolio

- [ ] Project list screen — title, status, achievement count
- [ ] Project detail screen — project info + achievement timeline
- [ ] "Log Achievement" quick-action — title, date, context note, optional photo; POST to portfolio-api; done in < 30 seconds
- [ ] Edit achievement
- [ ] Create / edit project (full form)

### Hobbies & Tracking

- [ ] Hobby list + new hobby form
- [ ] Hobby detail — progress log + "Add Entry" (note, milestone, photo)
- [ ] Reading list — add/update books
- [ ] Watch list — add/update shows/movies
- [ ] Recipes — view and add

### Comments Moderation

- [ ] Moderation queue — list of pending comments with post title, author, body
- [ ] Swipe to approve or reject
- [ ] Push notification on new pending comment (via Expo Push Notifications + backend webhook)

### Settings

- [ ] View/update site settings (Ko-fi URL, alert thresholds)
- [ ] View system health status
- [ ] Logout

### Publishing

- [ ] Configure `app.json` with bundle IDs, icons, splash screen
- [ ] EAS Build for iOS (TestFlight) and Android (Google Play internal track)
- [ ] EAS Submit for App Store and Play Store

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
