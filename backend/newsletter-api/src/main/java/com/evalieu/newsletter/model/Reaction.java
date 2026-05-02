package com.evalieu.newsletter.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reactions", uniqueConstraints = {
		@UniqueConstraint(name = "reactions_post_session_emoji_key", columnNames = { "post_id", "session_id", "emoji" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "post_id", nullable = false)
	private Long postId;

	@Column(nullable = false, length = 10)
	private String emoji;

	@Column(name = "session_id", nullable = false, length = 64)
	private String sessionId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}
