package com.evalieu.newsletter.dto;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentResponse {

	private Long id;
	private Long postId;
	private String authorName;
	private String body;
	private String status;
	private Instant createdAt;
}
