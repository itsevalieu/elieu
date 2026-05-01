package com.evalieu.newsletter.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hobby_progress_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HobbyProgressEntry {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "hobby_id", nullable = false)
	private Long hobbyId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "hobby_id", insertable = false, updatable = false)
	@JsonIgnore
	private Hobby hobby;

	@Column(name = "entry_date", nullable = false)
	private LocalDate entryDate;

	@Column(length = 10000)
	private String note;

	@Column(nullable = false)
	@Builder.Default
	private boolean milestone = false;

	@Column(name = "photo_url", length = 2000)
	private String photoUrl;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "metadata")
	private Map<String, Object> metadata;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}
