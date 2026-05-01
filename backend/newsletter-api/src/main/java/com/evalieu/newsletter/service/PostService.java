package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.PostRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {

	private final PostRepository postRepository;
	private final AuditLogService auditLogService;

	@Transactional(readOnly = true)
	public Page<Post> findPublished(Long categoryId, Pageable pageable) {
		if (categoryId == null) {
			return postRepository.findByStatus("published", pageable);
		}
		return postRepository.findByStatusAndCategoryId("published", categoryId, pageable);
	}

	@Transactional
	public Post findPublishedBySlug(String slug) {
		Post post = postRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + slug));
		if (!"published".equalsIgnoreCase(post.getStatus())) {
			throw new ResourceNotFoundException("Post not found: " + slug);
		}
		post.setViewCount(post.getViewCount() + 1);
		return postRepository.save(post);
	}

	@Transactional(readOnly = true)
	public Page<Post> findAll(Pageable pageable) {
		return postRepository.findAll(pageable);
	}

	@Transactional
	public Post create(PostRequest req) {
		String slugBase = slugFromTitle(req.getTitle());
		String slug = ensureUniquePostSlug(slugBase, null);
		Post.PostBuilder builder = Post.builder().slug(slug).commentCount(0).viewCount(0).reactionCounts(Map.of());
		populate(builder, req);
		Post post = builder.build();
		if ("published".equalsIgnoreCase(post.getStatus())) {
			post.setPublishedAt(Instant.now());
		}
		Post saved = postRepository.save(post);
		auditLogService.record("POST_CREATE", "Post", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public Post update(Long id, PostRequest req) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
		String previousStatus = post.getStatus();
		String slugBase = slugFromTitle(req.getTitle());
		String slug = ensureUniquePostSlug(slugBase, id);
		populateExisting(post, req);
		post.setSlug(slug);
		if (!"published".equalsIgnoreCase(previousStatus) && "published".equalsIgnoreCase(post.getStatus())) {
			post.setPublishedAt(Instant.now());
		}
		Post saved = postRepository.save(post);
		auditLogService.record("POST_UPDATE", "Post", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public void delete(Long id) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
		postRepository.delete(post);
		auditLogService.record("POST_DELETE", "Post", id, Map.of("slug", post.getSlug()));
	}

	@Transactional(readOnly = true)
	public List<Post> findByIssueId(Long issueId) {
		return postRepository.findByIssueIdAndStatus(issueId, "published");
	}

	@Transactional(readOnly = true)
	public long countByStatus(String status) {
		return postRepository.countByStatus(status);
	}

	private void populateExisting(Post post, PostRequest req) {
		post.setTitle(req.getTitle());
		post.setExcerpt(req.getExcerpt());
		post.setBody(req.getBody());
		post.setCategoryId(req.getCategoryId());
		post.setSubcategoryId(req.getSubcategoryId());
		post.setFormat(req.getFormat() != null ? req.getFormat() : post.getFormat());
		post.setLayoutHint(req.getLayoutHint() != null ? req.getLayoutHint() : post.getLayoutHint());
		post.setIssueId(req.getIssueId());
		post.setTags(req.getTags());
		post.setStatus(req.getStatus() != null ? req.getStatus().toLowerCase(Locale.ROOT) : post.getStatus());
		post.setCoverImageUrl(req.getCoverImageUrl());
		post.setGalleryUrls(req.getGalleryUrls());
		post.setVideoUrl(req.getVideoUrl());
		post.setVideoType(req.getVideoType());
		post.setQuoteAuthor(req.getQuoteAuthor());
		post.setQuoteSource(req.getQuoteSource());
		post.setGameUrl(req.getGameUrl());
		post.setGameType(req.getGameType());
	}

	private void populate(Post.PostBuilder builder, PostRequest req) {
		builder.title(req.getTitle())
				.excerpt(req.getExcerpt())
				.body(req.getBody())
				.categoryId(req.getCategoryId())
				.subcategoryId(req.getSubcategoryId())
				.format(req.getFormat() != null ? req.getFormat() : "article")
				.layoutHint(req.getLayoutHint() != null ? req.getLayoutHint() : "column")
				.issueId(req.getIssueId())
				.tags(req.getTags())
				.status(req.getStatus() != null ? req.getStatus().toLowerCase(Locale.ROOT) : "draft")
				.coverImageUrl(req.getCoverImageUrl())
				.galleryUrls(req.getGalleryUrls())
				.videoUrl(req.getVideoUrl())
				.videoType(req.getVideoType())
				.quoteAuthor(req.getQuoteAuthor())
				.quoteSource(req.getQuoteSource())
				.gameUrl(req.getGameUrl())
				.gameType(req.getGameType());
	}

	private static String slugFromTitle(String title) {
		String raw = title == null ? "" : title.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", "-");
		raw = raw.replaceAll("[^-a-z0-9]", "");
		raw = raw.replaceAll("-+", "-");
		if (raw.startsWith("-")) {
			raw = raw.substring(1);
		}
		if (!raw.isEmpty() && raw.endsWith("-")) {
			raw = raw.substring(0, raw.length() - 1);
		}
		return raw.isEmpty() ? "post" : raw;
	}

	private String ensureUniquePostSlug(String base, Long excludeId) {
		String slug = base;
		int suffix = 2;
		while (true) {
			Optional<Post> existing = postRepository.findBySlug(slug);
			if (existing.isEmpty() || (excludeId != null && excludeId.equals(existing.get().getId()))) {
				return slug;
			}
			slug = base + "-" + suffix++;
		}
	}
}
