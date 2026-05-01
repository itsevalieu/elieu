package com.evalieu.newsletter.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HobbyRequest {

	@NotBlank
	private String name;

	private String category;
	private LocalDate startedAt;
}
