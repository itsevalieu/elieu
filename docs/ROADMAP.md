# Roadmap

Personal newspaper/magazine blog and portfolio platform. Full product plan lives in `.cursor/plans/newsletter_product_plan_5c2a3f92.plan.md`.

## Status Key

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Complete |

---

## Current Focus

> Phase 1 — Content API Foundation

---

## Phases

| # | Phase | Status | Detail |
|---|-------|--------|--------|
| 1 | Content API Foundation | `[ ]` | [phase-1-content-api.md](phases/phase-1-content-api.md) |
| 2 | Newspaper Front Page | `[ ]` | [phase-2-newspaper-layout.md](phases/phase-2-newspaper-layout.md) |
| 3 | Magazine Layout + Toggle | `[ ]` | [phase-3-magazine-layout.md](phases/phase-3-magazine-layout.md) |
| 4 | Unified Admin App (PWA) | `[ ]` | [phase-4-admin-app.md](phases/phase-4-admin-app.md) |
| 5 | Hobby, Recipe & Life Tracking | `[ ]` | [phase-5-tracking.md](phases/phase-5-tracking.md) |
| 6 | Engagement: Comments, Reactions & Sharing | `[ ]` | [phase-6-engagement.md](phases/phase-6-engagement.md) |
| 7 | Newsletter Email & Subscriber Management | `[ ]` | [phase-7-email-subscribers.md](phases/phase-7-email-subscribers.md) |
| 8 | Analytics, Ads, Ko-fi & Admin Dashboard | `[ ]` | [phase-8-analytics-dashboard.md](phases/phase-8-analytics-dashboard.md) |
| 9 | Games Integration | `[ ]` | [phase-9-games.md](phases/phase-9-games.md) |
| 10 | React Native Mobile App | `[ ]` | [phase-10-mobile-app.md](phases/phase-10-mobile-app.md) |

---

## Architecture Summary

```
evalieu/
├── backend/
│   ├── portfolio-api/       Spring Boot 3 · Java 21 · projects + achievements
│   ├── newsletter-api/      Spring Boot 3 · Java 21 · content, auth, email, subscribers
│   └── common/              shared Java utilities (future)
├── frontend/
│   ├── portfolio/           Next.js 15 · public portfolio site
│   ├── newsletter/          Next.js 15 · public newspaper/magazine site
│   ├── admin/               Next.js 15 · unified PWA admin (newsletter + portfolio)
│   └── common/              shared TypeScript types (@evalieu/common)
├── mobile/
│   └── newsletter-app/      Expo · React Native iOS + Android admin (Phase 10)
├── iac/                     Infrastructure as code (Terraform)
└── docs/                    ← you are here
```

## Tech Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Post body storage | Markdown as TEXT in PostgreSQL | Simple, searchable, no S3 for text |
| Media storage | AWS S3 + CloudFront | Scalable, secure, presigned uploads |
| Auth | JWT in httpOnly cookies | XSS-safe; shared across both APIs |
| Email | AWS SES | Cost-effective, deliverability, bounce webhooks |
| Frontend tooling | Turborepo + npm workspaces | Monorepo build orchestration for JS |
| Mobile | Expo (React Native) | Shares types from frontend/common |
| Admin | Standalone Next.js app | Clean separation from public sites |
| Comments | Moderation-gated | Anti-spam; all comments held for approval |
| Reactions | Session fingerprint, anonymous | No PII, no login required for readers |
| Donations | Ko-fi embed | No backend needed |
