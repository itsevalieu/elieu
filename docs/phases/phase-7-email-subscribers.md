# Phase 7 — Newsletter Email & Subscriber Management

**Status:** `[ ]` Not started  
**Repo areas:** `backend/newsletter-api/`, `frontend/newsletter/`, `frontend/admin/`  
**Depends on:** Phase 1, Phase 4

## Goal

Readers can subscribe to the newsletter. Every month, publishing an issue triggers an email send to all confirmed subscribers with the front page digest. Subscriber list is fully manageable from the admin.

---

## Tasks

### AWS SES Setup

- [ ] Verify sending domain with SES (SPF, DKIM, DMARC DNS records)
- [ ] Configure SES in `newsletter-api` (AWS SDK v2 or Spring Cloud AWS)
- [ ] SES bounce + complaint webhook endpoint (`POST /api/webhooks/ses`) — auto-unsubscribes affected addresses
- [ ] SES sandbox exit (production access request to AWS)

### Subscribe Flow — Backend

- [ ] `POST /api/subscribe` — validates email format; rate limit 3/IP/hr; honeypot check; if new: create subscriber with status=pending, generate UUID v4 confirmation token (24hr expiry), send confirmation email via SES; if already confirmed: silent success
- [ ] `GET /api/subscribe/confirm?token=...` — validates token not expired, sets status=confirmed, clears token
- [ ] `GET /api/unsubscribe?token=...` — sets status=unsubscribed immediately, no login required
- [ ] `POST /api/webhooks/ses` — handles bounce and complaint notifications, auto-unsubscribes

### Subscribe Flow — Frontend

- [ ] `SubscribeWidget` component — email input + submit; embedded on:
  - [ ] Newsletter front page (sidebar)
  - [ ] Article page footer
  - [ ] Portfolio site footer
- [ ] Confirmation landing page (`/subscribe/confirm`) — "You're subscribed!" with link back to site
- [ ] Already-subscribed page — identical to confirmation (no enumeration)
- [ ] Unsubscribe landing page (`/unsubscribe`) — "You've been unsubscribed" with re-subscribe option

### Monthly Email Send

- [ ] Email template — HTML email mirroring the newspaper layout: masthead, section headlines, post excerpts with "Read more →" links, unsubscribe link in footer
- [ ] `POST /api/admin/issues/{id}/send` — compiles current issue posts into email template, sends to all confirmed subscribers in SES-compliant batches (14/s to stay under limits)
- [ ] Delivery tracking — log sent/bounced/complained counts per issue send
- [ ] RFC 8058 `List-Unsubscribe` header on every email

### Admin — Subscriber Management (`/subscribers`)

- [ ] Subscriber list — table with email, display name, status, confirmed date, source, last email sent
- [ ] Search and filter by status
- [ ] Manually add subscriber (bypasses double opt-in — for imported lists)
- [ ] Manually unsubscribe / delete subscriber
- [ ] Export all confirmed subscribers as CSV
- [ ] Issue send history — per-issue send stats (sent count, bounce count, complaint count, open rate, click rate)

### Email Tracking (open + click rates)

- [ ] 1×1 tracking pixel per email (`GET /api/track/open?token=...`) — records open event
- [ ] Link wrapping for tracked clicks (`GET /api/track/click?token=...&url=...`) — records click, redirects
- [ ] Open and click rates shown in admin per issue send

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
