package com.evalieu.newsletter.service;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.RecipeRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Recipe;
import com.evalieu.newsletter.repository.RecipeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeService {

	private final RecipeRepository recipeRepository;
	private final AuditLogService auditLogService;

	@Transactional(readOnly = true)
	public Page<Recipe> findAll(Pageable pageable) {
		return recipeRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public Recipe findBySlug(String slug) {
		return recipeRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe not found: " + slug));
	}

	@Transactional
	public Recipe create(RecipeRequest req) {
		String slugBase = slugFromName(req.getName());
		String slug = ensureUniqueRecipeSlug(slugBase, null);
		Recipe recipe = Recipe.builder()
				.slug(slug)
				.name(req.getName())
				.ingredients(req.getIngredients())
				.steps(req.getSteps())
				.cookTime(req.getCookTime())
				.rating(req.getRating())
				.photoUrl(req.getPhotoUrl())
				.dateMade(req.getDateMade())
				.postId(req.getPostId())
				.build();
		Recipe saved = recipeRepository.save(recipe);
		auditLogService.record("RECIPE_CREATE", "Recipe", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public Recipe update(Long id, RecipeRequest req) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe not found: " + id));
		String slugBase = slugFromName(req.getName());
		String slug = ensureUniqueRecipeSlug(slugBase, id);
		recipe.setName(req.getName());
		recipe.setSlug(slug);
		recipe.setIngredients(req.getIngredients());
		recipe.setSteps(req.getSteps());
		recipe.setCookTime(req.getCookTime());
		recipe.setRating(req.getRating());
		recipe.setPhotoUrl(req.getPhotoUrl());
		recipe.setDateMade(req.getDateMade());
		recipe.setPostId(req.getPostId());
		Recipe saved = recipeRepository.save(recipe);
		auditLogService.record("RECIPE_UPDATE", "Recipe", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public void delete(Long id) {
		Recipe recipe = recipeRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recipe not found: " + id));
		recipeRepository.delete(recipe);
		auditLogService.record("RECIPE_DELETE", "Recipe", id, Map.of("slug", recipe.getSlug()));
	}

	private static String slugFromName(String name) {
		String raw = name == null ? "" : name.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", "-");
		raw = raw.replaceAll("[^-a-z0-9]", "");
		raw = raw.replaceAll("-+", "-");
		if (raw.startsWith("-")) {
			raw = raw.substring(1);
		}
		if (!raw.isEmpty() && raw.endsWith("-")) {
			raw = raw.substring(0, raw.length() - 1);
		}
		return raw.isEmpty() ? "recipe" : raw;
	}

	private String ensureUniqueRecipeSlug(String base, Long excludeId) {
		String slug = base;
		int suffix = 2;
		while (true) {
			Optional<Recipe> existing = recipeRepository.findBySlug(slug);
			if (existing.isEmpty() || (excludeId != null && excludeId.equals(existing.get().getId()))) {
				return slug;
			}
			slug = base + "-" + suffix++;
		}
	}
}
