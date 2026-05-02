package com.evalieu.newsletter.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Subcategory;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

	Optional<Subcategory> findBySlug(String slug);
}
