package com.evalieu.newsletter.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Recipe;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

	Optional<Recipe> findBySlug(String slug);
}
