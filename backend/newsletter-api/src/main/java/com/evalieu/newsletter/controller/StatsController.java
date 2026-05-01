package com.evalieu.newsletter.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.service.CommentService;
import com.evalieu.newsletter.service.PostService;
import com.evalieu.newsletter.service.SubscriberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StatsController {

	private final PostService postService;
	private final SubscriberService subscriberService;
	private final CommentService commentService;

	@GetMapping("/api/admin/stats/overview")
	public StatsOverviewResponse overview() {
		return new StatsOverviewResponse(
				postService.countByStatus("published"),
				postService.countByStatus("draft"),
				postService.countByStatus("archived"),
				subscriberService.countConfirmed(),
				commentService.countPending());
	}

	public record StatsOverviewResponse(
			long totalPublished,
			long totalDrafts,
			long totalArchived,
			long totalSubscribers,
			long pendingComments) {
	}
}
