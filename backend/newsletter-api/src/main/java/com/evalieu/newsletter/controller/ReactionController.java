package com.evalieu.newsletter.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PostResponse;
import com.evalieu.newsletter.dto.ReactionRequest;
import com.evalieu.newsletter.service.ReactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReactionController {

	private final ReactionService reactionService;
	private final PostResponseMapper postResponseMapper;

	@PostMapping("/api/posts/{postId}/reactions")
	public PostResponse add(@PathVariable Long postId, @Valid @RequestBody ReactionRequest req) {
		return postResponseMapper.toResponse(reactionService.react(postId, req.getEmoji(), req.getSessionId()));
	}

	@DeleteMapping("/api/posts/{postId}/reactions")
	public ResponseEntity<Void> remove(
			@PathVariable Long postId,
			@RequestHeader("X-Session-Id") String sessionId) {
		reactionService.unreact(postId, sessionId);
		return ResponseEntity.noContent().build();
	}
}
