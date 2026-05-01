package com.evalieu.newsletter.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.PagedResponse;
import com.evalieu.newsletter.dto.SubscribeRequest;
import com.evalieu.newsletter.model.Subscriber;
import com.evalieu.newsletter.service.SubscriberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SubscriberController extends PagingControllerSupport {

	private final SubscriberService subscriberService;

	@PostMapping("/api/subscribe")
	public ResponseEntity<String> subscribe(@Valid @RequestBody SubscribeRequest req) {
		if (StringUtils.hasText(req.getHoneypot())) {
			return ResponseEntity.ok("Check your email to confirm");
		}
		subscriberService.subscribe(req.getEmail(), req.getSource());
		return ResponseEntity.ok("Check your email to confirm");
	}

	@GetMapping("/api/subscribe/confirm")
	public ResponseEntity<String> confirm(@RequestParam String token) {
		if (!subscriberService.confirm(token)) {
			return ResponseEntity.badRequest().body("Invalid or expired confirmation link");
		}
		return ResponseEntity.ok("Subscription confirmed");
	}

	@GetMapping("/api/unsubscribe")
	public ResponseEntity<String> unsubscribe(@RequestParam String token) {
		subscriberService.unsubscribe(token);
		return ResponseEntity.ok("Unsubscribed");
	}

	@GetMapping("/api/admin/subscribers")
	public PagedResponse<Subscriber> listAdmin(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return toPagedResponse(subscriberService.findAll(PageRequest.of(page, size)));
	}

	@DeleteMapping("/api/admin/subscribers/{id}")
	public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
		subscriberService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
