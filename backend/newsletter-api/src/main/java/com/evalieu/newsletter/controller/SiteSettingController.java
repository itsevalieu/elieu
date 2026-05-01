package com.evalieu.newsletter.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.service.SiteSettingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SiteSettingController {

	private final SiteSettingService siteSettingService;

	@GetMapping("/api/admin/settings")
	public Map<String, String> get() {
		return siteSettingService.getAll();
	}

	@PutMapping("/api/admin/settings")
	public Map<String, String> put(@RequestBody Map<String, String> body) {
		return siteSettingService.replaceAll(body);
	}
}
