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

	List<Post> findTop10ByStatusOrderByViewCountDesc(String status);

	Page<Post> findByStatusAndCategoryId(String status, Long categoryId, Pageable pageable);

	List<Post> findByIssueIdAndStatus(Long issueId, String status);

	@Query("SELECT COUNT(p) FROM Post p WHERE p.status = :status")
	long countByStatus(@Param("status") String status);

	@Query("SELECT COUNT(p) FROM Post p WHERE p.status = 'published' AND p.publishedAt >= :since")
	long countPublishedSince(@Param("since") Instant since);

	@Query("SELECT COUNT(p) FROM Post p WHERE p.status = 'published' AND p.publishedAt >= :from AND p.publishedAt < :to")
	long countPublishedBetween(@Param("from") Instant from, @Param("to") Instant to);

	@Query("SELECT p FROM Post p WHERE p.status = :status AND p.publishedAt IS NOT NULL AND p.publishedAt >= :since ORDER BY p.viewCount DESC")
	List<Post> findByStatusAndPublishedAtGreaterThanEqual(
			@Param("status") String status,
			@Param("since") Instant since,
			Pageable pageable);

	@Query(value = "SELECT * FROM posts WHERE status = 'published' AND search_vector @@ plainto_tsquery('english', :query) ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC",
			countQuery = "SELECT COUNT(*) FROM posts WHERE status = 'published' AND search_vector @@ plainto_tsquery('english', :query)",
			nativeQuery = true)
	Page<Post> searchPublished(@Param("query") String query, Pageable pageable);

	@Query(value = "SELECT * FROM posts WHERE search_vector @@ plainto_tsquery('english', :query) ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC",
			countQuery = "SELECT COUNT(*) FROM posts WHERE search_vector @@ plainto_tsquery('english', :query)",
			nativeQuery = true)
	Page<Post> searchAll(@Param("query") String query, Pageable pageable);

	List<Post> findByStatusAndScheduledAtBefore(String status, Instant cutoff);

	Optional<Post> findByPreviewToken(String previewToken);
}
