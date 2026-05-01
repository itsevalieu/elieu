package com.evalieu.newsletter.service;

import java.util.List;
import java.util.Map;

import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.evalieu.newsletter.model.Issue;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.model.Subscriber;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsletterSendService {

	private final SubscriberService subscriberService;
	private final IssueService issueService;
	private final PostService postService;
	private final EmailService emailService;
	private final AuditLogService auditLogService;
	private final SiteSettingService siteSettingService;

	@Value("${app.newsletter.public-base-url:https://newsletter.evalieu.com}")
	private String publicBaseUrl;

	public int sendIssue(Long issueId) {
		Issue issue = issueService.requirePublishedById(issueId);
		List<Post> posts = postService.findByIssueId(issueId);
		List<Subscriber> subs = subscriberService.findConfirmed();

		String pubName = siteSettingService.get("publication_name");
		if (!StringUtils.hasText(pubName)) {
			pubName = siteSettingService.get("site_name");
		}
		if (!StringUtils.hasText(pubName)) {
			pubName = "Newsletter";
		}

		String base = publicBaseUrl.replaceAll("/+$", "");
		String viewUrl = base + "/issues/" + issue.getSlug();
		String subject = issue.getTitle();
		String htmlInner = buildIssueSummaryHtml(base, pubName, posts);

		int sent = 0;
		for (Subscriber s : subs) {
			if (!StringUtils.hasText(s.getUnsubscribeToken())) {
				log.warn("Skipping send to {}: missing unsubscribe token", s.getEmail());
				continue;
			}
			try {
				emailService.sendNewsletter(
						s.getEmail(),
						s.getUnsubscribeToken(),
						pubName,
						subject,
						htmlInner,
						viewUrl);
				sent++;
			} catch (Exception ex) {
				log.error("Newsletter send failed for issue {} subscriber {}: {}",
						issueId, s.getEmail(), ex.getMessage(), ex);
			}
		}

		auditLogService.record("NEWSLETTER_SEND", "Issue", issueId, Map.of(
				"slug", issue.getSlug(),
				"sent", sent,
				"subscriberCount", subs.size()));
		return sent;
	}

	private String buildIssueSummaryHtml(String baseUrl, String publicationName, List<Post> posts) {
		StringBuilder inner = new StringBuilder();
		inner.append("<p style=\"margin:0 0 16px 0;\">")
				.append("Here is what&rsquo;s in the latest <strong>")
				.append(escapeHtml(publicationName))
				.append("</strong>.</p>");
		if (posts.isEmpty()) {
			inner.append("<p style=\"margin:0\">No published posts are linked to this issue yet.</p>");
			return inner.toString();
		}
		inner.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0;padding:0\">");
		for (Post p : posts) {
			String link = baseUrl + "/posts/" + p.getSlug();
			String blurb = excerptForEmail(p);
			inner.append("<tr><td style=\"padding:14px 0;border-bottom:1px solid #e4e4e7;\">");
			inner.append("<a href=\"").append(link).append("\" style=\"font-size:17px;font-weight:600;color:#18181b;text-decoration:none\">")
					.append(escapeHtml(p.getTitle())).append("</a>");
			if (StringUtils.hasText(blurb)) {
				inner.append("<p style=\"margin:8px 0 0 0;font-size:15px;line-height:1.5;color:#52525b\">")
						.append(blurb)
						.append("</p>");
			}
			inner.append("<p style=\"margin:8px 0 0 0;font-size:13px\">")
					.append("<a href=\"").append(link).append("\" style=\"color:#2563eb\">Read more</a>")
					.append("</p>");
			inner.append("</td></tr>");
		}
		inner.append("</table>");
		return inner.toString();
	}

	private static String excerptForEmail(Post p) {
		if (StringUtils.hasText(p.getExcerpt())) {
			String plain = Jsoup.parse(p.getExcerpt()).text().trim();
			if (plain.length() <= 280) {
				return escapeHtml(plain);
			}
			return escapeHtml(plain.substring(0, 277)) + "&hellip;";
		}
		if (!StringUtils.hasText(p.getBody())) {
			return "";
		}
		String text = Jsoup.parse(p.getBody()).text().trim();
		if (text.length() <= 280) {
			return escapeHtml(text);
		}
		return escapeHtml(text.substring(0, 277)) + "&hellip;";
	}

	private static String escapeHtml(String s) {
		if (s == null) {
			return "";
		}
		return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
	}
}
