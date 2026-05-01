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

	@Column(columnDefinition = "TEXT")
	private String excerpt;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String body;

	@Column(name = "category_id")
	private Long categoryId;

	@Column(name = "subcategory_id")
	private Long subcategoryId;

	@Column(name = "cover_image_url", columnDefinition = "TEXT")
	private String coverImageUrl;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "gallery_urls", columnDefinition = "jsonb")
	private List<String> galleryUrls;

	@Column(name = "video_url", columnDefinition = "TEXT")
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
	@Column(columnDefinition = "jsonb")
	private List<String> tags;

	@Column(name = "published_at")
	private Instant publishedAt;

	@Column(name = "comment_count", nullable = false)
	@Builder.Default
	private int commentCount = 0;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "reaction_counts", columnDefinition = "jsonb")
	private Map<String, Integer> reactionCounts;

	@Column(name = "quote_author", length = 255)
	private String quoteAuthor;

	@Column(name = "quote_source", length = 500)
	private String quoteSource;

	@Column(name = "game_url", columnDefinition = "TEXT")
	private String gameUrl;

	@Column(name = "game_type", length = 10)
	private String gameType;

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
