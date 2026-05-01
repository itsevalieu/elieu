package com.evalieu.newsletter.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Subscriber;
import com.evalieu.newsletter.repository.SubscriberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriberService {

	private final SubscriberRepository subscriberRepository;
	private final EmailService emailService;

	@Transactional
	public void subscribe(String email, String source) {
		if (email == null || email.isBlank()) {
			return;
		}
		String normalized = email.trim().toLowerCase(Locale.ROOT);
		if (subscriberRepository.findByEmail(normalized).isPresent()) {
			return;
		}
		Instant now = Instant.now();
		Subscriber subscriber = Subscriber.builder()
				.email(normalized)
				.source(source)
				.status("pending")
				.confirmationToken(java.util.UUID.randomUUID().toString())
				.unsubscribeToken(null)
				.tokenExpiresAt(now.plus(Duration.ofHours(24)))
				.createdAt(now)
				.build();
		subscriberRepository.save(subscriber);
		try {
			emailService.sendConfirmation(normalized, subscriber.getConfirmationToken());
		} catch (Exception ex) {
			log.warn("Could not send confirmation email to {}: {}", normalized, ex.getMessage());
		}
	}

	@Transactional
	public boolean confirm(String token) {
		if (token == null || token.isBlank()) {
			return false;
		}
		return subscriberRepository.findByConfirmationToken(token.trim())
				.filter(s -> "pending".equalsIgnoreCase(s.getStatus()))
				.filter(s -> s.getTokenExpiresAt() != null && Instant.now().isBefore(s.getTokenExpiresAt()))
				.map(s -> {
					s.setStatus("confirmed");
					s.setConfirmationToken(null);
					s.setTokenExpiresAt(null);
					s.setConfirmedAt(Instant.now());
					s.setUnsubscribeToken(java.util.UUID.randomUUID().toString());
					subscriberRepository.save(s);
					return true;
				})
				.orElse(false);
	}

	@Transactional
	public void unsubscribe(String token) {
		if (token == null || token.isBlank()) {
			return;
		}
		subscriberRepository.findByUnsubscribeToken(token.trim()).ifPresent(s -> {
			s.setStatus("unsubscribed");
			s.setUnsubscribedAt(Instant.now());
			subscriberRepository.save(s);
		});
	}

	@Transactional(readOnly = true)
	public List<Subscriber> findConfirmed() {
		return subscriberRepository.findByStatus("confirmed");
	}

	@Transactional(readOnly = true)
	public Page<Subscriber> findAll(Pageable pageable) {
		return subscriberRepository.findAll(pageable);
	}

	@Transactional(readOnly = true)
	public long countConfirmed() {
		return subscriberRepository.countByStatus("confirmed");
	}

	@Transactional
	public void delete(Long id) {
		Subscriber subscriber = subscriberRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Subscriber not found: " + id));
		subscriberRepository.delete(subscriber);
	}
}
