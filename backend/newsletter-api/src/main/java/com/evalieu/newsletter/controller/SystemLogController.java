package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.model.SystemLog;
import com.evalieu.newsletter.repository.SystemLogRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SystemLogController extends PagingControllerSupport {

	private final SystemLogRepository systemLogRepository;

	@GetMapping("/api/admin/system-logs")
	public PagedResponse<SystemLog> list(
			@RequestParam(required = false) String severity,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "50") int size) {
		Pageable p = PageRequest.of(page, size);
		if (StringUtils.hasText(severity)) {
			return toPagedResponse(systemLogRepository.findBySeverity(severity.trim(), p));
		}
		return toPagedResponse(systemLogRepository.findAll(p));
	}
}
