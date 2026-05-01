# evalieu

Personal site monorepo — portfolio, newsletter, and admin, full-stack.

## Structure

```
evalieu/
├── backend/
│   ├── portfolio-api/      Spring Boot · Java 21 · REST API for portfolio data
│   ├── newsletter-api/     Spring Boot · Java 21 · Newsletter service
│   └── common/             Shared Java utilities (future)
├── frontend/
│   ├── portfolio/          Next.js · React 19 · Portfolio site (:3000)
│   ├── newsletter/         Next.js · React 19 · Newsletter app (:3001)
│   ├── admin/              Next.js · React 19 · Admin PWA (:3002)
│   └── common/             Shared TypeScript types (@evalieu/common)
├── iac/                    Terraform modules for AWS infrastructure
└── docs/                   Roadmap, changelog, per-phase implementation plans
```

## Getting Started

### Quick start (Docker)

Requires Docker and Docker Compose.

```bash
# Start PostgreSQL + both APIs
docker-compose up -d

# Start all frontends
npm run dev
```

### Frontend only

Requires Node.js ≥ 20 and npm ≥ 10.

```bash
npm install
npm run dev                                    # all frontend apps
npx turbo dev --filter=@evalieu/portfolio      # portfolio only (:3000)
npx turbo dev --filter=@evalieu/newsletter     # newsletter only (:3001)
npx turbo dev --filter=@evalieu/admin          # admin only (:3002)
npm run build                                  # build all
```

### Backend only

Requires Java 21. Each service has its own Gradle wrapper.

```bash
# Start PostgreSQL (needed for backend)
docker-compose up -d postgres

# Run portfolio API (port 8080)
cd backend/portfolio-api && ./gradlew bootRun

# Run newsletter API (port 8081)
cd backend/newsletter-api && ./gradlew bootRun
```

## Infrastructure

Terraform modules in `iac/` manage the AWS production environment:

| Module | Purpose |
|--------|---------|
| `networking` | VPC, subnets, NAT gateway, security groups |
| `ecs` | Fargate cluster, task definitions, ALB, auto-scaling |
| `rds` | PostgreSQL 16 on RDS |
| `s3` | Media + games buckets with CloudFront CDN |
| `ses` | Email sending via SES |
| `secrets` | Secrets Manager for DB password and JWT secret |

```bash
cd iac
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci-frontend.yml` | Changes to `frontend/` | Lint + build; Vercel auto-deploys |
| `ci-backend.yml` | Changes to `backend/` | Test → Docker build → ECR push → ECS deploy |
| `ci-infra.yml` | Changes to `iac/` | Terraform plan on PR, apply on merge to main |

All workflows use path filtering — only affected services are built/deployed.

## Deployment

- **Frontend**: Vercel auto-deploys from GitHub (portfolio, newsletter, admin)
- **Backend**: Docker images pushed to ECR, deployed to ECS Fargate via GitHub Actions
- **Infrastructure**: Terraform apply via CI on merge to main

## Docs

See `docs/ROADMAP.md` for the full project plan and `docs/CHANGELOG.md` for work history.
