package com.evalieu.newsletter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.SiteSetting;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, String> {
}
