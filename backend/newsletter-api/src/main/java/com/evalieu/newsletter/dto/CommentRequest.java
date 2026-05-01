package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {

	@NotBlank
	@Size(max = 100)
	private String displayName;

	@Email
	private String email;

	@NotBlank
	@Size(max = 5000)
	private String body;

	private String honeypot;
}
