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

> All phases complete!

---

## Phases

| # | Phase | Status | Detail |
|---|-------|--------|--------|
| 0 | Infrastructure, CI/CD & Deployment | `[x]` | [phase-0-infrastructure.md](phases/phase-0-infrastructure.md) |
| 1 | Content API Foundation | `[x]` | [phase-1-content-api.md](phases/phase-1-content-api.md) |
| 2 | Newspaper Front Page | `[x]` | [phase-2-newspaper-layout.md](phases/phase-2-newspaper-layout.md) |
| 3 | Magazine Layout + Toggle | `[x]` | [phase-3-magazine-layout.md](phases/phase-3-magazine-layout.md) |
| 4 | Unified Admin App (PWA) | `[x]` | [phase-4-admin-app.md](phases/phase-4-admin-app.md) |
| 5 | Hobby, Recipe & Life Tracking | `[x]` | [phase-5-tracking.md](phases/phase-5-tracking.md) |
| 6 | Engagement: Comments, Reactions & Sharing | `[x]` | [phase-6-engagement.md](phases/phase-6-engagement.md) |
| 7 | Newsletter Email & Subscriber Management | `[x]` | [phase-7-email-subscribers.md](phases/phase-7-email-subscribers.md) |
| 8 | Analytics, Ads, Ko-fi & Admin Dashboard | `[x]` | [phase-8-analytics-dashboard.md](phases/phase-8-analytics-dashboard.md) |
| 9 | Games Integration | `[x]` | [phase-9-games.md](phases/phase-9-games.md) |
| 10 | React Native Mobile App | `[x]` | [phase-10-mobile-app.md](phases/phase-10-mobile-app.md) |
| 11 | Hardening, Polish & Testing | `[x]` | [phase-11-hardening.md](phases/phase-11-hardening.md) |

---

## Architecture Summary

```
evalieu/
├── backend/
│   ├── portfolio-api/       Spring Boot 4 · Java 21 · projects + achievements
│   ├── newsletter-api/      Spring Boot 4 · Java 21 · content, auth, email, subscribers
│   └── common/              shared Java utilities (future)
├── frontend/
│   ├── portfolio/           Next.js 16 · public portfolio site
│   ├── newsletter/          Next.js 16 · public newspaper/magazine site
│   ├── admin/               Next.js 16 · unified PWA admin (newsletter + portfolio)
│   └── common/              shared TypeScript types (@evalieu/common)
├── mobile/
│   └── newsletter-app/      Expo SDK 55 · React Native iOS + Android admin (Phase 10)
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
| Mobile | Expo SDK 55 (React Native) | Shares types from frontend/common; New Architecture default |
| Admin | Standalone Next.js app | Clean separation from public sites |
| Comments | Moderation-gated | Anti-spam; all comments held for approval |
| Reactions | Session fingerprint, anonymous | No PII, no login required for readers |
| Donations | Ko-fi embed | No backend needed |
| Frontend hosting | Vercel (free tier) | Zero-config Next.js deploys; preview per PR; edge CDN |
| Backend hosting | AWS ECS Fargate | Serverless containers; no EC2 management; Docker-native |
| Load balancer | AWS ALB (single, path-based) | Routes `/api/newsletter/*` and `/api/portfolio/*` to respective services |
| IaC | Terraform | Declarative state management; modular; widely used |
| CI/CD | GitHub Actions + path filters | Free for public repos; per-service deployment via `dorny/paths-filter` |
| Auth credentials | GitHub OIDC → IAM role | No static AWS keys; role assumption is more secure |
| Rich text editor | Plate (replaces TipTap) | Shadcn component model; Tailwind-native; composable plugins |
| PWA tooling | @serwist/next (replaces next-pwa) | Active maintenance; full Next.js 16 support |
| Dashboard charts | @tremor/react (replaces Recharts) | Tailwind-native; cards + charts + metrics in one library |
| Spring Boot | 4.0.6 (replaces 3.x) | Boot 3 EOL June 2026; Boot 4 = Spring 7 + Jakarta EE 11 + Hibernate 7.1 |
| Next.js | 16 (replaces 15) | Stable Turbopack, React 19, improved RSC |
| jjwt | 0.13.0 (replaces 0.12.x) | CVE fixes; Jackson 3 alignment for Boot 4 |
