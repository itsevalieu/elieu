package com.evalieu.newsletter.controller;

import org.springframework.stereotype.Component;

import com.evalieu.newsletter.dto.PostResponse;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PostResponseMapper {

	private final CategoryRepository categoryRepository;

	public PostResponse toResponse(Post post) {
		String categoryName = null;
		String categorySlug = null;
		if (post.getCategoryId() != null) {
			var opt = categoryRepository.findById(post.getCategoryId());
			if (opt.isPresent()) {
				categoryName = opt.get().getName();
				categorySlug = opt.get().getSlug();
			}
		}
		return PostResponse.builder()
				.id(post.getId())
				.title(post.getTitle())
				.slug(post.getSlug())
				.excerpt(post.getExcerpt())
				.body(post.getBody())
				.categoryId(post.getCategoryId())
				.subcategoryId(post.getSubcategoryId())
				.categoryName(categoryName)
				.categorySlug(categorySlug)
				.coverImageUrl(post.getCoverImageUrl())
				.galleryUrls(post.getGalleryUrls())
				.videoUrl(post.getVideoUrl())
				.videoType(post.getVideoType())
				.status(post.getStatus())
				.format(post.getFormat())
				.layoutHint(post.getLayoutHint())
				.issueId(post.getIssueId())
				.tags(post.getTags())
				.publishedAt(post.getPublishedAt())
				.commentCount(post.getCommentCount())
				.reactionCounts(post.getReactionCounts())
				.quoteAuthor(post.getQuoteAuthor())
				.quoteSource(post.getQuoteSource())
				.gameUrl(post.getGameUrl())
				.gameType(post.getGameType())
				.scheduledAt(post.getScheduledAt())
				.previewToken(post.getPreviewToken())
				.viewCount(post.getViewCount())
				.createdAt(post.getCreatedAt())
				.updatedAt(post.getUpdatedAt())
				.build();
	}
}
