# Phase 11 — Hardening, Polish & Testing

**Status:** `[ ]` Not started
**Repo areas:** `backend/*/`, `frontend/*/`, `mobile/`, `docker-compose.yml`

## Goal

Fix blockers that prevent a clean local dev experience, add missing navigation and configuration, write the test suite, and polish the UI with SEO, error pages, and image uploads.

---

## Architecture

No new services or infrastructure. This phase hardens and completes the existing stack.

---

## Tasks

### 1. Fix H2 Dev Profile (blocker)

Entities use `@Column(columnDefinition = "jsonb")` which fails on H2 even in PostgreSQL compatibility mode. Hibernate emits literal `JSONB` DDL that H2 cannot process.

**Affected entities:** `Post`, `Recipe`, `HobbyProgressEntry`, `AdminAuditLog`

**Options (pick one):**

- [ ] **Option A — Custom H2 dialect**: Register a Hibernate `UserType` or `@ColumnTransformer` that maps JSONB to `CLOB` on H2. Apply via `application-dev.properties` with a custom dialect class.
- [ ] **Option B — Switch dev to Testcontainers**: Remove H2 entirely, use Testcontainers PostgreSQL for the dev profile. Slower startup but guaranteed schema parity.
- [ ] **Option C — Conditional columnDefinition**: Use `@Column(columnDefinition = "")` (empty) and let the dialect choose the type. Requires Hibernate 6.4+ `@JdbcTypeCode(SqlTypes.JSON)` to drive type selection without explicit `columnDefinition`.

**Files:**
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/model/Post.java`
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/model/Recipe.java`
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/model/HobbyProgressEntry.java`
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/model/AdminAuditLog.java`
- `backend/newsletter-api/src/main/resources/application-dev.properties`
- `backend/portfolio-api/` — same pattern if any entities use JSONB

---

### 2. Fix Docker Compose Profile (blocker)

`docker-compose.yml` sets `SPRING_PROFILES_ACTIVE: dev` but connects to PostgreSQL. The dev profile disables Flyway and uses `ddl-auto=create-drop`, so migrations never run. Additionally, `JWT_SECRET` is only 29 characters (HMAC-SHA256 requires >= 32 bytes).

- [ ] Create `application-docker.properties` for both APIs:
  ```properties
  spring.datasource.url=${SPRING_DATASOURCE_URL}
  spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
  spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
  spring.jpa.hibernate.ddl-auto=validate
  spring.flyway.enabled=true
  jwt.secret=${JWT_SECRET}
  jwt.secure-cookie=false
  ```
- [ ] Update `docker-compose.yml`: change `SPRING_PROFILES_ACTIVE` to `docker`, use a JWT_SECRET >= 32 characters
- [ ] Verify Flyway migrations run and schema matches entities

**Files:**
- `docker-compose.yml`
- `backend/newsletter-api/src/main/resources/application-docker.properties` (new)
- `backend/portfolio-api/src/main/resources/application-docker.properties` (new)

---

### 3. Add Seed Data (blocker)

No admin user, categories, or sample content is seeded for local development.

- [ ] Create `DataSeeder.java` (`ApplicationRunner`) in newsletter-api:
  - Seeds categories if `categories` table is empty (the 6 from V2 migration)
  - Seeds a default admin user if `admin_users` table is empty (email/password from env vars with defaults: `admin@evalieu.local` / `REDACTED_DEV_PASSWORD`)
  - Seeds site settings if empty
  - Optionally seeds a sample post and issue when `app.seed-sample-data=true`
- [ ] Create a similar seeder in portfolio-api for a sample project + achievement
- [ ] Log seeded credentials on startup so the developer can find them

**Files:**
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/config/DataSeeder.java` (new)
- `backend/portfolio-api/src/main/java/com/evalieu/portfolio/config/DataSeeder.java` (new)

---

### 4. Link Recommendations in Navigation

The `/recommendations` page exists but isn't discoverable from any navigation.

- [ ] Add "Recommend" link to `CategoryStrip` (newspaper layout)
- [ ] Add "Recommend" link to `MagazineHeader` or `MagazineCategoryStrip` (magazine layout)

**Files:**
- `frontend/newsletter/src/components/newspaper/CategoryStrip.tsx`
- `frontend/newsletter/src/components/magazine/MagazineHeader.tsx`

---

### 5. Cookie SameSite Configuration

`SameSite=Strict` may break cross-origin admin-to-API cookie flow in production.

- [ ] Add `jwt.same-site` property (default `Lax`) to both APIs
- [ ] Update `JwtService.java` to read the property and apply it to cookie creation
- [ ] Update `JwtTokenValidator` / `JwtValidationFilter` in portfolio-api similarly

**Files:**
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/security/JwtService.java`
- `backend/newsletter-api/src/main/resources/application.properties`
- `backend/portfolio-api/src/main/java/com/evalieu/portfolio/security/JwtTokenValidator.java`

---

### 6. Backend Tests

Phase 1 spec'd these tests but none were implemented.

**Unit tests** (`src/test/java/.../service/`):
- [ ] `PostServiceTest` — CRUD, slug generation, status transitions, reaction count recalculation
- [ ] `CommentServiceTest` — submit sanitization, approve/reject flow, count update
- [ ] `ReactionServiceTest` — upsert, uniqueness enforcement, count aggregation
- [ ] `AuthServiceTest` — login success/failure, BCrypt, token generation
- [ ] `SubscriberServiceTest` — subscribe, confirm, unsubscribe, token expiry
- [ ] `AuditLogServiceTest` — record action, verify persistence

**Integration tests** (`src/test/java/.../controller/`):
- [ ] `PostControllerIT` — Testcontainers PostgreSQL; full request/response cycle
- [ ] `AuthControllerIT` — login, receive cookie, access protected endpoint, refresh
- [ ] `CommentControllerIT` — submit, verify pending, approve via admin, verify public read
- [ ] `RateLimitIT` — exceed limit, verify 429 response
- [ ] `HoneypotIT` — submit with honeypot field, verify silent rejection

**Test config:**
- [ ] `application-test.properties` using Testcontainers JDBC URL (`jdbc:tc:postgresql:16:///test`)

---

### 7. Admin Image Upload Widget

The presigned URL flow exists in the API (`POST /api/admin/media/presign`) but the admin post form uses raw URL text inputs for cover images and gallery.

- [ ] Create `ImageUpload.tsx` component (reuse `react-dropzone` pattern from `GameFileUpload`)
- [ ] Accept single file, request presigned URL, upload to S3, return object URL
- [ ] Wire into `AdminPostForm` for cover image field
- [ ] Create `GalleryUpload.tsx` for multi-image gallery field
- [ ] Show image preview after upload

**Files:**
- `frontend/admin/src/components/admin/ImageUpload.tsx` (new)
- `frontend/admin/src/components/admin/GalleryUpload.tsx` (new)
- `frontend/admin/src/components/admin/AdminPostForm.tsx`

---

### 8. SEO Metadata

Post and issue pages don't generate dynamic Open Graph or Twitter Card metadata.

- [ ] Add `generateMetadata()` to `frontend/newsletter/src/app/posts/[slug]/page.tsx`
  - Title, description (excerpt), og:image (coverImageUrl), og:type, twitter:card
- [ ] Add `generateMetadata()` to `frontend/newsletter/src/app/issues/[slug]/page.tsx`
- [ ] Add `robots.txt` via `frontend/newsletter/src/app/robots.ts`
- [ ] Add `sitemap.xml` via `frontend/newsletter/src/app/sitemap.ts` (fetches published posts/issues from API)

---

### 9. Custom Error Pages

- [ ] Create `frontend/newsletter/src/app/not-found.tsx` with newspaper-themed 404
- [ ] Create `frontend/newsletter/src/app/error.tsx` with styled error boundary
- [ ] Create similar for `frontend/admin/`

---

### 10. Plate Rich Text Editor (deferred from Phase 4)

The admin post body uses a plain `<Textarea>`. Replace with Plate for rich editing.

- [ ] Install `@udecode/plate` and required plugins
- [ ] Create `PlateEditor.tsx` component with toolbar (bold, italic, headings, links, images, code blocks)
- [ ] Wire into `AdminPostForm` as body field replacement
- [ ] Serialize Plate output to Markdown for storage

---

### 11. PWA Service Worker (deferred from Phase 4)

- [ ] Install `@serwist/next`
- [ ] Configure service worker for admin app offline caching
- [ ] Add icons to `manifest.json`

---

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

---

## Decisions & Notes

| Decision | Choice | Why |
|----------|--------|-----|
| H2 JSONB fix approach | TBD | Option C (remove `columnDefinition`) is least invasive if `@JdbcTypeCode` alone works |
| Docker profile name | `docker` | Avoids overloading `dev` (H2) or `prod` (RDS + real secrets) |
| Default admin credentials | `admin@evalieu.local` / `REDACTED_DEV_PASSWORD` | Dev-only; seeder logs a warning; prod creates no default user |
| SameSite default | `Lax` | Safest for cross-subdomain admin deployments; configurable per environment |
| Test framework | JUnit 5 + Mockito (unit), Testcontainers (integration) | Already in build.gradle; matches phase-1 spec |

<!-- Record additional decisions during implementation here -->
