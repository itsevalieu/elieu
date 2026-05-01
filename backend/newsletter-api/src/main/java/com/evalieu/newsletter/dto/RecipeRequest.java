package com.evalieu.newsletter.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RecipeRequest {

	@NotBlank
	private String name;

	@NotEmpty
	private List<String> ingredients;

	@NotEmpty
	private List<String> steps;

	private String cookTime;
	private Short rating;
	private String photoUrl;
	private LocalDate dateMade;
	private Long postId;
}
