package com.evalieu.newsletter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.SystemLog;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

	Page<SystemLog> findBySeverity(String severity, Pageable pageable);

	long countBySeverity(String severity);
}
