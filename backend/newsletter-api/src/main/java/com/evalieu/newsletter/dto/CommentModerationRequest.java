package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CommentModerationRequest {

	@NotBlank
	@Pattern(regexp = "^(approved|rejected)$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "status must be approved or rejected")
	private String status;
}
