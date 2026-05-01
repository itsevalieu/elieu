# Phase 11 — Hardening, Polish & Testing

**Status:** `[x]` Complete
**Repo areas:** `backend/*/`, `frontend/*/`, `mobile/`, `docker-compose.yml`

## Goal

Fix blockers that prevent a clean local dev experience, add missing navigation and configuration, write the test suite, and polish the UI with SEO, error pages, and image uploads.

---

## Architecture

No new services or infrastructure. This phase hardens and completes the existing stack.

---

## Tasks

### 1. Fix H2 Dev Profile (blocker) — DONE

Entities used `@Column(columnDefinition = "jsonb")` which fails on H2 even in PostgreSQL compatibility mode. Fixed by removing all `columnDefinition = "jsonb"` and `columnDefinition = "TEXT"` annotations, relying on `@JdbcTypeCode(SqlTypes.JSON)` for JSON columns and `length` attributes for text columns.

**Affected entities:** `Post`, `Recipe`, `HobbyProgressEntry`, `AdminAuditLog`, `Comment`, `SystemLog`, `SiteSetting`, `Issue`, `Recommendation`; also `Achievement` in portfolio-api.

---

### 2. Fix Docker Compose Profile (blocker) — DONE

Created `application-docker.properties` for both APIs with Flyway enabled, `ddl-auto=validate`, and externalized JWT secret. Updated `docker-compose.yml` to use `SPRING_PROFILES_ACTIVE: docker` and a 64-character JWT secret.

---

### 3. Add Seed Data (blocker) — DONE

Created `DataSeeder.java` as an `ApplicationRunner` for newsletter-api (active on `dev` and `docker` profiles). Seeds:
- Admin user (`admin@evalieu.local` / `REDACTED_DEV_PASSWORD`)
- 8 categories with subcategories
- A sample issue (May 2026)
- 4 sample posts (article, tech, photo-caption, quote)
- 3 hobbies

---

### 4. Link Recommendations in Navigation — DONE

Added Hobbies, Recipes, and Recommendations links to the `CategoryStrip` nav bar. Also added `CategoryStrip` to the magazine layout so both layouts share the same navigation.

---

### 5. Cookie SameSite Configuration — DONE

Added configurable `jwt.cookie-same-site` property (default `Strict`, overridden to `Lax` in dev/docker profiles). Updated all cookie creation in `JwtService.java` to use the property.

---

### 6. Backend Tests — DONE

Created test suite:
- **Unit tests:** `JwtServiceTest`, `AuthServiceTest`, `PostServiceTest`
- **Integration tests:** `AuthControllerIntegrationTest`, `PostControllerIntegrationTest`
- **Test config:** `application-test.properties` for test profile

---

### 7. Admin Image Upload Widget — DONE

Created `ImageUpload.tsx` component with drag-and-drop support, presigned S3 upload flow, image preview, and file size/type validation. Integrated into `AdminPostForm` as the cover image field.

---

### 8. SEO Metadata — DONE

- Added comprehensive Open Graph, Twitter Card, and metadata configuration to the newsletter root layout
- Created `robots.ts` with allow/disallow rules
- Created `sitemap.ts` that dynamically fetches published posts and categories

---

### 9. Custom Error Pages — DONE

- Created `not-found.tsx` and `error.tsx` for both newsletter and admin apps
- Newsletter uses serif newspaper styling; admin uses Tailwind utilities

---

### 10. Plate Rich Text Editor — DONE

Installed `platejs`, `@platejs/basic-nodes`, and `@platejs/markdown`. Created `RichTextEditor.tsx` with:
- Toolbar (bold, italic, underline, code, H1-H3, blockquote)
- Markdown deserialization on load and serialization on save
- Styled element components for headings, blockquotes, code blocks

Integrated into `AdminPostForm` as the body field replacement.

---

### 11. PWA Service Worker — DONE

Installed `@serwist/next` and `serwist`. Configured:
- Service worker (`sw.ts`) with precaching and runtime caching
- Updated `next.config.ts` with `withSerwistInit` wrapper
- Enhanced `manifest.json` with description, scope, orientation, and icon entries
- Added tsconfig types for service worker
- Added `.gitignore` entries for generated SW files

---

## Decisions & Notes

| Decision | Choice | Why |
|----------|--------|-----|
| H2 JSONB fix approach | Remove `columnDefinition`, rely on `@JdbcTypeCode(SqlTypes.JSON)` | Least invasive; Hibernate 6.4+ maps JSON type correctly per dialect |
| TEXT column fix | Replace `columnDefinition = "TEXT"` with `length` attribute | Portable across H2 and PostgreSQL; avoids dialect-specific DDL |
| Docker profile name | `docker` | Avoids overloading `dev` (H2) or `prod` (RDS + real secrets) |
| Default admin credentials | `admin@evalieu.local` / `REDACTED_DEV_PASSWORD` | Dev-only; seeder only runs on dev/docker profiles |
| SameSite default | `Strict` in prod, `Lax` in dev/docker | Strict is most secure for prod; Lax needed for cross-port dev |
| Test framework | JUnit 5 + Mockito (unit), Testcontainers (integration) | Already in build.gradle; matches phase-1 spec |
| Rich text editor | Plate.js (`platejs` + `@platejs/basic-nodes` + `@platejs/markdown`) | Maintains Markdown storage format; full rich editing with toolbar |
| PWA framework | `@serwist/next` | Modern Workbox replacement; first-class Next.js App Router support |
| Navigation fix | Shared `CategoryStrip` in both layouts | Single component, consistent UX across newspaper and magazine |

## Future Considerations

These are not part of this phase but worth tracking:

- Dark mode support for newsletter and admin
- RSS feed generation
- Full-text search across posts
- Image gallery lightbox component
- Scheduled/timed post publishing
- Comment email notifications to post author
- Admin two-factor authentication
- Content version history / drafts
- Accessibility audit (WCAG compliance)
- Webhook support for external integrations
