package com.evalieu.newsletter.controller;

import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.dto.RecommendationRequest;
import com.evalieu.newsletter.model.Recommendation;
import com.evalieu.newsletter.service.RecommendationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RecommendationController extends PagingControllerSupport {

	private final RecommendationService recommendationService;

	@PostMapping("/api/recommendations")
	public ResponseEntity<String> submit(@Valid @RequestBody RecommendationRequest req) {
		recommendationService.submit(req);
		return ResponseEntity.ok("Thanks for the recommendation!");
	}

	@GetMapping("/api/admin/recommendations")
	public PagedResponse<Recommendation> listAdmin(
			@RequestParam(defaultValue = "pending") String status,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return toPagedResponse(recommendationService.findByStatus(status, PageRequest.of(page, size)));
	}

	@PatchMapping("/api/admin/recommendations/{id}")
	public ResponseEntity<Map<String, String>> markReviewed(@PathVariable Long id) {
		recommendationService.markReviewed(id);
		return ResponseEntity.ok(Map.of("status", "reviewed"));
	}
}
