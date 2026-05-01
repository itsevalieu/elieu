package com.evalieu.newsletter.service;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.IssueRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Issue;
import com.evalieu.newsletter.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueService {

	private final IssueRepository issueRepository;
	private final AuditLogService auditLogService;

	@Transactional(readOnly = true)
	public Page<Issue> findPublished(Pageable pageable) {
		return issueRepository.findByStatus("published", pageable);
	}

	@Transactional(readOnly = true)
	public Page<Issue> findAll(Pageable pageable) {
		return issueRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public Issue findBySlug(String slug) {
		return issueRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + slug));
	}

	@Transactional
	public Issue create(IssueRequest req) {
		String slugBase = slugFromTitle(req.getTitle());
		String slug = ensureUniqueIssueSlug(slugBase, null);
		Issue issue = Issue.builder()
				.slug(slug)
				.month(req.getMonth() != null ? req.getMonth() : (short) LocalDate.now().getMonthValue())
				.year(req.getYear() != null ? req.getYear() : (short) java.time.LocalDate.now().getYear())
				.title(req.getTitle())
				.layoutPreference(req.getLayoutPreference() != null ? req.getLayoutPreference() : "newspaper")
				.status(req.getStatus() != null ? req.getStatus().toLowerCase(Locale.ROOT) : "draft")
				.coverImageUrl(req.getCoverImageUrl())
				.build();
		Issue saved = issueRepository.save(issue);
		auditLogService.record("ISSUE_CREATE", "Issue", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public Issue update(Long id, IssueRequest req) {
		Issue issue = issueRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));
		String slugBase = slugFromTitle(req.getTitle());
		String slug = ensureUniqueIssueSlug(slugBase, id);
		issue.setTitle(req.getTitle());
		if (req.getMonth() != null) {
			issue.setMonth(req.getMonth());
		}
		if (req.getYear() != null) {
			issue.setYear(req.getYear());
		}
		if (req.getLayoutPreference() != null) {
			issue.setLayoutPreference(req.getLayoutPreference());
		}
		if (req.getStatus() != null) {
			issue.setStatus(req.getStatus().toLowerCase(Locale.ROOT));
		}
		if (req.getCoverImageUrl() != null) {
			issue.setCoverImageUrl(req.getCoverImageUrl());
		}
		issue.setSlug(slug);
		Issue saved = issueRepository.save(issue);
		auditLogService.record("ISSUE_UPDATE", "Issue", saved.getId(), Map.of("slug", saved.getSlug()));
		return saved;
	}

	@Transactional
	public void delete(Long id) {
		Issue issue = issueRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + id));
		issueRepository.delete(issue);
		auditLogService.record("ISSUE_DELETE", "Issue", id, Map.of("slug", issue.getSlug()));
	}

	private static String slugFromTitle(String title) {
		String raw = title == null ? "" : title.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", "-");
		raw = raw.replaceAll("[^-a-z0-9]", "");
		raw = raw.replaceAll("-+", "-");
		if (raw.startsWith("-")) {
			raw = raw.substring(1);
		}
		if (!raw.isEmpty() && raw.endsWith("-")) {
			raw = raw.substring(0, raw.length() - 1);
		}
		return raw.isEmpty() ? "issue" : raw;
	}

	private String ensureUniqueIssueSlug(String base, Long excludeId) {
		String slug = base;
		int suffix = 2;
		while (true) {
			Optional<Issue> existing = issueRepository.findBySlug(slug);
			if (existing.isEmpty() || (excludeId != null && excludeId.equals(existing.get().getId()))) {
				return slug;
			}
			slug = base + "-" + suffix++;
		}
	}
}
