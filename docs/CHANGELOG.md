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
