package com.evalieu.newsletter.service;

import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.evalieu.newsletter.config.S3Config;
import com.evalieu.newsletter.dto.PresignResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GameUploadService {

	private final S3Service s3Service;
	private final S3Config s3Config;

	private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
			"html", "htm", "js", "css", "json", "png", "jpg", "jpeg",
			"gif", "svg", "webp", "wasm", "mp3", "ogg", "wav", "ttf",
			"woff", "woff2", "glsl", "vert", "frag", "data");

	public PresignResponse generateGamePresignedUrl(String gameSlug, String filename, String contentType) {
		String safeSlug = sanitizeGameSlug(gameSlug);
		String safeName = sanitizeFilename(filename);
		validateExtension(safeName);
		String objectKey = "games/" + safeSlug + "/" + safeName;

		String bucket = s3Config.getGamesBucket();
		PresignResponse presigned = s3Service.presignPut(bucket, objectKey, contentType);
		String prefixKey = "games/" + safeSlug + "/";
		String assetsBaseUrl = s3Service.publicUrlFor(bucket, prefixKey);

		presigned.setAssetsBaseUrl(assetsBaseUrl);
		return presigned;
	}

	private static void validateExtension(String filename) {
		int dot = filename.lastIndexOf('.');
		if (dot <= 0 || dot == filename.length() - 1) {
			throw new IllegalArgumentException("Filename must include an allowed extension");
		}
		String ext = filename.substring(dot + 1).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(ext)) {
			throw new IllegalArgumentException("File type not allowed: " + ext);
		}
	}

	private static String sanitizeGameSlug(String raw) {
		if (raw == null || raw.isBlank()) {
			throw new IllegalArgumentException("Game slug required");
		}
		String s = raw.trim().toLowerCase(Locale.ROOT);
		String cleaned = s.replaceAll("[^a-z0-9-]+", "-").replaceAll("-{2,}", "-");
		cleaned = cleaned.startsWith("-") ? cleaned.substring(1) : cleaned;
		while (cleaned.endsWith("-")) {
			cleaned = cleaned.substring(0, cleaned.length() - 1);
		}
		if (cleaned.isBlank()) {
			throw new IllegalArgumentException("Invalid game slug");
		}
		return cleaned;
	}

	private static String sanitizeFilename(String filename) {
		if (filename == null || filename.isBlank()) {
			throw new IllegalArgumentException("Filename required");
		}
		String stripped = filename.replace('\\', '/');
		int slash = stripped.lastIndexOf('/');
		String base = slash >= 0 ? stripped.substring(slash + 1) : stripped;
		base = base.replaceAll("[^a-zA-Z0-9._-]", "_");
		if (base.isBlank()) {
			throw new IllegalArgumentException("Invalid filename");
		}
		return base;
	}
}
