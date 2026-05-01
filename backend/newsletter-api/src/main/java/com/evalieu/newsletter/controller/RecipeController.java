package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.dto.RecipeRequest;
import com.evalieu.newsletter.model.Recipe;
import com.evalieu.newsletter.service.RecipeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RecipeController extends PagingControllerSupport {

	private final RecipeService recipeService;

	@GetMapping("/api/recipes")
	public PagedResponse<Recipe> list(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return toPagedResponse(recipeService.findAll(PageRequest.of(page, size)));
	}

	@GetMapping("/api/recipes/{slug}")
	public Recipe get(@PathVariable String slug) {
		return recipeService.findBySlug(slug);
	}

	@PostMapping("/api/admin/recipes")
	public Recipe create(@Valid @RequestBody RecipeRequest req) {
		return recipeService.create(req);
	}

	@PutMapping("/api/admin/recipes/{id}")
	public Recipe update(@PathVariable Long id, @Valid @RequestBody RecipeRequest req) {
		return recipeService.update(id, req);
	}

	@DeleteMapping("/api/admin/recipes/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		recipeService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
