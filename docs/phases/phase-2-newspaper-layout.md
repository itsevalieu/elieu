# Phase 2 — Public Site: Newspaper Layout

**Status:** `[ ]` Not started  
**Repo areas:** `frontend/newsletter/`, `frontend/common/`  
**Depends on:** Phase 1

## Goal

Build the public-facing newsletter site with the newspaper front page layout. Readers can browse issues, read articles, and navigate by category. No auth, no admin.

---

## Tasks

### Shared Types (`frontend/common/`)

- [ ] Add `Post`, `Issue`, `Category` TypeScript interfaces
- [ ] Add `Reaction`, `Comment` (public view) interfaces
- [ ] Export all from `src/index.ts`

### Newsletter API Client (`frontend/newsletter/src/lib/`)

- [ ] `api.ts` — typed fetch wrapper for `newsletter-api`
- [ ] `posts.ts` — `getAllPosts()`, `getPostBySlug()`, `getPostsByCategory()`, `getPostsByIssue()`
- [ ] `issues.ts` — `getIssues()`, `getIssueBySlug()`
- [ ] `categories.ts` — `getCategories()`

### Pages (`frontend/newsletter/src/app/`)

- [ ] `/` — front page (current issue, newspaper layout)
- [ ] `/issues/[slug]` — specific issue front page
- [ ] `/posts/[slug]` — full article page
- [ ] `/categories/[category]` — category listing page
- [ ] `/categories/[category]/[subcategory]` — subcategory listing

### Newspaper Layout Components

- [ ] `Masthead` — serif publication name, issue number, date, edition tagline
- [ ] `FrontPageGrid` — CSS Grid multi-column newspaper layout
- [ ] `ExcerptCard` — excerpt with headline, byline, layout_hint-aware sizing (featured/column/brief/sidebar/pull-quote)
- [ ] `QuoteBlock` — styled pull-quote with author + source attribution
- [ ] `PhotoCaptionBlock` — image with caption, no headline
- [ ] `SectionDivider` — horizontal rule with section label (e.g. "Projects", "Reviews")
- [ ] `Sidebar` — right column for briefs, ads, Ko-fi widget, recommendations
- [ ] `IssueNav` — month/year navigation between issues

### Article Page Components

- [ ] `ArticleHeader` — title, date, category badge, cover image
- [ ] `ArticleBody` — rendered Markdown (remark + rehype-sanitize pipeline)
- [ ] `ArticleFooter` — tags, share bar, Ko-fi support section
- [ ] `ReactionBar` — emoji reaction buttons with counts (Phase 6 wires up interactivity; render static counts here)
- [ ] `CommentCount` — shows 💬 N badge (links to comments section below)

### SEO & Meta

- [ ] Open Graph + Twitter Card meta tags on all pages
- [ ] Canonical URLs
- [ ] `sitemap.xml` and `robots.txt`

### Styling

- [ ] Global serif typography system (e.g. Playfair Display for headlines, Georgia/Lora for body)
- [ ] Newspaper-appropriate color palette (off-white background, dark ink, accent red or navy)
- [ ] Responsive — newspaper grid collapses gracefully on mobile
- [ ] Print stylesheet — front page looks good printed

---

## Decisions & Notes

<!-- Record decisions made during implementation here -->
