package com.evalieu.newsletter.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.evalieu.newsletter.model.AdminAuditLog;

public interface AuditLogRepository extends JpaRepository<AdminAuditLog, Long>, JpaSpecificationExecutor<AdminAuditLog> {

	Page<AdminAuditLog> findByAction(String action, Pageable pageable);

	Page<AdminAuditLog> findByEntityType(String entityType, Pageable pageable);
}
