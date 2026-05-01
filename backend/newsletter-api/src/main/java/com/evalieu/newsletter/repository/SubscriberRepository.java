package com.evalieu.newsletter.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.evalieu.newsletter.model.Subscriber;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {

	Optional<Subscriber> findByEmail(String email);

	Optional<Subscriber> findByConfirmationToken(String token);

	Optional<Subscriber> findByUnsubscribeToken(String token);

	List<Subscriber> findByStatus(String status);

	long countByStatus(String status);

	@Query("SELECT COUNT(s) FROM Subscriber s WHERE s.status = 'confirmed' AND s.confirmedAt >= :since")
	long countConfirmedSince(@Param("since") Instant since);

	@Query("SELECT COUNT(s) FROM Subscriber s WHERE s.status = 'confirmed' AND s.confirmedAt IS NOT NULL AND s.confirmedAt >= :from AND s.confirmedAt < :to")
	long countConfirmedBetween(@Param("from") Instant from, @Param("to") Instant to);

	@Query("SELECT COUNT(s) FROM Subscriber s WHERE s.status = 'confirmed' AND s.confirmedAt IS NOT NULL AND s.confirmedAt < :beforeExclusive")
	long countConfirmedWithConfirmedAtBeforeExclusive(@Param("beforeExclusive") Instant beforeExclusive);
}
