package com.evalieu.newsletter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Subcategory;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
}
