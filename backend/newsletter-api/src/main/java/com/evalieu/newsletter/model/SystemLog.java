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
@Table(name = "system_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 10)
	private String severity;

	@Column(nullable = false, length = 50)
	private String service;

	@Column(nullable = false, length = 10000)
	private String message;

	@Column(name = "stack_trace", length = 50000)
	private String stackTrace;

	@Column(length = 255)
	private String endpoint;

	@Column(name = "logged_at", nullable = false)
	private Instant loggedAt;
}
