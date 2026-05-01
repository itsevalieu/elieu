package com.evalieu.newsletter.dto;

import java.time.Instant;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IssueResponse {

	private Long id;
	private short month;
	private short year;
	private String title;
	private String slug;
	private String layoutPreference;
	private String status;
	private String coverImageUrl;
	private Instant createdAt;
	private Instant updatedAt;
	private List<PostResponse> posts;
}
