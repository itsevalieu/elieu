package com.evalieu.newsletter.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;

@Builder
public record DashboardOverviewResponse(
		Map<String, Long> postsByStatus,
		long totalSubscribersConfirmed,
		long pendingComments,
		long postsPublishedLast30Days,
		long newSubscribersLast30Days,
		/** Subscribers confirmed in prior 31–60 days window for trend hints. */
		long newSubscribersPrev30DaysWindow,
		/** Posts published in prior 31–60 days window. */
		long postsPublishedPrev30DaysWindow,
		long systemErrorsLast24h,
		long systemWarningsLast24h,
		long systemErrorsPrev24h,
		long systemWarningsPrev24h,
		List<TopPostSummary> topPostsPublishedLast30Days,
		List<AuditActivitySummary> recentActivity,
		List<SubscriberGrowthPoint> subscriberGrowth) {

	@Builder
	public record TopPostSummary(
			long id,
			String title,
			String slug,
			int viewCount,
			long totalReactions,
			int commentCount,
			java.time.Instant publishedAt) {
	}

	@Builder
	public record AuditActivitySummary(
			long id,
			String action,
			String entityType,
			Long entityId,
			Map<String, Object> detail,
			java.time.Instant performedAt,
			String description) {
	}

	@Builder
	public record SubscriberGrowthPoint(
			String month,
			long cumulativeTotalConfirmed) {
	}
}
