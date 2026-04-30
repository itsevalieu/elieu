# evalieu

Personal site monorepo — portfolio and newsletter, full-stack.

## Structure

```
evalieu/
├── backend/
│   ├── portfolio-api/      Spring Boot 3 · Java 21 · REST API for portfolio data
│   ├── newsletter-api/     Spring Boot 3 · Java 21 · Newsletter service
│   └── common/             Shared Java utilities (future)
├── frontend/
│   ├── portfolio/          Next.js 15 · React 19 · Portfolio site
│   ├── newsletter/         Next.js 15 · React 19 · Newsletter app
│   └── common/             Shared TypeScript types (@evalieu/common)
└── iac/                    Infrastructure as code (future)
```

## Getting Started

### Frontend

Requires Node.js ≥ 20 and npm ≥ 10.

```bash
# Install all workspace dependencies
npm install

# Run all frontend apps in dev mode
npm run dev

# Build all frontend apps
npm run build

# Run a single app
npx turbo dev --filter=@evalieu/portfolio
npx turbo dev --filter=@evalieu/newsletter
```

### Backend

Requires Java 21. Each service has its own Gradle wrapper.

```bash
# Run portfolio API (port 8080)
cd backend/portfolio-api
./gradlew bootRun

# Run newsletter API
cd backend/newsletter-api
./gradlew bootRun

# Run tests
./gradlew test
```

## CI

GitHub Actions workflows live in `.github/workflows/`:

- `ci-backend.yml` — tests both Spring Boot APIs on changes to `backend/`
- `ci-frontend.yml` — lints and builds Next.js apps on changes to `frontend/`

Both workflows use path filtering so only affected apps are tested/built.
