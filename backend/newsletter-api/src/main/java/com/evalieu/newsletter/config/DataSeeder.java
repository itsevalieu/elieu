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

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile({"dev", "docker"})
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

	private final AdminUserRepository adminUserRepository;
	private final CategoryRepository categoryRepository;
	private final SubcategoryRepository subcategoryRepository;
	private final IssueRepository issueRepository;
	private final PostRepository postRepository;
	private final HobbyRepository hobbyRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (adminUserRepository.count() > 0) {
			log.info("Database already seeded, skipping");
			return;
		}

		log.info("Seeding development data...");

		seedAdminUser();
		var categories = seedCategories();
		var issue = seedIssue();
		seedPosts(categories, issue);
		seedHobbies();

		log.info("Development data seeded successfully");
	}

	private void seedAdminUser() {
		AdminUser admin = AdminUser.builder()
				.email("admin@evalieu.local")
				.passwordHash(passwordEncoder.encode("REDACTED_DEV_PASSWORD"))
				.createdAt(Instant.now())
				.build();
		adminUserRepository.save(admin);
		log.info("Created admin user: admin@evalieu.local / REDACTED_DEV_PASSWORD");
	}

	private List<Category> seedCategories() {
		var writing = saveCategory("Writing", "writing", 1);
		saveSubcategory(writing, "Short Stories", "short-stories");
		saveSubcategory(writing, "Poems", "poems");

		var creative = saveCategory("Creative Projects", "creative-projects", 2);
		saveSubcategory(creative, "Watercolors", "watercolors");
		saveSubcategory(creative, "Woodworking", "woodworking");

		var tech = saveCategory("Tech", "tech", 3);
		saveSubcategory(tech, "Coding Projects", "coding-projects");
		saveSubcategory(tech, "Game Dev", "game-dev");

		var lifestyle = saveCategory("Lifestyle", "lifestyle", 4);
		saveSubcategory(lifestyle, "Travel", "travel");
		saveSubcategory(lifestyle, "Food Reviews", "food-reviews");
		saveSubcategory(lifestyle, "Gardening", "gardening");

		var reviews = saveCategory("Reviews", "reviews", 5);
		saveSubcategory(reviews, "Book Reviews", "book-reviews");
		saveSubcategory(reviews, "Show Reviews", "show-reviews");

		var recipes = saveCategory("Recipes", "recipes", 6);
		var photos = saveCategory("Photos", "photos", 7);
		var quotes = saveCategory("Quotes", "quotes", 8);

		return List.of(writing, creative, tech, lifestyle, reviews, recipes, photos, quotes);
	}

	private Category saveCategory(String name, String slug, int sortOrder) {
		Category cat = Category.builder().name(name).slug(slug).sortOrder(sortOrder).build();
		return categoryRepository.save(cat);
	}

	private void saveSubcategory(Category parent, String name, String slug) {
		Subcategory sub = Subcategory.builder()
				.name(name).slug(slug).categoryId(parent.getId()).build();
		subcategoryRepository.save(sub);
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

	private void seedPosts(List<Category> categories, Issue issue) {
		Category writing = categories.get(0);
		Category tech = categories.get(2);
		Category lifestyle = categories.get(3);
		Category quotes = categories.get(7);

		postRepository.save(Post.builder()
				.title("Welcome to The Evalieu Times")
				.slug("welcome-to-the-evalieu-times")
				.excerpt("A creative personal newsletter covering writing, tech, art, and everything in between.")
				.body("# Welcome!\n\nThis is the first issue of **The Evalieu Times** — a creative newsletter "
						+ "where I share short stories, poems, coding projects, watercolors, travel adventures, "
						+ "recipes, and whatever else I'm working on.\n\n"
						+ "Think of it as a newspaper for one person's many hobbies. Grab a coffee and stay a while.")
				.categoryId(writing.getId())
				.format("article")
				.layoutHint("featured")
				.status("published")
				.publishedAt(Instant.now())
				.issueId(issue.getId())
				.tags(List.of("welcome", "newsletter", "introduction"))
				.reactionCounts(Map.of("❤️", 3, "🎉", 5, "🔥", 2))
				.commentCount(2)
				.viewCount(42)
				.build());

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
				.categoryId(tech.getId())
				.format("article")
				.layoutHint("column")
				.status("published")
				.publishedAt(Instant.now())
				.issueId(issue.getId())
				.tags(List.of("monorepo", "devops", "architecture"))
				.reactionCounts(Map.of("👍", 7, "💡", 4))
				.commentCount(1)
				.viewCount(28)
				.build());

		postRepository.save(Post.builder()
				.title("Weekend in the Garden")
				.slug("weekend-in-the-garden")
				.excerpt("Spring planting season is here — tomatoes, herbs, and a new raised bed.")
				.body("# Garden Update\n\nFinally got the raised bed set up this weekend. "
						+ "Planted:\n- 4 tomato varieties\n- Basil, cilantro, and rosemary\n- Sugar snap peas\n\n"
						+ "The soil mix is 1/3 compost, 1/3 vermiculite, 1/3 peat moss. "
						+ "Fingers crossed for a good harvest this year!")
				.categoryId(lifestyle.getId())
				.format("photo-caption")
				.layoutHint("column")
				.status("published")
				.publishedAt(Instant.now())
				.issueId(issue.getId())
				.tags(List.of("gardening", "spring", "plants"))
				.reactionCounts(Map.of("🌱", 8, "❤️", 2))
				.viewCount(15)
				.build());

		postRepository.save(Post.builder()
				.title("On the Art of Finishing Things")
				.slug("on-the-art-of-finishing-things")
				.body("The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and starting on the first one.")
				.quoteAuthor("Mark Twain")
				.quoteSource("Attributed")
				.categoryId(quotes.getId())
				.format("quote")
				.layoutHint("column")
				.status("published")
				.publishedAt(Instant.now())
				.issueId(issue.getId())
				.tags(List.of("motivation", "productivity"))
				.reactionCounts(Map.of("💯", 6))
				.viewCount(20)
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
