package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.evalieu.newsletter.dto.RecommendationRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Recommendation;
import com.evalieu.newsletter.repository.RecommendationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {

	private final RecommendationRepository recommendationRepository;
	private final AuditLogService auditLogService;

	@Transactional
	public Recommendation submit(RecommendationRequest req) {
		if (StringUtils.hasText(req.getHoneypot())) {
			return null;
		}
		Recommendation recommendation = Recommendation.builder()
				.type(req.getType())
				.title(req.getTitle())
				.note(req.getNote())
				.submittedBy(req.getSubmittedBy())
				.status("pending")
				.createdAt(Instant.now())
				.build();
		return recommendationRepository.save(recommendation);
	}

	@Transactional(readOnly = true)
	public Page<Recommendation> findByStatus(String status, Pageable pageable) {
		return recommendationRepository.findByStatus(status, pageable);
	}

	@Transactional
	public void markReviewed(Long id) {
		Recommendation rec = recommendationRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Recommendation not found: " + id));
		rec.setStatus("reviewed");
		recommendationRepository.save(rec);
		auditLogService.record("RECOMMENDATION_REVIEWED", "Recommendation", id,
				Map.of("title", rec.getTitle()));
	}
}
