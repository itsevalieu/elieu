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
@Table(name = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 20)
	private String type;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String note;

	@Column(name = "submitted_by", length = 100)
	private String submittedBy;

	@Column(nullable = false, length = 20)
	@Builder.Default
	private String status = "pending";

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}
