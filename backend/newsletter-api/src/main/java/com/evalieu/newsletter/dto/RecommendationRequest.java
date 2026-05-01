package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecommendationRequest {

	@NotBlank
	private String type;

	@NotBlank
	private String title;

	private String note;
	private String submittedBy;
	private String honeypot;
}
