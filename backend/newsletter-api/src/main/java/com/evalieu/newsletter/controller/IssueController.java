package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.IssueRequest;
import com.evalieu.newsletter.dto.IssueResponse;
import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Issue;
import com.evalieu.newsletter.service.IssueService;
import com.evalieu.newsletter.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class IssueController extends PagingControllerSupport {

	private final IssueService issueService;
	private final PostService postService;
	private final PostResponseMapper postResponseMapper;

	@GetMapping("/api/issues")
	public PagedResponse<IssueResponse> listPublished(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "12") int size) {
		return toPagedResponse(issueService.findPublished(PageRequest.of(page, size)).map(i -> toIssueResponse(i, false)));
	}

	@GetMapping("/api/issues/{slug}")
	public IssueResponse getPublished(@PathVariable String slug) {
		Issue issue = issueService.findBySlug(slug);
		if (!"published".equalsIgnoreCase(issue.getStatus())) {
			throw new ResourceNotFoundException("Issue not found: " + slug);
		}
		return toIssueResponse(issue, true);
	}

	@PostMapping("/api/admin/issues")
	public IssueResponse createAdmin(@Valid @RequestBody IssueRequest req) {
		return toIssueResponse(issueService.create(req), false);
	}

	@PutMapping("/api/admin/issues/{id}")
	public IssueResponse updateAdmin(@PathVariable Long id, @Valid @RequestBody IssueRequest req) {
		return toIssueResponse(issueService.update(id, req), false);
	}

	@DeleteMapping("/api/admin/issues/{id}")
	public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
		issueService.delete(id);
		return ResponseEntity.noContent().build();
	}

	private IssueResponse toIssueResponse(Issue issue, boolean includePosts) {
		IssueResponse.IssueResponseBuilder b = IssueResponse.builder()
				.id(issue.getId())
				.month(issue.getMonth())
				.year(issue.getYear())
				.title(issue.getTitle())
				.slug(issue.getSlug())
				.layoutPreference(issue.getLayoutPreference())
				.status(issue.getStatus())
				.coverImageUrl(issue.getCoverImageUrl())
				.createdAt(issue.getCreatedAt())
				.updatedAt(issue.getUpdatedAt());
		if (includePosts) {
			b.posts(postService.findByIssueId(issue.getId()).stream()
					.map(postResponseMapper::toResponse)
					.toList());
		}
		return b.build();
	}
}
