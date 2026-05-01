package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.model.AdminAuditLog;
import com.evalieu.newsletter.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuditLogController extends PagingControllerSupport {

	private final AuditLogService auditLogService;

	@GetMapping("/api/admin/audit-log")
	public PagedResponse<AdminAuditLog> list(
			@RequestParam(required = false) String action,
			@RequestParam(required = false) String entityType,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "50") int size) {
		String actFilter = StringUtils.hasText(action) ? action.trim() : null;
		String entityFilter = StringUtils.hasText(entityType) ? entityType.trim() : null;
		return toPagedResponse(auditLogService.findAll(actFilter, entityFilter, PageRequest.of(page, size)));
	}
}
