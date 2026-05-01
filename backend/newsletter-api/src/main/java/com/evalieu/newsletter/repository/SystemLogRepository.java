package com.evalieu.newsletter.repository;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.evalieu.newsletter.model.SystemLog;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

	Page<SystemLog> findBySeverity(String severity, Pageable pageable);

	long countBySeverity(String severity);

	@Query("SELECT COUNT(l) FROM SystemLog l WHERE l.severity = :sev AND l.loggedAt >= :since")
	long countBySeverityAndLoggedAtGreaterThanEqual(@Param("sev") String severity, @Param("since") Instant since);

	@Query("SELECT COUNT(l) FROM SystemLog l WHERE l.severity = :sev AND l.loggedAt >= :from AND l.loggedAt < :to")
	long countBySeverityAndLoggedAtBetween(@Param("sev") String severity, @Param("from") Instant from, @Param("to") Instant to);
}
