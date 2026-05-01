package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueRequest {

	private Short month;
	private Short year;

	@NotBlank
	private String title;

	private String layoutPreference;
	private String status;
	private String coverImageUrl;
}
