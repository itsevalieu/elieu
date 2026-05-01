package com.evalieu.newsletter.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "post_id", nullable = false)
	private Long postId;

	@Column(name = "author_name", nullable = false, length = 100)
	private String authorName;

	@Column(name = "author_email", nullable = false)
	private String authorEmail;

	@Column(nullable = false, length = 5000)
	private String body;

	@Column(nullable = false, length = 20)
	@Builder.Default
	private String status = "pending";

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}
