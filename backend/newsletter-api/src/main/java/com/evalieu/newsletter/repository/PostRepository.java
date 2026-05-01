package com.evalieu.newsletter.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.evalieu.newsletter.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

	Optional<Post> findBySlug(String slug);

	Page<Post> findByStatus(String status, Pageable pageable);

	Page<Post> findByStatusAndCategoryId(String status, Long categoryId, Pageable pageable);

	List<Post> findByIssueIdAndStatus(Long issueId, String status);

	@Query("SELECT COUNT(p) FROM Post p WHERE p.status = :status")
	long countByStatus(@Param("status") String status);

	@Query("SELECT COUNT(p) FROM Post p WHERE p.status = 'published' AND p.publishedAt >= :since")
	long countPublishedSince(@Param("since") Instant since);
}
