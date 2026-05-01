package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.evalieu.newsletter.model.AdminAuditLog;
import com.evalieu.newsletter.repository.AuditLogRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {

	private final AuditLogRepository auditLogRepository;

	@Transactional
	public void record(String action, String entityType, Long entityId, Map<String, Object> detail) {
		AdminAuditLog entry = AdminAuditLog.builder()
				.action(action)
				.entityType(entityType)
				.entityId(entityId)
				.detail(detail)
				.performedAt(Instant.now())
				.build();
		auditLogRepository.save(entry);
	}

	@Transactional(readOnly = true)
	public Page<AdminAuditLog> findAll(String action, String entityType, Pageable pageable) {
		Specification<AdminAuditLog> spec = (root, query, cb) -> {
			Predicate combined = cb.conjunction();
			if (StringUtils.hasText(action)) {
				combined = cb.and(combined, cb.equal(root.get("action"), action));
			}
			if (StringUtils.hasText(entityType)) {
				combined = cb.and(combined, cb.equal(root.get("entityType"), entityType));
			}
			return combined;
		};
		return auditLogRepository.findAll(spec, pageable);
	}
}
