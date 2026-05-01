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
@Table(name = "subscribers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscriber {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(name = "display_name", length = 100)
	private String displayName;

	@Column(nullable = false, length = 20)
	@Builder.Default
	private String status = "pending";

	private String source;

	@Column(name = "confirmation_token", length = 64)
	private String confirmationToken;

	@Column(name = "token_expires_at")
	private Instant tokenExpiresAt;

	@Column(name = "confirmed_at")
	private Instant confirmedAt;

	@Column(name = "unsubscribed_at")
	private Instant unsubscribedAt;

	@Column(name = "unsubscribe_token", length = 64)
	private String unsubscribeToken;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}
