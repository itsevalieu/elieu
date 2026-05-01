package com.evalieu.newsletter.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.evalieu.newsletter.config.SesConfig;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.RawMessage;
import software.amazon.awssdk.services.ses.model.SendRawEmailRequest;
import software.amazon.awssdk.services.ses.model.SesException;

@Service
@Slf4j
public class EmailService {

	private static final Pattern CRLF = Pattern.compile("\\r?\\n");

	private final SesConfig sesConfig;
	private final Optional<SesClient> sesClient;
	private final SpringTemplateEngine templateEngine;
	private final SiteSettingService siteSettingService;

	@Autowired
	public EmailService(SesConfig sesConfig, Optional<SesClient> sesClient,
			SpringTemplateEngine templateEngine, SiteSettingService siteSettingService) {
		this.sesConfig = sesConfig;
		this.sesClient = sesClient;
		this.templateEngine = templateEngine;
		this.siteSettingService = siteSettingService;
		if (sesClient.isEmpty()) {
			log.warn("SES client not configured — email sending is disabled (set aws.ses.region to enable)");
		}
	}

	@Value("${app.newsletter.public-base-url:https://newsletter.evalieu.com}")
	private String publicBaseUrl;

	public void sendConfirmation(String toEmail, String confirmToken) {
		if (sesClient.isEmpty()) {
			log.warn("Email sending disabled — skipping confirmation to {}", mask(toEmail));
			return;
		}
		String confirmationUrl = publicBaseUrl.replaceAll("/+$", "") + "/subscribe/confirm?token="
				+ urlEncodeToken(confirmToken);
		Context ctx = new Context();
		ctx.setVariable("confirmationUrl", confirmationUrl);
		String siteName = siteSettingService.get("site_name");
		ctx.setVariable("siteName", StringUtils.hasText(siteName) ? siteName : "Newsletter");

		String html = templateEngine.process("email/confirmation", ctx);
		String plain = Jsoup.parse(html).text();
		String subject = "Confirm your subscription";

		byte[] mime = buildMimeMessage(toEmail, subject, plain, html, null);

		SendRawEmailRequest req = SendRawEmailRequest.builder()
				.source(sesConfig.getFromEmail())
				.destinations(toEmail)
				.rawMessage(RawMessage.builder().data(SdkBytes.fromByteArray(mime)).build())
				.build();

		try {
			sesClient.get().sendRawEmail(req);
			log.debug("Sent confirmation email to {}", mask(toEmail));
		} catch (SesException e) {
			String aws = e.awsErrorDetails() != null ? e.awsErrorDetails().errorMessage() : null;
			log.error("SES confirmation failed for {}: {}", mask(toEmail),
					aws != null ? aws : e.getMessage(), e);
			throw new IllegalStateException("Could not send confirmation email");
		}
	}

	public void sendNewsletter(
			String toEmail,
			String unsubscribeToken,
			String publicationName,
			String subject,
			String htmlInnerContent,
			String viewInBrowserUrl) {
		if (sesClient.isEmpty()) {
			log.warn("Email sending disabled — skipping newsletter to {}", mask(toEmail));
			return;
		}
		Context ctx = new Context();
		ctx.setVariable("publicationName", publicationName);
		ctx.setVariable("innerContentHtml", sanitizeInlineHtml(htmlInnerContent));
		String unsubscribeUrl =
				publicBaseUrl.replaceAll("/+$", "") + "/unsubscribe?token=" + urlEncodeToken(unsubscribeToken);
		ctx.setVariable("unsubscribeUrl", unsubscribeUrl);
		ctx.setVariable("viewInBrowserUrl", viewInBrowserUrl);

		String html = templateEngine.process("email/newsletter", ctx);
		String plain = Jsoup.parse(html).text();

		SendRawEmailRequest req = SendRawEmailRequest.builder()
				.source(sesConfig.getFromEmail())
				.destinations(toEmail)
				.rawMessage(RawMessage.builder()
						.data(SdkBytes.fromByteArray(buildMimeMessage(
								toEmail, subject, plain, html, unsubscribeUrl)))
						.build())
				.build();

		try {
			sesClient.get().sendRawEmail(req);
			log.debug("Sent newsletter email to {}", mask(toEmail));
		} catch (SesException e) {
			String aws = e.awsErrorDetails() != null ? e.awsErrorDetails().errorMessage() : null;
			log.error("SES newsletter send failed for {}: {}", mask(toEmail),
					aws != null ? aws : e.getMessage(), e);
			throw e;
		}
	}

	private static String sanitizeInlineHtml(String html) {
		if (html == null || html.isBlank()) {
			return "";
		}
		return Jsoup.clean(html,
				org.jsoup.safety.Safelist.relaxed().addTags("figure", "figcaption").addAttributes(":all", "class"));
	}

	private byte[] buildMimeMessage(String to, String subject, String plainText, String html,
			String listUnsubscribeUrl) {
		String from = sesConfig.getFromEmail();
		String normalizedPlain = CRLF.matcher(plainText == null ? "" : plainText).replaceAll("\r\n");
		String boundary = "bnd_" + System.nanoTime();

		StringBuilder head = new StringBuilder();
		head.append("From: ").append(headerEmail(from)).append("\r\n");
		head.append("To: ").append(headerEmail(to)).append("\r\n");
		head.append("Subject: ").append(encodeRfc2047(subject)).append("\r\n");
		head.append("MIME-Version: 1.0\r\n");
		if (listUnsubscribeUrl != null && !listUnsubscribeUrl.isBlank()) {
			head.append("List-Unsubscribe: <").append(listUnsubscribeUrl).append(">\r\n");
			head.append("List-Unsubscribe-Post: List-Unsubscribe=One-Click\r\n");
		}
		head.append("Content-Type: multipart/alternative; boundary=\"").append(boundary).append("\"\r\n");
		head.append("\r\n");

		StringBuilder parts = new StringBuilder();
		parts.append("--").append(boundary).append("\r\n");
		parts.append("Content-Type: text/plain; charset=UTF-8\r\n");
		parts.append("Content-Transfer-Encoding: base64\r\n\r\n");
		parts.append(wrapBase64(Base64.getEncoder().encode(normalizedPlain.getBytes(StandardCharsets.UTF_8))));

		parts.append("\r\n");

		parts.append("--").append(boundary).append("\r\n");
		parts.append("Content-Type: text/html; charset=UTF-8\r\n");
		parts.append("Content-Transfer-Encoding: base64\r\n\r\n");
		parts.append(wrapBase64(Base64.getEncoder().encode(
				(html == null ? "" : html).getBytes(StandardCharsets.UTF_8))));
		parts.append("\r\n--").append(boundary).append("--\r\n");

		return (head + parts.toString()).getBytes(StandardCharsets.UTF_8);
	}

	private static String headerEmail(String email) {
		if (email == null || email.contains("<")) {
			return email;
		}
		return "<" + email.trim() + ">";
	}

	private static String encodeRfc2047(String subject) {
		byte[] utf8 = subject.getBytes(StandardCharsets.UTF_8);
		boolean asciiSafe = true;
		for (byte b : utf8) {
			if (b < 32 || b > 126) {
				asciiSafe = false;
				break;
			}
		}
		if (asciiSafe) {
			return subject;
		}
		return "=?UTF-8?B?" + Base64.getEncoder().encodeToString(utf8) + "?=";
	}

	private static String wrapBase64(byte[] data) {
		String b64 = Base64.getEncoder().encodeToString(data);
		StringBuilder wrapped = new StringBuilder(b64.length() + b64.length() / 76 + 8);
		for (int i = 0; i < b64.length(); i += 76) {
			wrapped.append(b64, i, Math.min(i + 76, b64.length())).append("\r\n");
		}
		return wrapped.toString();
	}

	private static String urlEncodeToken(String token) {
		if (token == null) {
			return "";
		}
		return java.net.URLEncoder.encode(token, StandardCharsets.UTF_8).replace("+", "%20");
	}

	private static String mask(String email) {
		if (email == null || email.isBlank()) {
			return "(empty)";
		}
		int at = email.indexOf('@');
		if (at <= 1) {
			return "***@" + email.substring(Math.max(at, 0));
		}
		return email.charAt(0) + "***" + email.substring(at);
	}
}
