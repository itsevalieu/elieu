package com.evalieu.newsletter.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.evalieu.newsletter.model.Reaction;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

	Optional<Reaction> findByPostIdAndSessionId(Long postId, String sessionId);

	@Query("SELECT r.emoji, COUNT(r) FROM Reaction r WHERE r.postId = :postId GROUP BY r.emoji")
	List<Object[]> countByPostIdGroupByEmoji(@Param("postId") Long postId);

	void deleteByPostIdAndSessionId(Long postId, String sessionId);
}
