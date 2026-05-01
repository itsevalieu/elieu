# evalieu

Personal creative blog, newsletter, and portfolio — monorepo.

Newspaper/magazine-style newsletter front page, admin dashboard (web + mobile), hobby & recipe tracking, comment/reaction engagement, email subscriber management, and embedded game support.

## Structure

```
evalieu/
├── backend/
│   ├── newsletter-api/     Spring Boot 3.4 · Java 21 · PostgreSQL · JWT auth (:8081)
│   ├── portfolio-api/      Spring Boot 3.4 · Java 21 · PostgreSQL · JWT validation (:8080)
│   └── common/             Shared Java utilities (future)
├── frontend/
│   ├── newsletter/         Next.js 15 · React 19 · Public newsletter site (:3001)
│   ├── portfolio/          Next.js 15 · React 19 · Public portfolio site (:3000)
│   ├── admin/              Next.js 15 · Tailwind · Admin PWA (:3002)
│   └── common/             Shared TypeScript types (@evalieu/common)
├── mobile/                 Expo SDK 52 · React Native · Admin companion app
├── iac/                    Terraform modules for AWS infrastructure
└── docs/                   Roadmap, changelog, per-phase implementation plans
```

## Running Locally

### Prerequisites

- **Node.js** ≥ 20, **npm** ≥ 10
- **Java** 21 (e.g. Eclipse Temurin)
- **Docker** + Docker Compose (optional, for PostgreSQL or full stack)

### Option A — Lightweight (H2 in-memory database)

No Docker needed. Both APIs start with an in-memory H2 database using the `dev` profile.

```bash
# Terminal 1 — newsletter API
cd backend/newsletter-api
./gradlew bootRun --args='--spring.profiles.active=dev'

# Terminal 2 — portfolio API
cd backend/portfolio-api
./gradlew bootRun --args='--spring.profiles.active=dev'

# Terminal 3 — all frontends
npm install
npm run dev
```

H2 console available at `http://localhost:8081/h2-console` (JDBC URL: `jdbc:h2:mem:testdb`, user: `sa`, no password).

### Option B — Docker Compose (PostgreSQL)

Starts PostgreSQL 16 with Flyway migrations applied automatically.

```bash
# Start everything (PostgreSQL + both APIs)
docker-compose up -d

# Start frontends separately
npm install
npm run dev
```

Or start just the database and run APIs natively:

```bash
docker-compose up -d postgres

cd backend/newsletter-api
./gradlew bootRun --args='--spring.profiles.active=prod' \
  -Dspring.datasource.url=jdbc:postgresql://localhost:5432/evalieu_dev \
  -Dspring.datasource.username=evalieu \
  -Dspring.datasource.password=evalieu
```

### Running individual frontends

```bash
npx turbo dev --filter=@evalieu/portfolio      # :3000
npx turbo dev --filter=@evalieu/newsletter     # :3001
npx turbo dev --filter=@evalieu/admin          # :3002
```

### Mobile app

Requires the [Expo CLI](https://docs.expo.dev/get-started/installation/) and Expo Go on your device.

```bash
cd mobile
npm install
npx expo start
```

The mobile app connects to `http://localhost:8081` in dev mode. On Android emulator, use `10.0.2.2` instead of `localhost` (configured in `mobile/lib/config.ts`).

### Creating an admin user

The APIs don't seed an admin user. Create one manually after starting the newsletter-api:

```bash
# Generate a BCrypt hash for your password
# Then insert into the database:
#   INSERT INTO admin_users (email, password_hash) VALUES ('you@example.com', '$2a...');
#
# With H2 dev profile, use the H2 console at /h2-console
# With PostgreSQL, connect via psql or any client
```

## Environment Variables

### Frontend (optional)

| Variable | Default | Used by |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8081` | newsletter |
| `NEXT_PUBLIC_NEWSLETTER_API_URL` | `http://localhost:8081` | admin |
| `NEXT_PUBLIC_PORTFOLIO_API_URL` | `http://localhost:8080` | admin |
| `NEXT_PUBLIC_GA_ID` | — | Google Analytics 4 |
| `NEXT_PUBLIC_ADSENSE_ID` | — | Google AdSense |
| `NEXT_PUBLIC_KOFI_URL` | — | Ko-fi support button |
| `NEXT_PUBLIC_SITE_URL` | — | Share link canonical URL |

### Backend (prod profile)

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | HMAC-SHA256 signing key (≥ 32 chars) |
| `AWS_S3_BUCKET` | S3 bucket for media uploads |
| `AWS_REGION` | AWS region |

## API Overview

### Public endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts?page=0&size=20&category=` | Published posts |
| GET | `/api/posts/{slug}` | Single post |
| GET | `/api/issues`, `/api/issues/{slug}` | Newsletter issues |
| GET | `/api/categories` | Categories with subcategories |
| GET | `/api/hobbies`, `/api/recipes` | Hobby & recipe listings |
| GET | `/api/tracking/reading`, `/api/tracking/watching` | Life tracking |
| POST | `/api/posts/{id}/comments` | Submit comment (pending review) |
| POST | `/api/posts/{id}/reactions` | Add emoji reaction |
| POST | `/api/subscribe` | Subscribe to newsletter |
| POST | `/api/recommendations` | Submit recommendation |
| GET | `/api/health` | Service health check |

### Admin endpoints (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (returns JWT in httpOnly cookie) |
| `*` | `/api/admin/posts` | Post CRUD |
| `*` | `/api/admin/issues` | Issue CRUD + send newsletter |
| `*` | `/api/admin/comments` | Comment moderation |
| `*` | `/api/admin/hobbies`, `/api/admin/recipes` | Hobby & recipe CRUD |
| POST | `/api/admin/media/presign` | S3 presigned upload URL |
| GET | `/api/admin/stats/overview` | Dashboard stats |
| GET | `/api/admin/audit-log`, `/api/admin/system-logs` | Logs |
| GET/PUT | `/api/admin/settings` | Site configuration |

## Infrastructure

Terraform modules in `iac/` manage the AWS production environment:

| Module | Resources |
|--------|-----------|
| `networking` | VPC, 2 public + 2 private subnets, NAT gateway |
| `ecs` | Fargate cluster, ALB, task definitions, auto-scaling |
| `rds` | PostgreSQL 16 on RDS |
| `s3` | Media + games S3 buckets with CloudFront CDN |
| `ses` | Email sending via SES v2 |
| `secrets` | Secrets Manager for DB password and JWT secret |

See [`iac/README.md`](iac/README.md) for setup instructions.

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci-frontend.yml` | `frontend/` changes | Lint + build; Vercel auto-deploys |
| `ci-backend.yml` | `backend/` changes | Test, Docker build, ECR push, ECS deploy |
| `ci-infra.yml` | `iac/` changes | Terraform plan on PR, apply on merge |

## Deployment

- **Frontend**: Vercel auto-deploys from GitHub (portfolio, newsletter, admin)
- **Backend**: Docker → ECR → ECS Fargate via GitHub Actions
- **Infrastructure**: Terraform apply via CI on merge to main

## Docs

- [`docs/ROADMAP.md`](docs/ROADMAP.md) — project plan and phase status
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — work history and decisions
- [`docs/phases/`](docs/phases/) — detailed implementation specs per phase
