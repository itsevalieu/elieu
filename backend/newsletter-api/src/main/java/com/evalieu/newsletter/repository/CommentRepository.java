package com.evalieu.newsletter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

	Page<Comment> findByPostIdAndStatus(Long postId, String status, Pageable pageable);

	Page<Comment> findByStatus(String status, Pageable pageable);

	long countByStatus(String status);

	long countByPostIdAndStatus(Long postId, String status);
}
