package com.evalieu.newsletter.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "site_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSetting {

	@Id
	@Column(name = "key", length = 100)
	private String key;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String value;
}
