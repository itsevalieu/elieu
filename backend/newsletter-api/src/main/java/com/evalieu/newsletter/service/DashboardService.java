package com.evalieu.newsletter.service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.DashboardOverviewResponse;
import com.evalieu.newsletter.dto.DashboardOverviewResponse.AuditActivitySummary;
import com.evalieu.newsletter.dto.DashboardOverviewResponse.SubscriberGrowthPoint;
import com.evalieu.newsletter.dto.DashboardOverviewResponse.TopPostSummary;
import com.evalieu.newsletter.model.AdminAuditLog;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.AuditLogRepository;
import com.evalieu.newsletter.repository.PostRepository;
import com.evalieu.newsletter.repository.SubscriberRepository;
import com.evalieu.newsletter.repository.SystemLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

	private final PostRepository postRepository;
	private final SubscriberRepository subscriberRepository;
	private final CommentService commentService;
	private final SystemLogRepository systemLogRepository;
	private final AuditLogRepository auditLogRepository;

	@Transactional(readOnly = true)
	public DashboardOverviewResponse getDashboardOverview() {
		Instant now = Instant.now();
		Instant since30Days = now.minus(30, ChronoUnit.DAYS);
		Instant since60Days = now.minus(60, ChronoUnit.DAYS);
		Instant since24h = now.minus(24, ChronoUnit.HOURS);
		Instant since48h = now.minus(48, ChronoUnit.HOURS);

		Map<String, Long> postsByStatus = new LinkedHashMap<>();
		postsByStatus.put("draft", postRepository.countByStatus("draft"));
		postsByStatus.put("published", postRepository.countByStatus("published"));
		postsByStatus.put("archived", postRepository.countByStatus("archived"));

		long subscribers = subscriberRepository.countByStatus("confirmed");
		long pendingComments = commentService.countPending();

		long postsPublishedLast30Days = postRepository.countPublishedBetween(since30Days, now);
		long postsPublishedPrev30DaysWindow =
				postRepository.countPublishedBetween(since60Days, since30Days);

		long newSubscribersLast30Days = subscriberRepository.countConfirmedBetween(since30Days, now);
		long newSubscribersPrev30DaysWindow =
				subscriberRepository.countConfirmedBetween(since60Days, since30Days);

		long errs24 = systemLogRepository.countBySeverityAndLoggedAtGreaterThanEqual("ERROR", since24h);
		long warns24 =
				systemLogRepository.countBySeverityAndLoggedAtGreaterThanEqual("WARN", since24h);
		long errsPrev24 = systemLogRepository.countBySeverityAndLoggedAtBetween("ERROR", since48h, since24h);
		long warnsPrev24 = systemLogRepository.countBySeverityAndLoggedAtBetween("WARN", since48h, since24h);

		List<Post> topPublished = postRepository.findByStatusAndPublishedAtGreaterThanEqual(
				"published",
				since30Days,
				PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "viewCount")));
		List<TopPostSummary> topSummaries =
				topPublished.stream().map(this::toTopPostSummary).toList();

		List<AdminAuditLog> recent =
				auditLogRepository
						.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "performedAt")))
						.getContent();
		List<AuditActivitySummary> activity = recent.stream().map(this::toAuditSummary).toList();

		List<SubscriberGrowthPoint> growth = buildSubscriberGrowth(6);

		return DashboardOverviewResponse.builder()
				.postsByStatus(postsByStatus)
				.totalSubscribersConfirmed(subscribers)
				.pendingComments(pendingComments)
				.postsPublishedLast30Days(postsPublishedLast30Days)
				.newSubscribersLast30Days(newSubscribersLast30Days)
				.newSubscribersPrev30DaysWindow(newSubscribersPrev30DaysWindow)
				.postsPublishedPrev30DaysWindow(postsPublishedPrev30DaysWindow)
				.systemErrorsLast24h(errs24)
				.systemWarningsLast24h(warns24)
				.systemErrorsPrev24h(errsPrev24)
				.systemWarningsPrev24h(warnsPrev24)
				.topPostsPublishedLast30Days(topSummaries)
				.recentActivity(activity)
				.subscriberGrowth(growth)
				.build();
	}

	@Transactional(readOnly = true)
	public List<Map<String, Object>> getTopPosts(int limit) {
		int cap = Math.min(Math.max(limit, 1), 50);
		List<Post> posts;
		if (cap <= 10) {
			posts = postRepository.findTop10ByStatusOrderByViewCountDesc("published").stream().limit(cap).toList();
		} else {
			posts =
					postRepository
							.findByStatus("published", PageRequest.of(0, cap, Sort.by(Sort.Direction.DESC, "viewCount")))
							.getContent();
		}
		return posts.stream().map(this::postToMap).toList();
	}

	@Transactional(readOnly = true)
	public List<Map<String, Object>> getSubscriberGrowth(int months) {
		int m = Math.min(Math.max(months, 1), 24);
		return buildSubscriberGrowth(m).stream()
				.map(p -> Map.<String, Object> of("month", p.month(), "cumulativeTotalConfirmed", p.cumulativeTotalConfirmed()))
				.toList();
	}

	private List<SubscriberGrowthPoint> buildSubscriberGrowth(int monthsBack) {
		YearMonth nowYm = YearMonth.now(ZoneOffset.UTC);
		return java.util.stream.IntStream.iterate(monthsBack - 1, i -> i - 1).limit(monthsBack).mapToObj(
				off -> nowYm.minusMonths(off)).map(this::cumulativeEndOfMonth).toList();
	}

	private SubscriberGrowthPoint cumulativeEndOfMonth(YearMonth ym) {
		Instant nextMonthStart = ym.plusMonths(1).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
		long total = subscriberRepository.countConfirmedWithConfirmedAtBeforeExclusive(nextMonthStart);
		return new SubscriberGrowthPoint(ym.toString(), total);
	}

	private TopPostSummary toTopPostSummary(Post p) {
		return TopPostSummary.builder()
				.id(p.getId())
				.title(p.getTitle())
				.slug(p.getSlug())
				.viewCount(p.getViewCount())
				.totalReactions(sumReactions(p.getReactionCounts()))
				.commentCount(p.getCommentCount())
				.publishedAt(p.getPublishedAt())
				.build();
	}

	private AuditActivitySummary toAuditSummary(AdminAuditLog log) {
		String desc =
				log.getAction() + " · " + log.getEntityType() + (log.getEntityId() != null ? " #" + log.getEntityId() : "");
		return AuditActivitySummary.builder()
				.id(log.getId())
				.action(log.getAction())
				.entityType(log.getEntityType())
				.entityId(log.getEntityId())
				.detail(log.getDetail())
				.performedAt(log.getPerformedAt())
				.description(desc)
				.build();
	}

	private Map<String, Object> postToMap(Post p) {
		return Map.<String, Object> of(
				"id",
				p.getId(),
				"title",
				p.getTitle(),
				"slug",
				p.getSlug(),
				"viewCount",
				p.getViewCount(),
				"totalReactions",
				sumReactions(p.getReactionCounts()),
				"commentCount",
				p.getCommentCount(),
				"publishedAt",
				p.getPublishedAt());
	}

	private static long sumReactions(Map<String, Integer> reactions) {
		if (reactions == null || reactions.isEmpty()) {
			return 0L;
		}
		long sum = 0L;
		for (Integer n : reactions.values()) {
			if (n != null) {
				sum += n.longValue();
			}
		}
		return sum;
	}
}
