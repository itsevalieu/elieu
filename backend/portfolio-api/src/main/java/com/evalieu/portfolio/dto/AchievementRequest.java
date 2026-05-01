package com.evalieu.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AchievementRequest(
	@NotBlank String title,
	@NotNull LocalDate date,
	String context,
	String photoUrl
) {
}
