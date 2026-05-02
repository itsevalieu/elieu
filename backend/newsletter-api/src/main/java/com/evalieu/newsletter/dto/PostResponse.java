package com.evalieu.newsletter.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostResponse {

	private Long id;
	private String title;
	private String slug;
	private String excerpt;
	private String body;
	private Long categoryId;
	private Long subcategoryId;
	private String categoryName;
	private String categorySlug;
	private String subcategoryName;
	private String coverImageUrl;
	private List<String> galleryUrls;
	private String videoUrl;
	private String videoType;
	private String status;
	private String format;
	private String layoutHint;
	private Long issueId;
	private List<String> tags;
	private Instant publishedAt;
	private int commentCount;
	private Map<String, Integer> reactionCounts;
	private String quoteAuthor;
	private String quoteSource;
	private String gameUrl;
	private String gameType;
	private Instant scheduledAt;
	private String previewToken;
	private int viewCount;
	private Instant createdAt;
	private Instant updatedAt;
}
