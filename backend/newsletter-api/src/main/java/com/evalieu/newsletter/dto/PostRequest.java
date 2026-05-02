package com.evalieu.newsletter.dto;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {

	@NotBlank
	@Size(max = 500)
	private String title;

	private String excerpt;

	@NotBlank
	private String body;

	private Long categoryId;
	private Long subcategoryId;
	private String format;
	private String layoutHint;
	private Long issueId;
	private List<String> tags;
	private String status;
	private String coverImageUrl;
	private List<String> galleryUrls;
	private String videoUrl;
	private String videoType;
	private String quoteAuthor;
	private String quoteSource;
	private String gameUrl;
	private String gameType;
	private Instant scheduledAt;
}
