package com.evalieu.newsletter.model;

import java.time.Instant;

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
@Table(name = "issues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private short month;

	@Column(nullable = false)
	private short year;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, unique = true)
	private String slug;

	@Column(name = "layout_preference", nullable = false, length = 20)
	@Builder.Default
	private String layoutPreference = "newspaper";

	@Column(nullable = false, length = 20)
	@Builder.Default
	private String status = "draft";

	@Column(name = "cover_image_url", columnDefinition = "TEXT")
	private String coverImageUrl;

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
