package com.evalieu.newsletter.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.model.SiteSetting;
import com.evalieu.newsletter.repository.SiteSettingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

	private final SiteSettingRepository siteSettingRepository;
	private final AuditLogService auditLogService;

	@Transactional(readOnly = true)
	public String get(String key) {
		return siteSettingRepository.findById(key).map(SiteSetting::getValue).orElse("");
	}

	@Transactional(readOnly = true)
	public Map<String, String> getAll() {
		List<SiteSetting> all = siteSettingRepository.findAll();
		Map<String, String> map = new LinkedHashMap<>();
		for (SiteSetting setting : all) {
			map.put(setting.getKey(), setting.getValue());
		}
		return map;
	}

	@Transactional
	public void update(String key, String value) {
		SiteSetting setting = SiteSetting.builder().key(key).value(value == null ? "" : value).build();
		siteSettingRepository.save(setting);
		auditLogService.record("SITE_SETTING_UPDATE", "SiteSetting", null, Map.of("key", key));
	}

	/** Replaces persisted settings so the dataset matches exactly the given map keys. */
	@Transactional
	public Map<String, String> replaceAll(Map<String, String> incoming) {
		Map<String, String> source = incoming == null ? Map.of() : incoming;
		List<SiteSetting> existing = new ArrayList<>(siteSettingRepository.findAll());
		for (SiteSetting s : existing) {
			if (!source.containsKey(s.getKey())) {
				siteSettingRepository.deleteById(s.getKey());
			}
		}
		for (Map.Entry<String, String> e : source.entrySet()) {
			if (e.getKey() == null || e.getKey().isBlank()) {
				continue;
			}
			siteSettingRepository.save(SiteSetting.builder()
					.key(e.getKey().trim())
					.value(e.getValue() != null ? e.getValue() : "")
					.build());
		}
		auditLogService.record("SITE_SETTINGS_REPLACE", "SiteSetting", null, Map.of("keysCount", source.size()));
		return getAll();
	}
}
