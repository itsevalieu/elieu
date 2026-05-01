package com.evalieu.newsletter.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PresignRequest;
import com.evalieu.newsletter.dto.PresignResponse;
import com.evalieu.newsletter.service.S3Service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MediaController {

	private final S3Service s3Service;

	@PostMapping("/api/admin/media/presign")
	public PresignResponse presign(@Valid @RequestBody PresignRequest req) {
		return s3Service.generatePresignedUrl(req.getFilename(), req.getContentType());
	}
}
