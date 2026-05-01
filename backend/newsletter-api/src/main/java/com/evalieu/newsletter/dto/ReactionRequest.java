package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReactionRequest {

	@NotBlank
	private String emoji;

	@NotBlank
	private String sessionId;
}
