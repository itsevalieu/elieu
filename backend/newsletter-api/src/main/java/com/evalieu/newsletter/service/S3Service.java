package com.evalieu.newsletter.service;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import com.evalieu.newsletter.config.S3Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import com.evalieu.newsletter.dto.PresignResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class S3Service {

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
			"video/mp4",
			"video/webm",
			"video/quicktime");

	private final S3Presigner s3Presigner;
	private final S3Config s3Config;

	@Value("${aws.s3.region:}")
	private String awsRegionProperty;

	private static final DateTimeFormatter YEAR = DateTimeFormatter.ofPattern("uuuu").withZone(ZoneOffset.UTC);
	private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("MM").withZone(ZoneOffset.UTC);

	/** Generates a presigned PUT URL (five-minute expiry); expected client limits are about 10MB for images and 500MB for video types. Those limits are not embedded in naked PUT signatures, so reinforce them externally if needed. */
	public PresignResponse generatePresignedUrl(String filename, String contentType) {
		String trimmedType = contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
		if (!ALLOWED_CONTENT_TYPES.contains(trimmedType)) {
			throw new IllegalArgumentException("Content type not allowed");
		}

		String safeName = sanitizeFilename(filename);
		Instant now = Instant.now();
		String keyPrefix = "%s/%s/%s-%s".formatted(YEAR.format(now), MONTH.format(now), UUID.randomUUID(), safeName);
		String objectKey = "media/" + keyPrefix;

		PutObjectRequest.Builder putBuilder = PutObjectRequest.builder()
				.bucket(s3Config.getBucket())
				.key(objectKey)
				.contentType(trimmedType);

		PutObjectRequest putObjectRequest = putBuilder.build();

		PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
				.signatureDuration(Duration.ofMinutes(5))
				.putObjectRequest(putObjectRequest)
				.build();

		PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
		String regionId = awsRegionProperty == null || awsRegionProperty.isBlank()
				? "us-east-1"
				: awsRegionProperty.trim();

		String objectUrl = virtualHostedUrl(s3Config.getBucket(), regionId, objectKey);
		return PresignResponse.builder()
				.uploadUrl(presigned.url().toString())
				.objectUrl(objectUrl)
				.build();
	}

	private static String sanitizeFilename(String filename) {
		if (filename == null || filename.isBlank()) {
			return "file";
		}
		String stripped = filename.replace('\\', '/');
		int slash = stripped.lastIndexOf('/');
		String base = slash >= 0 ? stripped.substring(slash + 1) : stripped;
		base = base.replaceAll("[^a-zA-Z0-9._-]", "_");
		return base.isBlank() ? "file" : base;
	}

	private static String virtualHostedUrl(String bucket, String region, String objectKey) {
		String escapedKey = escapeS3UrlPathSegments(objectKey);
		return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + escapedKey;
	}

	private static String escapeS3UrlPathSegments(String key) {
		String[] segments = key.split("/", -1);
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i < segments.length; i++) {
			if (i > 0) {
				builder.append('/');
			}
			builder.append(encodeURIComponent(segments[i]));
		}
		return builder.toString();
	}

	private static String encodeURIComponent(String segment) {
		String encoded = java.net.URLEncoder.encode(segment, java.nio.charset.StandardCharsets.UTF_8);
		return encoded.replace("+", "%20");
	}
}
