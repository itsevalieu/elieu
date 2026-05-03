package com.evalieu.newsletter.config;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.evalieu.newsletter.model.AdminUser;
import com.evalieu.newsletter.model.Category;
import com.evalieu.newsletter.model.Hobby;
import com.evalieu.newsletter.model.Issue;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.model.Subcategory;
import com.evalieu.newsletter.repository.AdminUserRepository;
import com.evalieu.newsletter.repository.CategoryRepository;
import com.evalieu.newsletter.repository.HobbyRepository;
import com.evalieu.newsletter.repository.IssueRepository;
import com.evalieu.newsletter.repository.PostRepository;
import com.evalieu.newsletter.repository.SubcategoryRepository;

import org.springframework.beans.factory.annotation.Value;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

@Component
@Profile({"dev", "docker"})
@Slf4j
public class DataSeeder implements ApplicationRunner {

	private final AdminUserRepository adminUserRepository;
	private final CategoryRepository categoryRepository;
	private final SubcategoryRepository subcategoryRepository;
	private final IssueRepository issueRepository;
	private final PostRepository postRepository;
	private final HobbyRepository hobbyRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${seed.admin.email:admin@evalieu.local}")
	private String seedAdminEmail;

	@Value("${seed.admin.password:#{T(java.util.UUID).randomUUID().toString()}}")
	private String seedAdminPassword;

	public DataSeeder(
			AdminUserRepository adminUserRepository,
			CategoryRepository categoryRepository,
			SubcategoryRepository subcategoryRepository,
			IssueRepository issueRepository,
			PostRepository postRepository,
			HobbyRepository hobbyRepository,
			PasswordEncoder passwordEncoder) {
		this.adminUserRepository = adminUserRepository;
		this.categoryRepository = categoryRepository;
		this.subcategoryRepository = subcategoryRepository;
		this.issueRepository = issueRepository;
		this.postRepository = postRepository;
		this.hobbyRepository = hobbyRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (adminUserRepository.count() > 0) {
			log.info("Database already seeded, skipping");
			return;
		}

		log.info("Seeding development data...");

		seedAdminUser();
		var cats = seedCategories();
		var issue = seedIssue();
		seedPosts(cats, issue);
		seedHobbies();

		log.info("Development data seeded successfully");
	}

	private void seedAdminUser() {
		AdminUser admin = AdminUser.builder()
				.email(seedAdminEmail)
				.passwordHash(passwordEncoder.encode(seedAdminPassword))
				.createdAt(Instant.now())
				.build();
		adminUserRepository.save(admin);
		log.info("Created admin user: {} (password from SEED_ADMIN_PASSWORD env var or auto-generated)", seedAdminEmail);
	}

	private record SeedCategories(
			Category hobbies, Category lifestyle,
			Subcategory shortStories, Subcategory poems,
			Subcategory watercolors, Subcategory woodworking,
			Subcategory codingProjects, Subcategory gameDev,
			Subcategory gardening,
			Subcategory travel, Subcategory foodReviews,
			Subcategory bookReviews, Subcategory showReviews,
			Subcategory recipes, Subcategory photos,
			Subcategory affirmations) {
	}

	private SeedCategories seedCategories() {
		var hobbies = saveCategory("Hobbies", "hobbies", 1);
		var shortStories = saveSubcategory(hobbies, "Short Stories", "short-stories");
		var poems = saveSubcategory(hobbies, "Poems", "poems");
		var watercolors = saveSubcategory(hobbies, "Watercolors", "watercolors");
		var woodworking = saveSubcategory(hobbies, "Woodworking", "woodworking");
		var codingProjects = saveSubcategory(hobbies, "Coding Projects", "coding-projects");
		var gameDev = saveSubcategory(hobbies, "Game Dev", "game-dev");
		var gardening = saveSubcategory(hobbies, "Gardening", "gardening");

		var lifestyle = saveCategory("Lifestyle", "lifestyle", 2);
		var travel = saveSubcategory(lifestyle, "Travel", "travel");
		var foodReviews = saveSubcategory(lifestyle, "Food Reviews", "food-reviews");
		var bookReviews = saveSubcategory(lifestyle, "Book Reviews", "book-reviews");
		var showReviews = saveSubcategory(lifestyle, "Show Reviews", "show-reviews");
		var recipes = saveSubcategory(lifestyle, "Recipes", "recipes");
		var photos = saveSubcategory(lifestyle, "Photos", "photos");
		var affirmations = saveSubcategory(lifestyle, "Affirmations", "affirmations");

		return new SeedCategories(hobbies, lifestyle, shortStories, poems,
				watercolors, woodworking, codingProjects, gameDev, gardening,
				travel, foodReviews, bookReviews, showReviews, recipes,
				photos, affirmations);
	}

	private Category saveCategory(String name, String slug, int sortOrder) {
		Category cat = Category.builder().name(name).slug(slug).sortOrder(sortOrder).build();
		return categoryRepository.save(cat);
	}

	private Subcategory saveSubcategory(Category parent, String name, String slug) {
		Subcategory sub = Subcategory.builder()
				.name(name).slug(slug).categoryId(parent.getId()).build();
		return subcategoryRepository.save(sub);
	}

	private Issue seedIssue() {
		Issue issue = Issue.builder()
				.month((short) 5)
				.year((short) 2026)
				.title("The Evalieu Times — May 2026")
				.slug("may-2026")
				.status("published")
				.layoutPreference("newspaper")
				.build();
		return issueRepository.save(issue);
	}

	private void seedPosts(SeedCategories c, Issue issue) {
		Instant now = Instant.now();
		Long iid = issue.getId();
		Long hob = c.hobbies.getId();
		Long life = c.lifestyle.getId();

		// ── Hobbies / Writing ───────────────────────────────────

		postRepository.save(Post.builder()
				.title("Welcome to The Evalieu Times")
				.slug("welcome-to-the-evalieu-times")
				.excerpt("A creative personal newsletter covering writing, tech, art, and everything in between.")
				.body("# Welcome!\n\nThis is the first issue of **The Evalieu Times** — a creative newsletter "
						+ "where I share short stories, poems, coding projects, watercolors, travel adventures, "
						+ "recipes, and whatever else I'm working on.\n\n"
						+ "Think of it as a newspaper for one person's many hobbies. Grab a coffee and stay a while.")
				.coverImageUrl("https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80")
				.categoryId(hob)
				.format("article").layoutHint("featured")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("welcome", "newsletter", "introduction"))
				.reactionCounts(Map.of("❤️", 3, "🎉", 5, "🔥", 2))
				.commentCount(2).viewCount(42)
				.build());

		postRepository.save(Post.builder()
				.title("The Lighthouse Keeper's Daughter")
				.slug("the-lighthouse-keepers-daughter")
				.excerpt("A short story about solitude, fog, and the ships that never arrived.")
				.body("# The Lighthouse Keeper's Daughter\n\n"
						+ "Every evening, Maren climbed the 142 steps to the lantern room. "
						+ "The brass needed polishing, the wick needed trimming, and the logbook needed an entry — "
						+ "even when there was nothing to report.\n\n"
						+ "\"No vessels sighted,\" she wrote for the thirty-seventh consecutive day.\n\n"
						+ "The fog had settled in late October and never left. It pressed against the windows "
						+ "like a living thing, swallowing the beam before it reached the water.\n\n"
						+ "She didn't mind the solitude. Solitude was honest. It was the waiting that wore at her — "
						+ "the certainty that something was coming, just beyond the grey.")
				.coverImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80")
				.categoryId(hob)
				.subcategoryId(c.shortStories.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("fiction", "short-story", "atmospheric"))
				.reactionCounts(Map.of("❤️", 8, "😮", 3))
				.commentCount(4).viewCount(67)
				.build());

		postRepository.save(Post.builder()
				.title("Small Hours")
				.slug("small-hours")
				.excerpt("A poem about the strange clarity that only comes at 3 AM.")
				.body("# Small Hours\n\n"
						+ "The kettle clicks off at quarter past three,\n"
						+ "steam rising like a question I can't answer.\n"
						+ "Outside, the street is a river of amber light\n"
						+ "and nothing moves except the foxes.\n\n"
						+ "I hold the mug with both hands.\n"
						+ "The warmth is a small certainty\n"
						+ "in a house full of half-finished sentences\n"
						+ "and books left open, face down,\n"
						+ "on every flat surface.\n\n"
						+ "At this hour the world is honest:\n"
						+ "the fridge hums its one note,\n"
						+ "the clock counts without judgement,\n"
						+ "and I am simply here — awake,\n"
						+ "alive, unfinished.")
				.categoryId(hob)
				.subcategoryId(c.poems.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("poetry", "night", "reflection"))
				.reactionCounts(Map.of("❤️", 12, "💡", 2))
				.commentCount(1).viewCount(34)
				.build());

		// ── Hobbies / Creative ──────────────────────────────────

		postRepository.save(Post.builder()
				.title("Watercolor Study: Morning Light on Water")
				.slug("watercolor-morning-light-on-water")
				.excerpt("Experimenting with wet-on-wet technique to capture reflections on a still lake at dawn.")
				.body("# Morning Light on Water\n\n"
						+ "This study started as a color-mixing exercise and turned into something I'm actually proud of.\n\n"
						+ "## Technique\n"
						+ "- **Paper**: Arches 300gsm cold-pressed\n"
						+ "- **Palette**: Cerulean blue, raw sienna, permanent rose, sap green\n"
						+ "- **Method**: Wet-on-wet for the sky and water, then dry-brush details for the tree line\n\n"
						+ "The trick with reflections is restraint. The water should be *simpler* than what it mirrors — "
						+ "fewer details, softer edges, slightly muted colors.")
				.coverImageUrl("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80")
				.categoryId(hob)
				.subcategoryId(c.watercolors.getId())
				.format("photo-caption").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("watercolor", "landscape", "technique"))
				.reactionCounts(Map.of("❤️", 15, "🔥", 6))
				.viewCount(51)
				.build());

		postRepository.save(Post.builder()
				.title("Building a Dovetail Jewelry Box")
				.slug("dovetail-jewelry-box")
				.excerpt("My first attempt at hand-cut dovetails — cherry and walnut with a cedar-lined interior.")
				.body("# Dovetail Jewelry Box\n\n"
						+ "I've been cutting dovetails with a router jig for a year, but hand-cutting "
						+ "is a completely different skill. This box was my test piece.\n\n"
						+ "## Materials\n"
						+ "- Cherry sides (3/8\" thick)\n"
						+ "- Walnut lid with brass hinges\n"
						+ "- Cedar lining for aroma\n\n"
						+ "## Lessons Learned\n"
						+ "1. Mark your waste. I cut the wrong side of the line on my first tail.\n"
						+ "2. A sharp chisel matters more than a sharp saw.\n"
						+ "3. The fit should be snug from the saw — if you need to hammer, it's too tight.\n\n"
						+ "Total time: about 12 hours over three weekends. Not fast, but deeply satisfying.")
				.coverImageUrl("https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80")
				.categoryId(hob)
				.subcategoryId(c.woodworking.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("woodworking", "joinery", "handmade"))
				.reactionCounts(Map.of("👏", 9, "🔥", 4, "❤️", 3))
				.commentCount(3).viewCount(44)
				.build());

		postRepository.save(Post.builder()
				.title("Watercolor Palette Swatches: Spring Collection")
				.slug("watercolor-palette-spring-swatches")
				.excerpt("A reference card for my current working palette — 16 colors, all granulating pigments.")
				.body("# Spring Palette Swatches\n\n"
						+ "Every few months I repaint my swatch cards to check pigment behavior.\n\n"
						+ "## Current Favorites\n"
						+ "| Pigment | Brand | Granulation |\n"
						+ "|---|---|---|\n"
						+ "| French Ultramarine | W&N | Heavy |\n"
						+ "| Burnt Sienna | Daniel Smith | Medium |\n"
						+ "| Quinacridone Gold | Daniel Smith | Light |\n"
						+ "| Perylene Green | Schmincke | Heavy |\n\n"
						+ "Granulating pigments are slower but they create texture that flat washes can't. "
						+ "They're ideal for rocks, bark, and old plaster walls.")
				.categoryId(hob)
				.subcategoryId(c.watercolors.getId())
				.format("photo-caption").layoutHint("brief")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("watercolor", "art-supplies", "reference"))
				.reactionCounts(Map.of("💡", 7, "❤️", 5))
				.viewCount(29)
				.build());

		// ── Hobbies / Tech ──────────────────────────────────────

		postRepository.save(Post.builder()
				.title("Building a Monorepo from Scratch")
				.slug("building-a-monorepo-from-scratch")
				.excerpt("How I consolidated three repositories into one unified monorepo with shared types and CI/CD.")
				.body("# Building a Monorepo\n\nWhen I started this project, I had three separate repos: "
						+ "a Spring Boot API, a Next.js frontend, and Terraform configs.\n\n"
						+ "## Why Monorepo?\n\n- Atomic commits across frontend and backend\n"
						+ "- Shared TypeScript types\n- Unified CI/CD pipelines\n\n"
						+ "The migration was straightforward: move directories, set up npm workspaces, "
						+ "and configure Turborepo for orchestration.")
				.categoryId(hob)
				.subcategoryId(c.codingProjects.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("monorepo", "devops", "architecture"))
				.reactionCounts(Map.of("👍", 7, "💡", 4))
				.commentCount(1).viewCount(28)
				.build());

		postRepository.save(Post.builder()
				.title("Tiny Dungeon Crawler in Phaser 3")
				.slug("tiny-dungeon-crawler-phaser-3")
				.excerpt("A weekend game jam project — procedurally generated dungeons in under 1,000 lines of code.")
				.body("# Tiny Dungeon Crawler\n\n"
						+ "I gave myself 48 hours to build a playable dungeon crawler using Phaser 3.\n\n"
						+ "## Architecture\n"
						+ "- **Map generation**: BSP tree to carve rooms, then connect with corridors\n"
						+ "- **Enemies**: Simple state machine — idle, patrol, chase, attack\n"
						+ "- **Rendering**: 16x16 tileset I drew in Aseprite\n\n"
						+ "## What Worked\n"
						+ "BSP generation is surprisingly fast. Even on mobile, the map generates in under 50ms.\n\n"
						+ "## What Didn't\n"
						+ "Collision detection with tile corners. Phaser's Arcade physics doesn't handle "
						+ "diagonal collisions gracefully with tilemaps. I ended up writing custom AABB checks.\n\n"
						+ "Play it below or check the source on GitHub.")
				.coverImageUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80")
				.categoryId(hob)
				.subcategoryId(c.gameDev.getId())
				.format("embedded-game").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("gamedev", "phaser", "javascript", "procedural"))
				.reactionCounts(Map.of("🎉", 11, "🔥", 8, "👏", 5))
				.commentCount(6).viewCount(93)
				.build());

		postRepository.save(Post.builder()
				.title("Designing a Personal API with Spring Boot 3")
				.slug("designing-personal-api-spring-boot-3")
				.excerpt("Lessons from building a content API: JPA quirks, Flyway migrations, and making H2 behave like Postgres.")
				.body("# Designing a Personal API\n\n"
						+ "This newsletter runs on a Spring Boot 3 API backed by PostgreSQL in production "
						+ "and H2 in development. Here's what I learned making that work.\n\n"
						+ "## The H2–Postgres Gap\n"
						+ "H2's `MODE=PostgreSQL` covers most syntax, but not:\n"
						+ "- `tsvector` / full-text search (had to mock it)\n"
						+ "- JSONB operators (works for storage, not queries)\n"
						+ "- Reserved word differences (`month`, `year`, `key`)\n\n"
						+ "## Flyway vs JPA DDL\n"
						+ "I use Flyway in production and `ddl-auto=create-drop` in dev. "
						+ "The entities are the source of truth for the schema shape, "
						+ "and migrations are hand-written to match.\n\n"
						+ "## Rate Limiting\n"
						+ "Bucket4j with an in-memory cache. Simple, no Redis dependency for a personal site.")
				.categoryId(hob)
				.subcategoryId(c.codingProjects.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("spring-boot", "java", "backend", "api-design"))
				.reactionCounts(Map.of("💡", 9, "👍", 6))
				.commentCount(2).viewCount(55)
				.build());

		// ── Hobbies / Gardening ─────────────────────────────────

		postRepository.save(Post.builder()
				.title("Weekend in the Garden")
				.slug("weekend-in-the-garden")
				.excerpt("Spring planting season is here — tomatoes, herbs, and a new raised bed.")
				.body("# Garden Update\n\nFinally got the raised bed set up this weekend. "
						+ "Planted:\n- 4 tomato varieties\n- Basil, cilantro, and rosemary\n- Sugar snap peas\n\n"
						+ "The soil mix is 1/3 compost, 1/3 vermiculite, 1/3 peat moss. "
						+ "Fingers crossed for a good harvest this year!")
				.coverImageUrl("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80")
				.categoryId(hob)
				.subcategoryId(c.gardening.getId())
				.format("photo-caption").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("gardening", "spring", "plants"))
				.reactionCounts(Map.of("🌱", 8, "❤️", 2))
				.viewCount(15)
				.build());

		// ── Lifestyle / Travel ──────────────────────────────────

		postRepository.save(Post.builder()
				.title("Three Days in Kyoto")
				.slug("three-days-in-kyoto")
				.excerpt("Temples, tea, and the best convenience store egg sandwich you'll ever eat.")
				.body("# Three Days in Kyoto\n\n"
						+ "## Day 1: Higashiyama\n"
						+ "Started at Kiyomizu-dera before sunrise. The crowds arrive by 8 AM "
						+ "so the 5:30 opening is worth the early alarm. Walked down through "
						+ "Ninenzaka — the preserved Edo-period streets are stunning without tour groups.\n\n"
						+ "## Day 2: Arashiyama\n"
						+ "The bamboo grove is beautiful but brief. The real gem is Gio-ji, a tiny moss temple "
						+ "a 15-minute walk past the crowds. Hardly anyone there.\n\n"
						+ "## Day 3: Fushimi Inari\n"
						+ "Hiked the full loop (about 2 hours). Most people turn back after the first viewpoint. "
						+ "The upper sections are quiet and surreal.\n\n"
						+ "**Best meal**: Oyakodon at a tiny counter shop near Nishiki Market. No English menu, "
						+ "just point at the picture and trust the process.")
				.coverImageUrl("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80")
				.categoryId(life)
				.subcategoryId(c.travel.getId())
				.format("article").layoutHint("featured")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("travel", "japan", "kyoto", "food"))
				.reactionCounts(Map.of("❤️", 18, "🔥", 5, "😮", 3))
				.commentCount(7).viewCount(112)
				.build());

		// ── Lifestyle / Food Reviews ────────────────────────────

		postRepository.save(Post.builder()
				.title("The Ramen at Ichiran Is Overrated")
				.slug("ichiran-ramen-overrated")
				.excerpt("A hot take on Tokyo's most famous ramen chain — and three better alternatives.")
				.body("# The Ramen at Ichiran Is Overrated\n\n"
						+ "There, I said it. Ichiran is fine. The solo-booth concept is clever. "
						+ "The customization sheet is fun. But the broth is thin and the noodles lack bite.\n\n"
						+ "## Better Options\n\n"
						+ "### Fuunji (Shinjuku)\n"
						+ "Tsukemen (dipping ramen) with a thick, smoky fish broth. "
						+ "The line is long but moves fast. Worth every minute.\n\n"
						+ "### Afuri (Ebisu)\n"
						+ "Yuzu shio ramen — light, fragrant, completely different from tonkotsu. "
						+ "Perfect for a warm day.\n\n"
						+ "### Nakiryu (Otsuka)\n"
						+ "Michelin-starred tantanmen. Spicy sesame broth with handmade noodles. "
						+ "Get there 30 minutes before opening.")
				.coverImageUrl("https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.foodReviews.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("food", "ramen", "tokyo", "hot-take"))
				.reactionCounts(Map.of("🔥", 14, "😂", 7, "👏", 3))
				.commentCount(12).viewCount(88)
				.build());

		// ── Lifestyle / Book Reviews ────────────────────────────

		postRepository.save(Post.builder()
				.title("Book Review: Project Hail Mary")
				.slug("book-review-project-hail-mary")
				.excerpt("Andy Weir's best novel — funnier than The Martian, with a friendship that will wreck you.")
				.body("# Project Hail Mary by Andy Weir\n\n"
						+ "**Rating: 5/5**\n\n"
						+ "I went in blind and I'm glad I did. The less you know, the better.\n\n"
						+ "What I'll say: it's a first-contact story disguised as a survival thriller. "
						+ "The science is rigorous without being dry. The humor is genuine. "
						+ "And the central relationship is one of the best I've read in science fiction.\n\n"
						+ "Weir has a gift for making problem-solving feel thrilling. Every chapter is a puzzle "
						+ "and every solution leads to a bigger problem. I read it in two sittings.\n\n"
						+ "If you liked The Martian, you'll love this. If you thought The Martian was too bro-y, "
						+ "give this a chance anyway — it has more heart.")
				.categoryId(life)
				.subcategoryId(c.bookReviews.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("books", "sci-fi", "review"))
				.reactionCounts(Map.of("❤️", 11, "👏", 4, "💯", 3))
				.commentCount(5).viewCount(73)
				.build());

		// ── Lifestyle / Show Reviews ────────────────────────────

		postRepository.save(Post.builder()
				.title("Severance Season 2 Was Worth the Wait")
				.slug("severance-season-2-worth-the-wait")
				.excerpt("Apple TV's best show returns with answers, more questions, and the same unsettling beauty.")
				.body("# Severance Season 2\n\n"
						+ "**Rating: 4.5/5**\n\n"
						+ "Three years between seasons is a lot to ask. But Severance earns the patience.\n\n"
						+ "## What Works\n"
						+ "- The visual storytelling is even more confident. Every frame is composed like a painting.\n"
						+ "- Mark's innie/outie tension reaches a breaking point that's genuinely devastating.\n"
						+ "- New characters add depth without bloating the cast.\n\n"
						+ "## What Doesn't\n"
						+ "- Episode 6 drags. The Burt subplot needed tighter editing.\n"
						+ "- Some mythology answers raise more questions than they resolve.\n\n"
						+ "Still the most visually distinctive show on television. "
						+ "The finale is the best episode of the entire series.")
				.categoryId(life)
				.subcategoryId(c.showReviews.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("tv", "apple-tv", "thriller", "review"))
				.reactionCounts(Map.of("🔥", 9, "👏", 6, "❤️", 4))
				.commentCount(8).viewCount(64)
				.build());

		postRepository.save(Post.builder()
				.title("Book Review: A Memory Called Empire")
				.slug("book-review-memory-called-empire")
				.excerpt("Arkady Martine's debut is space opera meets linguistic thriller — poetry as political weapon.")
				.body("# A Memory Called Empire by Arkady Martine\n\n"
						+ "**Rating: 4.5/5**\n\n"
						+ "Mahit Dzmare arrives at the heart of the Teixcalaanli Empire with a dead predecessor's "
						+ "memories implanted in her brain — except the implant is fifteen years out of date.\n\n"
						+ "This novel is about the seduction of empire. How a culture so beautiful and so vast "
						+ "can make you want to belong to it, even as it threatens to consume everything you are.\n\n"
						+ "The prose is gorgeous. The politics are Byzantine in the best sense. "
						+ "If you like Le Guin's anthropological SF or Leckie's Imperial Radch, this is essential.")
				.categoryId(life)
				.subcategoryId(c.bookReviews.getId())
				.format("article").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("books", "sci-fi", "space-opera", "review"))
				.reactionCounts(Map.of("❤️", 7, "💡", 5))
				.commentCount(3).viewCount(48)
				.build());

		// ── Lifestyle / Recipes ─────────────────────────────────

		postRepository.save(Post.builder()
				.title("Crispy Chili Oil Noodles (10 Minutes)")
				.slug("crispy-chili-oil-noodles")
				.excerpt("The weeknight dinner I make when I'm too tired to think — salty, spicy, and deeply satisfying.")
				.body("# Crispy Chili Oil Noodles\n\n"
						+ "**Serves**: 2 | **Time**: 10 min\n\n"
						+ "## Ingredients\n"
						+ "- 200g dried noodles (any wheat noodle works)\n"
						+ "- 3 tbsp chili crisp (Lao Gan Ma or homemade)\n"
						+ "- 2 tbsp soy sauce\n"
						+ "- 1 tbsp black vinegar\n"
						+ "- 1 tsp sugar\n"
						+ "- 2 cloves garlic, minced\n"
						+ "- 2 green onions, sliced\n"
						+ "- Sesame seeds\n\n"
						+ "## Method\n"
						+ "1. Cook noodles according to package. Reserve 1/4 cup pasta water.\n"
						+ "2. Mix soy sauce, vinegar, sugar, and garlic in a bowl.\n"
						+ "3. Toss drained noodles with the sauce. Add pasta water to loosen.\n"
						+ "4. Top with chili crisp, green onions, and sesame seeds.\n\n"
						+ "**Tips**: A fried egg on top makes this a complete meal. "
						+ "Swap chili crisp for XO sauce for a more umami direction.")
				.coverImageUrl("https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.recipes.getId())
				.format("recipe").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("recipe", "noodles", "quick", "spicy"))
				.reactionCounts(Map.of("🔥", 13, "❤️", 8, "👏", 4))
				.commentCount(9).viewCount(156)
				.build());

		postRepository.save(Post.builder()
				.title("Sourdough Focaccia with Rosemary and Flaky Salt")
				.slug("sourdough-focaccia-rosemary")
				.excerpt("Use your sourdough discard for the crispiest, most olive-oily focaccia you've ever made.")
				.body("# Sourdough Focaccia\n\n"
						+ "**Yields**: 1 half-sheet pan | **Time**: 24h (mostly waiting)\n\n"
						+ "## Ingredients\n"
						+ "- 200g sourdough discard (unfed starter)\n"
						+ "- 500g bread flour\n"
						+ "- 375g warm water\n"
						+ "- 10g salt\n"
						+ "- 4 tbsp olive oil (plus more for the pan)\n"
						+ "- Fresh rosemary, flaky salt, cherry tomatoes\n\n"
						+ "## Method\n"
						+ "1. Mix discard, flour, water, and salt. It'll be shaggy — that's fine.\n"
						+ "2. Stretch and fold every 30 min for 2 hours (4 sets total).\n"
						+ "3. Refrigerate overnight (12–18 hours).\n"
						+ "4. Next day: pour olive oil into a sheet pan, turn dough out into oil.\n"
						+ "5. Dimple with oiled fingers. Top with rosemary, tomatoes, flaky salt.\n"
						+ "6. Bake at 425°F for 22–25 min until deeply golden.\n\n"
						+ "**The key**: Don't be shy with the olive oil. The bottom should fry in it.")
				.coverImageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.recipes.getId())
				.format("recipe").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("recipe", "bread", "sourdough", "focaccia"))
				.reactionCounts(Map.of("❤️", 16, "🔥", 7, "👏", 5))
				.commentCount(4).viewCount(134)
				.build());

		postRepository.save(Post.builder()
				.title("Miso Butter Mushrooms on Toast")
				.slug("miso-butter-mushrooms-toast")
				.excerpt("Umami-bomb mushrooms in five minutes — the lunch I never get tired of.")
				.body("# Miso Butter Mushrooms\n\n"
						+ "**Serves**: 1 | **Time**: 8 min\n\n"
						+ "## Ingredients\n"
						+ "- 150g mixed mushrooms (shiitake, king oyster, maitake)\n"
						+ "- 1 tbsp unsalted butter\n"
						+ "- 1 tbsp white miso paste\n"
						+ "- 1 tsp mirin\n"
						+ "- Thick-sliced sourdough, toasted\n"
						+ "- Chives, black pepper\n\n"
						+ "## Method\n"
						+ "1. Tear mushrooms into bite-size pieces (don't cut — tearing gives better texture).\n"
						+ "2. Sear in a dry, hot pan until golden. Don't move them for 2–3 min.\n"
						+ "3. Add butter. Once foamy, stir in miso and mirin.\n"
						+ "4. Pile on toast. Finish with chives and cracked pepper.\n\n"
						+ "**Upgrade**: A poached egg and a handful of arugula.")
				.categoryId(life)
				.subcategoryId(c.recipes.getId())
				.format("recipe").layoutHint("brief")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("recipe", "mushrooms", "umami", "quick"))
				.reactionCounts(Map.of("❤️", 10, "🔥", 5, "💯", 3))
				.commentCount(2).viewCount(89)
				.build());

		// ── Lifestyle / Photos ──────────────────────────────────

		postRepository.save(Post.builder()
				.title("Morning Fog at the Reservoir")
				.slug("morning-fog-reservoir")
				.excerpt("Shot at dawn before the dog walkers arrived. The mist lasted about twenty minutes.")
				.body("# Morning Fog at the Reservoir\n\n"
						+ "I've been walking past this reservoir for years but never thought to bring a camera at dawn. "
						+ "The fog settled into the valley overnight and by 6 AM the trees were just silhouettes.\n\n"
						+ "**Camera**: Fuji X-T4\n"
						+ "**Lens**: 23mm f/2\n"
						+ "**Settings**: ISO 400, f/5.6, 1/60s\n\n"
						+ "No edits except a slight curves adjustment. The mist did all the work.")
				.coverImageUrl("https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.photos.getId())
				.format("photo-caption").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("photography", "landscape", "fog", "morning"))
				.reactionCounts(Map.of("❤️", 22, "😮", 8))
				.commentCount(3).viewCount(97)
				.build());

		postRepository.save(Post.builder()
				.title("Street Textures: Rust and Rain")
				.slug("street-textures-rust-and-rain")
				.excerpt("A series of close-ups from a rainy walk through the industrial district.")
				.body("# Street Textures\n\n"
						+ "I love shooting in the rain. Water changes everything — it adds reflections, deepens color, "
						+ "and forces you to get close.\n\n"
						+ "This set is from the old warehouse district near the waterfront. "
						+ "Peeling paint, corrugated steel, puddles on concrete. "
						+ "Everything looks better when it's a little broken.\n\n"
						+ "**Camera**: Fuji X-T4\n"
						+ "**Lens**: 56mm f/1.2 (for the shallow depth) and 18mm f/1.4 (for context shots)\n"
						+ "**Film sim**: Classic Chrome")
				.coverImageUrl("https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.photos.getId())
				.format("photo-caption").layoutHint("column")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("photography", "street", "textures", "urban"))
				.reactionCounts(Map.of("🔥", 7, "❤️", 5, "👏", 3))
				.viewCount(41)
				.build());

		postRepository.save(Post.builder()
				.title("The Cat, Asleep Again")
				.slug("the-cat-asleep-again")
				.excerpt("Documentation of my cat's primary hobby: sleeping in sunbeams.")
				.body("# The Cat, Asleep Again\n\n"
						+ "She finds the one patch of sunlight in the apartment and commits to it fully. "
						+ "Today it was the stack of clean laundry I hadn't folded yet.\n\n"
						+ "**Camera**: iPhone 15 Pro (honestly, it's always the phone for cat photos)\n\n"
						+ "I have roughly 4,000 photos of her sleeping. This might be the best one. "
						+ "The paw over the face is unrepeatable.")
				.coverImageUrl("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80")
				.categoryId(life)
				.subcategoryId(c.photos.getId())
				.format("photo-caption").layoutHint("brief")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("photography", "cat", "funny"))
				.reactionCounts(Map.of("❤️", 31, "😂", 15, "🔥", 4))
				.commentCount(11).viewCount(203)
				.build());

		// ── Lifestyle / Affirmations ────────────────────────────

		postRepository.save(Post.builder()
				.title("On the Art of Finishing Things")
				.slug("on-the-art-of-finishing-things")
				.body("The secret of getting ahead is getting started. The secret of getting started is breaking "
						+ "your complex overwhelming tasks into small manageable tasks, and starting on the first one.")
				.quoteAuthor("Mark Twain")
				.quoteSource("Attributed")
				.categoryId(life)
				.subcategoryId(c.affirmations.getId())
				.format("quote").layoutHint("pull-quote")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("motivation", "productivity"))
				.reactionCounts(Map.of("💯", 6))
				.viewCount(20)
				.build());

		postRepository.save(Post.builder()
				.title("The Only Way to Do Great Work")
				.slug("the-only-way-to-do-great-work")
				.body("The only way to do great work is to love what you do. "
						+ "If you haven't found it yet, keep looking. Don't settle.")
				.quoteAuthor("Steve Jobs")
				.quoteSource("Stanford Commencement Address, 2005")
				.categoryId(life)
				.subcategoryId(c.affirmations.getId())
				.format("quote").layoutHint("pull-quote")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("work", "passion", "career"))
				.reactionCounts(Map.of("❤️", 9, "💯", 5))
				.viewCount(33)
				.build());

		postRepository.save(Post.builder()
				.title("On Craft and Patience")
				.slug("on-craft-and-patience")
				.body("Have patience with everything that remains unsolved in your heart. "
						+ "Try to love the questions themselves, like locked rooms and like books "
						+ "written in a foreign language. Do not now look for the answers. "
						+ "They cannot now be given to you because you could not live them.")
				.quoteAuthor("Rainer Maria Rilke")
				.quoteSource("Letters to a Young Poet, 1903")
				.categoryId(life)
				.subcategoryId(c.affirmations.getId())
				.format("quote").layoutHint("pull-quote")
				.status("published").publishedAt(now).issueId(iid)
				.tags(List.of("patience", "art", "philosophy"))
				.reactionCounts(Map.of("❤️", 14, "💡", 6, "💯", 4))
				.commentCount(2).viewCount(57)
				.build());
	}

	private void seedHobbies() {
		Instant now = Instant.now();
		hobbyRepository.save(Hobby.builder()
				.name("Watercolors")
				.category("Creative")
				.startedAt(LocalDate.of(2024, 3, 1))
				.createdAt(now)
				.build());

		hobbyRepository.save(Hobby.builder()
				.name("Woodworking")
				.category("Creative")
				.startedAt(LocalDate.of(2023, 9, 15))
				.createdAt(now)
				.build());

		hobbyRepository.save(Hobby.builder()
				.name("Gardening")
				.category("Lifestyle")
				.startedAt(LocalDate.of(2025, 4, 1))
				.createdAt(now)
				.build());
	}
}
