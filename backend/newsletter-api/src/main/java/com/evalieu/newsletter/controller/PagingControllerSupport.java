package com.evalieu.newsletter.controller;

import org.springframework.data.domain.Page;

import com.evalieu.newsletter.dto.PagedResponse;

public abstract class PagingControllerSupport {

	protected <T> PagedResponse<T> toPagedResponse(Page<T> page) {
		return PagedResponse.<T>builder()
				.content(page.getContent())
				.totalElements(page.getTotalElements())
				.totalPages(page.getTotalPages())
				.page(page.getNumber())
				.size(page.getSize())
				.build();
	}
}
