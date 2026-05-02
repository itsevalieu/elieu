package com.evalieu.newsletter.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 500)
	private String title;

	@Column(nullable = false, length = 500, unique = true)
	private String slug;

	@Column(length = 10000)
	private String excerpt;

	@Column(nullable = false, length = 100000)
	private String body;

	@Column(name = "category_id")
	private Long categoryId;

	@Column(name = "subcategory_id")
	private Long subcategoryId;

	@Column(name = "cover_image_url", length = 2000)
	private String coverImageUrl;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "gallery_urls")
	private List<String> galleryUrls;

	@Column(name = "video_url", length = 2000)
	private String videoUrl;

	@Column(name = "video_type", length = 20)
	private String videoType;

	@Column(nullable = false, length = 20)
	@Builder.Default
	private String status = "draft";

	@Column(nullable = false, length = 30)
	@Builder.Default
	private String format = "article";

	@Column(name = "layout_hint", nullable = false, length = 20)
	@Builder.Default
	private String layoutHint = "column";

	@Column(name = "issue_id")
	private Long issueId;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "tags")
	private List<String> tags;

	@Column(name = "published_at")
	private Instant publishedAt;

	@Column(name = "comment_count", nullable = false)
	@Builder.Default
	private int commentCount = 0;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "reaction_counts")
	private Map<String, Integer> reactionCounts;

	@Column(name = "quote_author", length = 255)
	private String quoteAuthor;

	@Column(name = "quote_source", length = 500)
	private String quoteSource;

	@Column(name = "game_url", length = 2000)
	private String gameUrl;

	@Column(name = "game_type", length = 10)
	private String gameType;

	@Column(name = "scheduled_at")
	private Instant scheduledAt;

	@Column(name = "preview_token", length = 64)
	private String previewToken;

	@Column(name = "view_count", nullable = false)
	@Builder.Default
	private int viewCount = 0;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
