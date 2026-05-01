package com.evalieu.newsletter.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.DashboardOverviewResponse;
import com.evalieu.newsletter.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StatsController {

	private final DashboardService dashboardService;

	@GetMapping("/api/admin/stats/overview")
	public DashboardOverviewResponse overview() {
		return dashboardService.getDashboardOverview();
	}

	@GetMapping("/api/admin/stats/top-posts")
	public List<Map<String, Object>> topPosts(@RequestParam(defaultValue = "10") int limit) {
		return dashboardService.getTopPosts(limit);
	}

	@GetMapping("/api/admin/stats/subscriber-growth")
	public List<Map<String, Object>> subscriberGrowth(@RequestParam(defaultValue = "6") int months) {
		return dashboardService.getSubscriberGrowth(months);
	}
}
