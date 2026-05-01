package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubscribeRequest {

	@Email
	@NotBlank
	private String email;

	private String source;
	private String honeypot;
}
