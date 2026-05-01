package com.evalieu.newsletter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Recommendation;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

	Page<Recommendation> findByStatus(String status, Pageable pageable);
}
