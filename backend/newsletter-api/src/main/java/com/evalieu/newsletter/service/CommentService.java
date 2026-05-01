package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.evalieu.newsletter.dto.CommentRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Comment;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.CommentRepository;
import com.evalieu.newsletter.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

	private static final int MAX_AUTHOR_NAME_LENGTH = 100;
	private static final int MAX_BODY_LENGTH = 5000;

	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final AuditLogService auditLogService;

	@Transactional
	public Comment submit(Long postId, CommentRequest req) {
		if (StringUtils.hasText(req.getHoneypot())) {
			return null;
		}
		String name = sanitizeAndTrim(req.getDisplayName(), MAX_AUTHOR_NAME_LENGTH);
		String body = sanitizeAndTrim(req.getBody(), MAX_BODY_LENGTH);
		String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
		Comment comment = Comment.builder()
				.postId(postId)
				.authorName(name)
				.authorEmail(email.isBlank() ? "anonymous@example.com" : email)
				.body(body.isBlank() ? " " : body)
				.status("pending")
				.createdAt(Instant.now())
				.build();
		return commentRepository.save(comment);
	}

	@Transactional
	public Comment approve(Long commentId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
		if ("approved".equalsIgnoreCase(comment.getStatus())) {
			return comment;
		}
		comment.setStatus("approved");
		Comment saved = commentRepository.save(comment);
		Post post = postRepository.findById(saved.getPostId())
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + saved.getPostId()));
		post.setCommentCount(post.getCommentCount() + 1);
		postRepository.save(post);
		auditLogService.record("COMMENT_APPROVE", "Comment", saved.getId(), Map.of("postId", saved.getPostId()));
		return saved;
	}

	@Transactional
	public Comment reject(Long commentId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
		if ("approved".equalsIgnoreCase(comment.getStatus())) {
			Post post = postRepository.findById(comment.getPostId()).orElse(null);
			if (post != null && post.getCommentCount() > 0) {
				post.setCommentCount(post.getCommentCount() - 1);
				postRepository.save(post);
			}
		}
		comment.setStatus("rejected");
		Comment saved = commentRepository.save(comment);
		auditLogService.record("COMMENT_REJECT", "Comment", saved.getId(), Map.of("postId", saved.getPostId()));
		return saved;
	}

	@Transactional
	public void delete(Long commentId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
		if ("approved".equalsIgnoreCase(comment.getStatus())) {
			Post post = postRepository.findById(comment.getPostId()).orElse(null);
			if (post != null && post.getCommentCount() > 0) {
				post.setCommentCount(post.getCommentCount() - 1);
				postRepository.save(post);
			}
		}
		commentRepository.delete(comment);
		auditLogService.record("COMMENT_DELETE", "Comment", commentId, Map.of());
	}

	@Transactional(readOnly = true)
	public Page<Comment> findApprovedByPost(Long postId, Pageable pageable) {
		return commentRepository.findByPostIdAndStatus(postId, "approved", pageable);
	}

	@Transactional(readOnly = true)
	public Page<Comment> findByStatus(String status, Pageable pageable) {
		return commentRepository.findByStatus(status, pageable);
	}

	@Transactional(readOnly = true)
	public long countPending() {
		return commentRepository.countByStatus("pending");
	}

	private static String sanitizeAndTrim(String text, int maxLen) {
		String cleaned = text == null ? "" : Jsoup.clean(text, Safelist.none()).trim();
		if (cleaned.length() <= maxLen) {
			return cleaned;
		}
		return cleaned.substring(0, maxLen);
	}
}
