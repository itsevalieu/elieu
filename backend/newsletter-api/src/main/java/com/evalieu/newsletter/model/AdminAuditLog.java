package com.evalieu.newsletter.model;

import java.time.Instant;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
@Table(name = "admin_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String action;

	@Column(name = "entity_type", nullable = false, length = 50)
	private String entityType;

	@Column(name = "entity_id")
	private Long entityId;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	private Map<String, Object> detail;

	@Column(name = "performed_at", nullable = false)
	private Instant performedAt;
}
