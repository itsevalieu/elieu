# Phase 1 — Content API Foundation

**Status:** `[ ]` Not started  
**Repo areas:** `backend/newsletter-api/`, `backend/portfolio-api/`

## Goal

Stand up the full PostgreSQL schema and Spring Boot REST API that all future phases depend on. No frontend work in this phase.

---

## Tasks

### Database Schema (Flyway migrations in `backend/newsletter-api/src/main/resources/db/migration/`)

- [ ] `V1__create_posts.sql` — posts table with all fields (id, title, excerpt, body, category, subcategory, cover_image_url, gallery_urls, status, format, layout_hint, issue_id, tags, published_at, comment_count, reaction_counts, quote_author, quote_source)
- [ ] `V2__create_issues.sql` — issues table (id, month, year, title, layout_preference, status, cover_image_url)
- [ ] `V3__create_categories.sql` — categories + subcategories reference table
- [ ] `V4__create_comments.sql` — comments table (id, post_id, author_name, author_email, body, status, created_at)
- [ ] `V5__create_reactions.sql` — reactions table (id, post_id, emoji, session_id)
- [ ] `V6__create_subscribers.sql` — subscribers table (id, email, display_name, status, confirmed_at, unsubscribed_at, source, confirmation_token, token_expires_at)
- [ ] `V7__create_hobbies.sql` — hobbies + hobby_progress_entries tables
- [ ] `V8__create_recipes.sql` — recipes table (linked to posts)
- [ ] `V9__create_audit_log.sql` — admin_audit_log table (id, action, entity_type, entity_id, detail, performed_at)
- [ ] `V10__create_system_logs.sql` — system_logs table (id, severity, service, message, stack_trace, endpoint, logged_at)

### Spring Boot — newsletter-api

- [ ] Java entities for all tables above (JPA, Lombok)
- [ ] Repositories (Spring Data JPA)
- [ ] Services with business logic
- [ ] REST controllers:
  - [ ] `PostController` — CRUD, public read + admin write
  - [ ] `IssueController` — CRUD, public read + admin write
  - [ ] `CategoryController` — read
  - [ ] `SubscriberController` — public subscribe/confirm/unsubscribe + admin list
  - [ ] `CommentController` — public submit + admin moderate
  - [ ] `ReactionController` — public react
  - [ ] `HobbyController` — admin CRUD
  - [ ] `RecipeController` — admin CRUD
  - [ ] `AuditLogController` — admin read-only
  - [ ] `SystemLogController` — admin read-only
  - [ ] `HealthController` — public `GET /api/health`
- [ ] `AuditLogService` — called by all admin controllers to record actions
- [ ] Logback config — JSON structured logs; WARN/ERROR interceptor writes to `system_logs`
- [ ] JWT auth — `SecurityFilterChain`, login endpoint, token issuance + validation
- [ ] Rate limiting filter — comment submission (3/IP/hr), subscribe form (3/IP/hr), login (5/IP/15min)
- [ ] Honeypot filter — reject comment/subscribe submissions with hidden field populated
- [ ] S3 config — presigned URL endpoint for media upload (`POST /api/admin/media/presign`)
- [ ] CORS config — allow only known frontend origins
- [ ] `GET /api/health` — checks DB, S3, SES connectivity

### Spring Boot — portfolio-api

- [ ] Add JWT validation middleware (validate tokens issued by newsletter-api)
- [ ] Add `POST /api/admin/projects/{id}/achievements` endpoint
- [ ] Add `PUT /api/admin/achievements/{id}` endpoint
- [ ] Add `DELETE /api/admin/achievements/{id}` endpoint
- [ ] Add audit log calls to achievement admin endpoints

### Testing

- [ ] Unit tests for services (Mockito)
- [ ] Integration tests for controllers (Testcontainers + MySQL)
- [ ] Auth tests — verify protected endpoints reject unauthenticated requests

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
