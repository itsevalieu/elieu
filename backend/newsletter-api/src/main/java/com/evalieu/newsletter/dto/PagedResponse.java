package com.evalieu.newsletter.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PagedResponse<T> {

	private List<T> content;
	private long totalElements;
	private int totalPages;
	private int page;
	private int size;
}
