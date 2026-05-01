package com.evalieu.newsletter.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.evalieu.newsletter.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

	Optional<Category> findBySlug(String slug);

	List<Category> findAllByOrderBySortOrderAsc();

	@Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.subcategories ORDER BY c.sortOrder ASC")
	List<Category> findAllWithSubcategoriesOrdered();
}
