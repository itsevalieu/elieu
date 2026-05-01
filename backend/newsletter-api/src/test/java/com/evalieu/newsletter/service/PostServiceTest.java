package com.evalieu.newsletter.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.evalieu.newsletter.dto.PostRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.PostRepository;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

	@Mock
	private PostRepository postRepository;

	@Mock
	private AuditLogService auditLogService;

	@InjectMocks
	private PostService postService;

	@Test
	void findPublishedReturnsPage() {
		Pageable pg = PageRequest.of(0, 10);
		Post row = Post.builder().id(1L).slug("a").status("published")
				.title("t").body("b").commentCount(0).viewCount(0)
				.reactionCounts(Map.of()).build();
		when(postRepository.findByStatus("published", pg))
				.thenReturn(new PageImpl<>(List.of(row), pg, 1));

		var page = postService.findPublished(null, pg);

		assertThat(page.getContent()).singleElement().isEqualTo(row);
		verify(postRepository).findByStatus("published", pg);
	}

	@Test
	void findPublishedBySlugReturnsPublishedAndIncrementsViews() {
		Post post = Post.builder().id(10L).slug("hello").status("published")
				.title("Hello").body("x").commentCount(0).viewCount(3)
				.reactionCounts(Map.of()).build();
		when(postRepository.findBySlug("hello")).thenReturn(Optional.of(post));
		when(postRepository.save(any(Post.class)))
				.thenAnswer(inv -> inv.getArgument(0));

		Post saved = postService.findPublishedBySlug("hello");

		assertThat(saved.getViewCount()).isEqualTo(4);
		verify(postRepository).save(post);
	}

	@Test
	void findPublishedBySlugMissingThrows() {
		when(postRepository.findBySlug("nope")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> postService.findPublishedBySlug("nope"))
				.isInstanceOf(ResourceNotFoundException.class);
	}

	@Test
	void createPersistsPost() {
		PostRequest req = new PostRequest();
		req.setTitle("Brand New Thing");
		req.setBody("content");
		when(postRepository.findBySlug("brand-new-thing")).thenReturn(
				Optional.empty());
		Post persisted = Post.builder().id(5L).title(req.getTitle())
				.slug("brand-new-thing").body(req.getBody()).status("draft")
				.commentCount(0).viewCount(0).reactionCounts(Map.of()).build();
		when(postRepository.save(any(Post.class))).thenReturn(persisted);

		Post created = postService.create(req);

		assertThat(created.getId()).isEqualTo(5L);
		verify(postRepository).save(any(Post.class));
		verify(auditLogService).record(eq("POST_CREATE"), eq("Post"), eq(5L),
				any());
	}

	@Test
	void updateLoadsAppliesSlugAndPersists() {
		PostRequest req = new PostRequest();
		req.setTitle("Updated Title Line");
		req.setBody("new-body");
		Post existing =
				Post.builder().id(3L).title("Old").slug("updated-title-line-old")
						.body("body").status("draft").commentCount(0).viewCount(0)
						.reactionCounts(Map.of()).build();
		when(postRepository.findById(3L)).thenReturn(Optional.of(existing));
		when(postRepository.findBySlug("updated-title-line"))
				.thenReturn(Optional.empty());
		when(postRepository.save(any(Post.class)))
				.thenAnswer(inv -> inv.getArgument(0));

		Post updated = postService.update(3L, req);

		assertThat(updated.getSlug()).isEqualTo("updated-title-line");
		assertThat(updated.getBody()).isEqualTo("new-body");
		verify(auditLogService).record(eq("POST_UPDATE"), eq("Post"), eq(3L),
				any());
	}

}
