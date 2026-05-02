# Changelog

Running log of all work sessions, decisions, and changes. Newest entries at the top.

---

## 2026-05-02 — Phase 14: Design System & UI Library

### Done
- **Created `@evalieu/design-system` package** (`frontend/design-system/`) as the unified source of truth for styling across newsletter, magazine, portfolio, and admin apps
- **Design tokens**: CSS custom properties (`--ds-*` prefix) for colors, typography, spacing, radius, shadows, and transitions; theme-aware via `data-theme` and `data-layout` / `data-app` attributes
- **TypeScript token exports**: `colors`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `spacing`, `maxWidth`, `breakpoints`, `mediaQueries` — importable by any app for JS-side logic
- **Base styles**: CSS reset/normalize, typography utility classes (`.ds-headline`, `.ds-body`, `.ds-prose`, `.ds-overline`, `.ds-caption`), all consuming design tokens
- **Component library**: `Button`, `Input`, `Select`, `Textarea`, `Card`, `Badge`, `Container`, `Stack`, `Modal` — all styled with CSS custom properties (framework-agnostic, works with SCSS modules or Tailwind)
- **Theme support**: 6 built-in palettes — newspaper light/dark, magazine light/dark, portfolio light/dark — plus semantic colors (error, success, warning, info) and category accent colors
- **Wired into all apps**: Added as dependency to newsletter, portfolio, and admin; configured `transpilePackages` in each Next.js config; added tsconfig paths
- **Portfolio fixes**: Imported `globals.scss` in layout (was missing), set `data-app="portfolio"` for theme scoping, mapped legacy `--primary-color` etc. to `--ds-*` tokens

### Changed files
- New: `frontend/design-system/` (entire package — package.json, tsconfig, tokens, styles, components)
- Modified: `frontend/{newsletter,portfolio,admin}/package.json` — added `@evalieu/design-system` dep
- Modified: `frontend/{newsletter,portfolio,admin}/tsconfig.json` — added design-system paths
- Modified: `frontend/{newsletter,portfolio,admin}/next.config.ts` — added `transpilePackages`
- Modified: `frontend/portfolio/src/app/layout.tsx` — imported globals + design-system styles, added `data-app`
- Modified: `frontend/portfolio/src/app/globals.scss` — mapped to `--ds-*` tokens
- `docs/ROADMAP.md`, `docs/CHANGELOG.md`

---

## 2026-05-01 — Phase 13: Dark mode, search, scheduled publish & draft previews

### Done
- **Dark mode toggle**: Added `ThemeContext` + `ThemeToggle` component for both newspaper and magazine layouts. CSS variables defined for `[data-theme="dark"]` and `[data-theme="dark"][data-layout="magazine"]`. Respects `prefers-color-scheme` on first visit, persists to `localStorage`
- **Full-text search**: PostgreSQL `tsvector`/GIN index on `posts(title, excerpt, body)` with weighted ranking (A/B/C). Added `GET /api/posts/search?q=` (public) and `GET /api/admin/posts/search?q=` (admin). Newsletter search page at `/search`. Admin posts list has inline search bar
- **Scheduled publishing**: New `scheduled` status with `scheduled_at` column. Background `@Scheduled` job runs every 60 seconds to auto-publish due posts. Admin form shows datetime picker when status is "scheduled". Blue `StatusBadge` for scheduled posts
- **Draft preview**: Every post gets a `preview_token` (UUID) on creation. Public `GET /api/posts/preview/{token}` returns any post regardless of status. Newsletter preview page at `/preview/{token}` with "Draft Preview — not published" banner. Admin form shows copyable preview link for saved posts

### Added files
- `backend/newsletter-api/src/main/resources/db/migration/V14__add_search_scheduled_preview.sql`
- `backend/newsletter-api/src/main/java/com/evalieu/newsletter/service/PostSchedulerService.java`
- `frontend/newsletter/src/context/ThemeContext.tsx`
- `frontend/newsletter/src/components/shared/ThemeToggle.tsx` + `.module.scss`
- `frontend/newsletter/src/app/search/page.tsx` + `.module.scss`
- `frontend/newsletter/src/app/preview/[token]/page.tsx` + `.module.scss`
- `docs/phases/phase-13-dark-search-schedule-preview.md`

### Changed files
- `backend/newsletter-api`: `Post.java`, `PostRequest.java`, `PostResponse.java`, `PostRepository.java`, `PostService.java`, `PostController.java`, `PostResponseMapper.java`, `NewsletterApplication.java`
- `frontend/common/src/types/post.ts`: added `scheduled` status, `scheduledAt`, `previewToken`
- `frontend/newsletter`: `globals.scss`, `layout.tsx`, `FrontPageContent.tsx`, `CategoryStrip.tsx`, post page styles
- `frontend/admin`: `AdminPostForm.tsx`, `posts/page.tsx`, `StatusBadge.tsx`
- `docs/ROADMAP.md`, `docs/CHANGELOG.md`

---

## 2026-05-01 — Phase 12 prep: Deployment fixes & go-live plan

### Done
- **ECS cluster name fix**: Changed `ci-backend.yml` from `--cluster evalieu` to `--cluster evalieu-prod` to match Terraform's `${project}-${environment}` naming
- **Docker image tag fix**: CI now pushes both `:${{ github.sha }}` and `:latest` tags so ECS task definitions (which reference `:latest`) always resolve to a valid image
- **Portfolio cookie fix**: Added `jwt.cookie-same-site=Strict` and `spring.jpa.show-sql=false` to `application-prod.properties` (was missing, newsletter already had it)
- **EAS config**: Created `mobile/eas.json` with development/preview/production build profiles and App Store/Play Store submit config
- **Mobile gitignore**: Added `google-service-account.json` and `.env` to `mobile/.gitignore`
- **Phase 12 doc**: Created `docs/phases/phase-12-production-deployment.md` with full go-live checklist covering AWS bootstrap, GitHub OIDC, Terraform, DNS, Vercel, SES, mobile app publishing, smoke tests, monitoring, and cost estimates

### Changed
- `ci-backend.yml`: cluster name `evalieu` → `evalieu-prod`, added `:latest` tag push alongside `:sha`
- `backend/portfolio-api/src/main/resources/application-prod.properties`: added `jwt.cookie-same-site=Strict`
- `docs/ROADMAP.md`: added Phase 12 entry, updated current focus

---

## 2026-05-01 — Phase 11: Hardening, Polish & Testing

### Done
- **H2 JSONB fix**: Removed all `columnDefinition = "jsonb"` and `columnDefinition = "TEXT"` from 10 entity classes; rely on `@JdbcTypeCode(SqlTypes.JSON)` and `length` attributes for cross-database compatibility
- **Docker Compose fix**: Created `application-docker.properties` for both APIs; updated docker-compose.yml to use `docker` profile with 64-char JWT secret and Flyway enabled
- **Seed data**: Created `DataSeeder.java` for newsletter-api (admin user, 8 categories with subcategories, sample issue, 4 sample posts, 3 hobbies)
- **Navigation**: Added Hobbies, Recipes, Recommendations links to CategoryStrip; added CategoryStrip to magazine layout
- **Cookie SameSite**: Made configurable via `jwt.cookie-same-site` property; Lax for dev/docker, Strict for prod
- **Backend tests**: JwtServiceTest, AuthServiceTest, PostServiceTest (unit); AuthControllerIntegrationTest, PostControllerIntegrationTest (integration with Testcontainers)
- **Image upload widget**: Created ImageUpload.tsx with drag-and-drop, presigned S3 upload, preview; integrated into AdminPostForm cover image field
- **SEO**: Added Open Graph/Twitter metadata to newsletter layout; created robots.ts and sitemap.ts with dynamic post/category fetching
- **Error pages**: Created not-found.tsx and error.tsx for both newsletter and admin apps
- **Plate rich text editor**: Installed platejs + @platejs/basic-nodes + @platejs/markdown; created RichTextEditor.tsx with toolbar and Markdown serialization; replaced Textarea in AdminPostForm
- **PWA service worker**: Installed @serwist/next; configured sw.ts with precaching and runtime caching; updated manifest.json with full PWA metadata

---

## 2026-04-30 — Full implementation of all 11 phases

### Done
- **Phase 0**: Dockerfiles, docker-compose.yml (PostgreSQL + APIs), Terraform modules (networking, ECS, RDS, S3, SES, secrets), CI/CD workflows
- **Phase 1**: Full newsletter-api (91 Java files) — 13 Flyway migrations, JPA entities, JWT auth, rate limiting, honeypot, S3 presigned URLs, 18 REST controllers. Portfolio-api updated with JWT validation and admin endpoints
- **Phase 2**: Newsletter newspaper layout — Playfair Display/Lora fonts, 3-column CSS grid, Masthead, FeaturedArticle, ExcerptCard, API client, Markdown rendering, article pages
- **Phase 3**: Magazine layout + toggle — LayoutContext with localStorage, MagazineHero, MagazineCard, MagazineCategoryStrip, CSS custom property swap, Inter/DM Sans fonts
- **Phase 4**: Admin app — Next.js + Tailwind, login/auth, AdminShell with sidebar/bottom nav, CRUD pages for posts, issues, comments, subscribers, portfolio, settings
- **Phase 5**: Hobby and recipe tracking — admin CRUD with progress entries, public hobby timeline and recipe pages, reading/watching tracking
- **Phase 6**: Engagement — CommentSection, ReactionBar (optimistic UI), ShareButton (Web Share API), RecommendationForm with honeypot
- **Phase 7**: Email — Thymeleaf templates, AWS SES v2, confirmation/newsletter emails, RFC 8058 one-click unsubscribe, SubscribeForm, admin send button
- **Phase 8**: Analytics dashboard — GA4, AdSense, Ko-fi, DashboardService stats endpoints, admin dashboard with stat cards, top posts, subscriber growth, audit timeline
- **Phase 9**: Games — GameEmbed (sandboxed iframe), GameFileUpload with react-dropzone, presigned game asset uploads
- **Phase 10**: React Native mobile app — Expo Router, Zustand auth, SecureStore tokens, tab navigation (dashboard, posts, quick post with camera, swipe comment moderation, more menu)

### Key decisions
- Kept Spring Boot 3.4.5 (4.0.6 upgrade deferred until GA release)
- Used jjwt 0.12.6 (0.13.0 not yet published)
- @hello-pangea/dnd bumped to v18 for React 19 compatibility
- Expo SDK 52 with React 18.3 for mobile (React Native 0.76)

Format:
```
## YYYY-MM-DD — <summary>
### Done
### Decided
### Changed
### Notes
```

---

## 2026-04-30 — Infrastructure planning, dependency audit, library swaps

### Done
- Created Phase 0 — Infrastructure, CI/CD & Deployment (`docs/phases/phase-0-infrastructure.md`)
  - Defined full AWS architecture: ECS Fargate (backend), Vercel (frontend), RDS PostgreSQL 16, S3 + CloudFront, SES, Secrets Manager
  - Designed CI/CD pipelines: `ci-frontend.yml`, `ci-backend.yml`, `ci-infra.yml` with path-filtered triggers
  - Created Docker + Docker Compose setup for local development
  - Planned Terraform module structure: networking, ECS, RDS, S3, SES, secrets
  - Documented domain/DNS layout, monitoring/alerting, and cost estimates (~$45/mo)
- Audited all dependencies and updated phase docs with version upgrades
- Swapped three libraries based on audit findings
- Added comprehensive Decisions & Notes tables to every phase (0–10)
- Updated ROADMAP.md with Phase 0 entry, corrected framework versions, expanded tech decisions log

### Decided
- **Vercel over AWS Amplify** for frontend hosting: zero-config Next.js deploys, free tier covers 3 projects, preview deploys per PR
- **ECS Fargate over EC2/Elastic Beanstalk**: serverless containers, no server management, per-second billing
- **GitHub OIDC over static AWS keys**: no long-lived credentials; IAM role assumption
- **Terraform over CDK/Pulumi**: declarative HCL, largest community, state management
- **Single ALB with path-based routing** over separate load balancers: cheaper; both APIs share `api.evalieu.com`
- **Single-AZ RDS** over Multi-AZ: acceptable risk for personal site; halves database cost

### Changed
- **Spring Boot 3.x → 4.0.6**: Boot 3 EOL June 2026; Boot 4 includes Spring Framework 7, Jakarta EE 11, Hibernate 7.1, Jackson 3, virtual threads
- **Next.js 15 → 16**: stable Turbopack, React 19 built-in, improved RSC and `next/image`
- **Expo SDK 52 → 55**: React Native 0.79+ with New Architecture enabled by default
- **jjwt 0.12.x → 0.13.0**: CVE fixes, Jackson 3 compatibility for Boot 4
- **TipTap → Plate** (`@udecode/plate`): follows Shadcn component model, Tailwind-styled, better fit for Shadcn/Tailwind admin
- **next-pwa → @serwist/next**: next-pwa unmaintained since 2023; Serwist is the official successor with Next.js 16 support
- **Recharts → @tremor/react**: Tailwind-native charting; provides cards + charts + metrics in one library, consistent with admin styling

### Notes
- Cost estimate for full AWS stack is ~$45/month at personal site scale
- Vercel free tier covers all 3 frontend projects (portfolio, newsletter, admin)
- Docker Compose enables full local dev: `docker-compose up -d` for PostgreSQL + APIs, `npm run dev` for frontends

---

## 2026-04-30 — Monorepo setup + product planning

### Done
- Reviewed three separate repos (`evalieu-api`, `evalieu-ui`, `evalieu-iac`) and decided to consolidate into a single monorepo
- Removed accidental root `.git` and all sub-repo `.git` folders
- Initialized fresh git repo at `evalieu/` root on `main` branch
- Restructured directories:
  - `evalieu-api/portfolio` → `backend/portfolio-api/`
  - `evalieu-api/newsletter` → `backend/newsletter-api/`
  - `evalieu-ui/portfolio` → `frontend/portfolio/`
  - `evalieu-ui/newsletter` → `frontend/newsletter/`
  - `evalieu-iac/` → `iac/`
- Created `frontend/common/` as shared `@evalieu/common` npm package
  - Extracted `Project` and `Achievement` TypeScript types from `frontend/portfolio/src/types/`
  - Updated all imports in `frontend/portfolio` to use `@evalieu/common`
- Added Turborepo + npm workspaces at root
- Consolidated CI/CD workflows from two broken workflow files into `.github/workflows/ci-backend.yml` and `.github/workflows/ci-frontend.yml` with corrected paths and upgraded to actions v4
- Added root `.gitignore`, `README.md`, `LICENSE`
- Created GitHub repo `itsevalieu/elieu` and pushed initial commit (106 files)
- Fixed Next.js dev server: removed `--turbopack` flag (known Turbopack bug with hoisted npm workspaces), pinned ports (portfolio → 3000, newsletter → 3001)
- Created full product + implementation plan for the newsletter/blog platform

### Decided
- Monorepo over separate repos: projects are small, tightly coupled by domain, CI/CD was broken anyway
- Turborepo for JS build orchestration (Java/Gradle remains self-contained)
- Newsletter platform will use custom admin (`frontend/admin`) rather than a headless CMS
- Admin will be a standalone Next.js PWA — not embedded in either public site
- Single JWT auth issued by `newsletter-api`, shared with `portfolio-api`
- Newspaper + magazine as two switchable layout modes on the newsletter front page
- All reader comments require moderation before appearing publicly
- Emoji reactions are anonymous, session-fingerprint-based (no login required)
- Ko-fi for donations (embed only, no backend)
- Double opt-in for newsletter subscribers

### Notes
- `evalieu` repo name was taken on GitHub; repo was created as `elieu`
- `--turbopack` removed from dev scripts due to npm workspace hoisting issue; revisit when Turbopack fixes monorepo support or if switching to pnpm
- Git history from the three sub-repos was not preserved (fresh start — projects were early-stage)
