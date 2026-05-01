package com.evalieu.newsletter.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.dto.PostRequest;
import com.evalieu.newsletter.dto.PostResponse;
import com.evalieu.newsletter.repository.CategoryRepository;
import com.evalieu.newsletter.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PostController extends PagingControllerSupport {

	private final PostService postService;
	private final PostResponseMapper postResponseMapper;
	private final CategoryRepository categoryRepository;

	@GetMapping("/api/posts")
	public PagedResponse<PostResponse> listPublished(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(required = false) String category) {
		Long categoryId = null;
		if (StringUtils.hasText(category)) {
			var cat = categoryRepository.findBySlug(category.trim());
			if (cat.isEmpty()) {
				return toPagedResponse(Page.empty(PageRequest.of(page, size)));
			}
			categoryId = cat.get().getId();
		}
		var result = postService.findPublished(categoryId, PageRequest.of(page, size));
		return toPagedResponse(result.map(postResponseMapper::toResponse));
	}

	@GetMapping("/api/posts/{slug}")
	public PostResponse getPublished(@PathVariable String slug) {
		return postResponseMapper.toResponse(postService.findPublishedBySlug(slug));
	}

	@GetMapping("/api/admin/posts")
	public PagedResponse<PostResponse> listAllAdmin(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return toPagedResponse(postService.findAll(PageRequest.of(page, size)).map(postResponseMapper::toResponse));
	}

	@GetMapping("/api/admin/posts/{id}")
	public PostResponse getAdmin(@PathVariable Long id) {
		return postResponseMapper.toResponse(postService.findById(id));
	}

	@PostMapping("/api/admin/posts")
	public PostResponse createAdmin(@Valid @RequestBody PostRequest req) {
		return postResponseMapper.toResponse(postService.create(req));
	}

	@PutMapping("/api/admin/posts/{id}")
	public PostResponse updateAdmin(@PathVariable Long id, @Valid @RequestBody PostRequest req) {
		return postResponseMapper.toResponse(postService.update(id, req));
	}

	@DeleteMapping("/api/admin/posts/{id}")
	public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
		postService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
