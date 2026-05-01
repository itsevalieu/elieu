# Changelog

Running log of all work sessions, decisions, and changes. Newest entries at the top.

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
