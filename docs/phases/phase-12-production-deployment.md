# Phase 12 — Production Deployment & Go-Live

**Status:** `[ ]` Not started
**Repo areas:** `iac/`, `.github/workflows/`, `mobile/`, DNS, Vercel, AWS Console

## Goal

Stand up all production infrastructure, configure external services, deploy the full stack, and publish the mobile app. After this phase, `evalieu.com` is live and updates deploy automatically via `git push` to `main`.

---

## Prerequisites

Before starting, ensure Phases 0–11 are complete and the application runs locally without errors via `docker-compose up` (backend) + `npm run dev` (frontend).

---

## Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│  GitHub (main branch)                                   │
│  ├── ci-frontend.yml → Vercel auto-deploys              │
│  ├── ci-backend.yml  → ECR push → ECS rolling deploy    │
│  └── ci-infra.yml    → Terraform plan/apply             │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌─────────┐        ┌───────────────────────────────────┐
│ Vercel  │        │ AWS (us-east-1)                    │
│─────────│        │  ALB (api.evalieu.com)             │
│ evalieu │        │   ├── /api/newsletter/* → ECS:8081 │
│ .com    │        │   └── /api/portfolio/*  → ECS:8080 │
│         │  API   │  RDS PostgreSQL 16                 │
│ news-   │───────▶│  S3 → CloudFront (cdn.evalieu.com) │
│ letter. │        │  SES (email sending)               │
│ evalieu │        │  Secrets Manager                   │
│ .com    │        │  CloudWatch (logs + alarms)        │
│         │        └───────────────────────────────────┘
│ admin.  │
│ evalieu │        ┌───────────────────────────────────┐
│ .com    │        │ Expo EAS                           │
└─────────┘        │  iOS  → Apple App Store            │
                   │  Android → Google Play Store       │
                   └───────────────────────────────────┘
```

---

## Accounts Required

| Account | Purpose | Cost | Sign-up |
|---------|---------|------|---------|
| **AWS** | Backend infra (ECS, RDS, ALB, S3, SES, etc.) | ~$45/mo | [aws.amazon.com](https://aws.amazon.com) |
| **Vercel** | Frontend hosting (3 Next.js apps) | Free (Hobby) | [vercel.com](https://vercel.com) |
| **Expo / EAS** | Mobile app builds & OTA updates | Free (15 builds/mo) | [expo.dev](https://expo.dev) |
| **Apple Developer** | iOS App Store distribution | $99/year | [developer.apple.com](https://developer.apple.com/programs/) |
| **Google Play Console** | Android Play Store distribution | $25 one-time | [play.google.com/console](https://play.google.com/console) |
| **Domain registrar** | `evalieu.com` ownership | ~$12/year | Namecheap / Cloudflare / Route 53 |
| **GitHub** (existing) | Source code, CI/CD, OIDC auth | Free | Already set up |

### Optional (Later Phases)

| Account | Purpose | Cost |
|---------|---------|------|
| Google Analytics | GA4 tracking | Free |
| Google AdSense | Display ads | Free (revenue share) |
| Ko-fi | Donation page | Free |

---

## Tasks

### 1. AWS Account Bootstrap (Manual, One-Time)

- [ ] Create AWS account and enable MFA on root
- [ ] Create IAM admin user for day-to-day use (do not use root)
- [ ] Set default region to `us-east-1`
- [ ] Create Terraform state S3 bucket:
  ```bash
  aws s3api create-bucket \
    --bucket evalieu-terraform-state \
    --region us-east-1
  aws s3api put-bucket-versioning \
    --bucket evalieu-terraform-state \
    --versioning-configuration Status=Enabled
  aws s3api put-bucket-encryption \
    --bucket evalieu-terraform-state \
    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  aws s3api put-public-access-block \
    --bucket evalieu-terraform-state \
    --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  ```
- [ ] Create DynamoDB lock table:
  ```bash
  aws dynamodb create-table \
    --table-name evalieu-terraform-locks \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
  ```
- [ ] Create ECR repositories:
  ```bash
  aws ecr create-repository --repository-name evalieu-newsletter-api --region us-east-1
  aws ecr create-repository --repository-name evalieu-portfolio-api --region us-east-1
  ```
- [ ] Request ACM certificate for `*.evalieu.com` + `evalieu.com`:
  ```bash
  aws acm request-certificate \
    --domain-name "evalieu.com" \
    --subject-alternative-names "*.evalieu.com" \
    --validation-method DNS \
    --region us-east-1
  ```
  Add the CNAME validation records to DNS, then wait for status `ISSUED`.

---

### 2. GitHub OIDC & IAM Role

- [ ] Create GitHub OIDC identity provider in AWS IAM:
  ```bash
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
  ```
- [ ] Create IAM role `evalieu-github-deploy` with trust policy:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:itsevalieu/elieu:*"
        }
      }
    }]
  }
  ```
- [ ] Attach policies to the role:
  - `AmazonECS_FullAccess`
  - `AmazonEC2ContainerRegistryPowerUser`
  - Custom inline policy for: S3, Secrets Manager, RDS, VPC, ALB, CloudWatch, SES, Route 53, Terraform state S3/DynamoDB, ACM, IAM (for ECS roles), Auto Scaling
- [ ] Add GitHub repository secret:
  - `AWS_DEPLOY_ROLE_ARN` = `arn:aws:iam::ACCOUNT_ID:role/evalieu-github-deploy`
- [ ] Create GitHub Environment `production` with required reviewer protection

---

### 3. Update Terraform Variables

- [ ] Edit `iac/environments/prod.tfvars` — replace placeholders:
  ```hcl
  newsletter_api_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-newsletter-api:latest"
  portfolio_api_image  = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-portfolio-api:latest"
  acm_certificate_arn  = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/ACTUAL_CERT_ID"
  ```
- [ ] Run Terraform:
  ```bash
  cd iac
  terraform init
  terraform plan -var-file=environments/prod.tfvars
  terraform apply -var-file=environments/prod.tfvars
  ```
- [ ] Record Terraform outputs:
  - `alb_dns_name` → needed for DNS
  - `cloudfront_domain` → needed for DNS
  - `rds_endpoint` → verify connectivity
  - `media_bucket_name` → verify S3

---

### 4. Post-Terraform Secrets

- [ ] Set database password in Secrets Manager:
  ```bash
  aws secretsmanager put-secret-value \
    --secret-id evalieu/db-password \
    --secret-string "$(openssl rand -base64 32)"
  ```
- [ ] Set JWT secret in Secrets Manager:
  ```bash
  aws secretsmanager put-secret-value \
    --secret-id evalieu/jwt-secret \
    --secret-string "$(openssl rand -base64 64)"
  ```
- [ ] Update RDS master password to match the Secrets Manager value:
  ```bash
  aws rds modify-db-instance \
    --db-instance-identifier evalieu-prod \
    --master-user-password "THE_SAME_PASSWORD"
  ```

---

### 5. Initial Docker Image Push

Before ECS can start, there must be images in ECR:

- [ ] Build and push both APIs manually for the first deployment:
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

  docker build -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-newsletter-api:latest backend/newsletter-api
  docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-newsletter-api:latest

  docker build -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-portfolio-api:latest backend/portfolio-api
  docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/evalieu-portfolio-api:latest
  ```
- [ ] Force new ECS deployment to pick up the images:
  ```bash
  aws ecs update-service --cluster evalieu-prod --service newsletter-api --force-new-deployment
  aws ecs update-service --cluster evalieu-prod --service portfolio-api --force-new-deployment
  ```
- [ ] Verify services are running:
  ```bash
  aws ecs describe-services --cluster evalieu-prod --services newsletter-api portfolio-api \
    --query 'services[].{name:serviceName,running:runningCount,desired:desiredCount,status:status}'
  ```

---

### 6. Domain & DNS Configuration

- [ ] Purchase or configure `evalieu.com`
- [ ] Add DNS records:

| Record | Type | Value | TTL |
|--------|------|-------|-----|
| `evalieu.com` | A / CNAME | Vercel (provided during project setup) | 300 |
| `newsletter.evalieu.com` | CNAME | `cname.vercel-dns.com` | 300 |
| `admin.evalieu.com` | CNAME | `cname.vercel-dns.com` | 300 |
| `api.evalieu.com` | CNAME | ALB DNS name (from Terraform output) | 300 |
| `cdn.evalieu.com` | CNAME | CloudFront domain (from Terraform output) | 300 |
| SES DKIM (×3) | CNAME | From Terraform/SES output | 3600 |
| ACM validation | CNAME | From ACM (if not already done) | 300 |

- [ ] Verify DNS propagation: `dig +short api.evalieu.com`
- [ ] Test ALB health: `curl https://api.evalieu.com/actuator/health`

---

### 7. Vercel Setup

- [ ] Sign up at vercel.com with GitHub
- [ ] Import the `itsevalieu/elieu` repository
- [ ] Create 3 projects:

| Project Name | Root Directory | Production Domain | Framework |
|-------------|---------------|-------------------|-----------|
| `evalieu-portfolio` | `frontend/portfolio` | `evalieu.com` | Next.js |
| `evalieu-newsletter` | `frontend/newsletter` | `newsletter.evalieu.com` | Next.js |
| `evalieu-admin` | `frontend/admin` | `admin.evalieu.com` | Next.js |

- [ ] For each project, set environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_API_URL` = `https://api.evalieu.com`
- [ ] Assign custom domains in Vercel project settings (will prompt for DNS verification)
- [ ] Verify preview deploys work: create a test PR and confirm Vercel builds it
- [ ] Verify production deploy: push to `main` and confirm all 3 sites are live

---

### 8. SES Production Access

- [ ] Verify sending domain in SES console (Terraform should have created the identity)
- [ ] Add DKIM CNAME records to DNS (from Terraform output)
- [ ] Request production access (SES starts in sandbox — can only send to verified emails):
  - Go to SES Console → Account Dashboard → Request Production Access
  - Describe use case: "Personal blog newsletter, double opt-in, one-click unsubscribe"
  - Takes 24–48 hours for approval
- [ ] After approval, set the "from" address in newsletter-api config
- [ ] Send a test email to verify end-to-end delivery

---

### 9. Create Admin User in Production

- [ ] The `DataSeeder` only runs in `dev`/`docker` profiles, not `prod`
- [ ] Create admin user via Flyway migration or direct SQL:
  ```sql
  INSERT INTO users (email, password_hash, role, created_at)
  VALUES (
    'your-email@evalieu.com',
    '$2a$10$BCRYPT_HASH_HERE',
    'ADMIN',
    NOW()
  );
  ```
  Generate the bcrypt hash locally:
  ```bash
  htpasswd -nbBC 10 "" 'your-secure-password' | cut -d: -f2
  ```
- [ ] Alternatively, temporarily enable the `/api/auth/register` endpoint in prod and register, then disable it

---

### 10. Mobile App — Expo EAS Setup

- [ ] Create Expo account at [expo.dev](https://expo.dev)
- [ ] Install EAS CLI: `npm install -g eas-cli && eas login`
- [ ] Link the project:
  ```bash
  cd mobile
  eas init --id YOUR_EAS_PROJECT_ID
  ```
- [ ] Update `mobile/lib/config.ts` — verify prod URL is `https://api.evalieu.com`
- [ ] Update `mobile/eas.json` — replace placeholder Apple/Google values

#### iOS (Apple Developer Account required — $99/year)

- [ ] Enroll in Apple Developer Program at [developer.apple.com](https://developer.apple.com/programs/)
- [ ] Create App ID: `com.evalieu.admin` in Apple Developer portal
- [ ] EAS handles provisioning profiles and certificates automatically:
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Submit to App Store:
  ```bash
  eas submit --platform ios --profile production
  ```
- [ ] Fill out App Store Connect listing (screenshots, description, privacy policy URL)
- [ ] Submit for Apple review (typically 24–48 hours)

#### Android (Google Play Console — $25 one-time)

- [ ] Create Google Play Developer account
- [ ] Create app listing for "Eva's Admin" in Play Console
- [ ] Create a Google Cloud service account with Play Store API access:
  - Go to Google Cloud Console → IAM → Service Accounts → Create
  - Grant "Service Account User" role
  - Download JSON key → save as `mobile/google-service-account.json` (gitignored)
  - In Play Console → Settings → API access → Link the service account
- [ ] Build and submit:
  ```bash
  eas build --platform android --profile production
  eas submit --platform android --profile production
  ```
- [ ] Submit for Google review (typically 24–72 hours for first app)

---

### 11. Smoke Test Checklist

After everything is deployed, verify each piece:

- [ ] **Portfolio**: `https://evalieu.com` loads, projects display
- [ ] **Newsletter**: `https://newsletter.evalieu.com` loads, posts render in newspaper/magazine layouts
- [ ] **Admin**: `https://admin.evalieu.com` loads, can log in, can create/edit posts
- [ ] **API health**: `https://api.evalieu.com/actuator/health` returns `200`
- [ ] **API CORS**: Frontend can fetch posts from the API without CORS errors
- [ ] **Image upload**: Upload an image in admin → appears on CDN (`cdn.evalieu.com`)
- [ ] **Reactions**: Click an emoji on a post → count increments
- [ ] **Comments**: Submit a comment → appears in admin moderation queue
- [ ] **Subscribe**: Submit email on newsletter → confirmation email arrives
- [ ] **Newsletter send**: Send a test newsletter from admin → email arrives
- [ ] **Mobile**: Open the app → can log in → can view dashboard and create a post
- [ ] **CI/CD**: Push a small change to `main` → backend deploys to ECS, frontend deploys to Vercel

---

### 12. Monitoring & Alerting Setup

- [ ] Verify CloudWatch log groups exist: `/ecs/evalieu-prod/newsletter-api`, `/ecs/evalieu-prod/portfolio-api`
- [ ] Create SNS topic `evalieu-alerts` and subscribe your email
- [ ] Create CloudWatch alarms:
  - ALB 5xx error rate > 5% → SNS
  - ECS running task count = 0 → SNS
  - RDS CPU > 80% sustained 5 min → SNS
  - RDS free storage < 2GB → SNS
  - SES bounce rate > 5% → SNS
- [ ] Optional: Create CloudWatch dashboard with ALB latency, ECS CPU, RDS connections

---

## Cost Summary

| Service | Monthly Estimate |
|---------|-----------------|
| ECS Fargate (2 tasks × 0.25 vCPU × 512MB) | ~$10 |
| RDS PostgreSQL (db.t4g.micro, 20GB, single-AZ) | ~$15 |
| ALB (1 load balancer, low traffic) | ~$16 |
| S3 (< 10GB media) | ~$0.25 |
| CloudFront (low traffic CDN) | ~$1 |
| ECR (< 1GB images) | ~$0.10 |
| SES (< 1000 emails/mo) | ~$0.10 |
| Route 53 (1 hosted zone) | ~$0.50 |
| Secrets Manager (5 secrets) | ~$2 |
| Vercel (Hobby plan) | $0 |
| Expo EAS (free tier) | $0 |
| **Total AWS** | **~$45/mo** |
| Apple Developer (annual) | $99/year (~$8.25/mo) |
| Google Play (one-time) | $25 total |
| Domain (annual) | ~$12/year (~$1/mo) |
| **Total all-in** | **~$54/mo** |

---

## Environment Comparison

| Concern | Local Dev | Production |
|---------|-----------|------------|
| Database | H2 in-memory or PostgreSQL (Docker) | RDS PostgreSQL 16 |
| Backend | `./gradlew bootRun` or Docker Compose | ECS Fargate containers |
| Frontend | `npm run dev` (ports 3000/3001/3002) | Vercel (auto-deploy on push) |
| Media | Local filesystem / mock | S3 + CloudFront CDN |
| Email | Skipped (no SES client) | AWS SES |
| Mobile | Expo Go (`npx expo start`) | EAS Build → App/Play Store |
| Secrets | Hardcoded in dev/docker properties | AWS Secrets Manager |
| Auth cookies | `SameSite=Lax`, `Secure=false` | `SameSite=Strict`, `Secure=true` |
| Flyway | Disabled (H2) / Enabled (Docker) | Enabled (validates schema) |

---

## Decisions & Notes

| Decision | Choice | Why |
|----------|--------|-----|
| Push `:latest` + `:sha` tags | Both | ECS task defs reference `:latest` from Terraform; `:sha` gives immutable audit trail |
| ECS cluster name `evalieu-prod` | Matches Terraform `${project}-${environment}` | CI was incorrectly using `evalieu`; fixed to match Terraform output |
| Manual first image push | Before CI/CD runs | ECS services will fail to start if no image exists in ECR |
| Admin user via SQL | Not seeded in prod | `DataSeeder` only runs in dev/docker profiles; prod gets explicit insert |
| SES sandbox exit | Request production access | Sandbox only allows sending to verified emails; production access required for newsletter |
| EAS build profiles | dev/preview/production | dev = simulator, preview = internal TestFlight/APK, production = store submission |
| Free tiers first | Vercel Hobby + EAS Free + SES free tier | Scale up only when traffic justifies it |
