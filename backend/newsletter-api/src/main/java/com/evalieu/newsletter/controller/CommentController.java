package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.CommentModerationRequest;
import com.evalieu.newsletter.dto.CommentRequest;
import com.evalieu.newsletter.dto.CommentResponse;
import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.model.Comment;
import com.evalieu.newsletter.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommentController extends PagingControllerSupport {

	private final CommentService commentService;

	@GetMapping("/api/posts/{postId}/comments")
	public PagedResponse<CommentResponse> listForPost(
			@PathVariable Long postId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "50") int size) {
		return toPagedResponse(
				commentService.findApprovedByPost(postId, PageRequest.of(page, size)).map(this::toResponse));
	}

	@PostMapping("/api/posts/{postId}/comments")
	public ResponseEntity<String> submit(@PathVariable Long postId, @Valid @RequestBody CommentRequest req) {
		commentService.submit(postId, req);
		return ResponseEntity.ok("Comment submitted for review");
	}

	@GetMapping("/api/admin/comments")
	public PagedResponse<CommentResponse> listAdmin(
			@RequestParam(defaultValue = "pending") String status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return toPagedResponse(
				commentService.findByStatus(status, PageRequest.of(page, size)).map(this::toResponse));
	}

	@PatchMapping("/api/admin/comments/{id}")
	public CommentResponse moderate(@PathVariable Long id, @Valid @RequestBody CommentModerationRequest body) {
		String s = body.getStatus().trim().toLowerCase();
		if ("approved".equals(s)) {
			return toResponse(commentService.approve(id));
		}
		return toResponse(commentService.reject(id));
	}

	@DeleteMapping("/api/admin/comments/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		commentService.delete(id);
		return ResponseEntity.noContent().build();
	}

	private CommentResponse toResponse(Comment c) {
		return CommentResponse.builder()
				.id(c.getId())
				.postId(c.getPostId())
				.authorName(c.getAuthorName())
				.body(c.getBody())
				.status(c.getStatus())
				.createdAt(c.getCreatedAt())
				.build();
	}
}
