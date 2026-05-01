package com.evalieu.newsletter.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.HobbyEntryRequest;
import com.evalieu.newsletter.dto.HobbyRequest;
import com.evalieu.newsletter.model.Hobby;
import com.evalieu.newsletter.model.HobbyProgressEntry;
import com.evalieu.newsletter.service.HobbyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class HobbyController {

	private final HobbyService hobbyService;

	@GetMapping("/api/hobbies")
	public List<Hobby> list() {
		return hobbyService.findAll();
	}

	@GetMapping("/api/hobbies/{id}")
	public Hobby get(@PathVariable Long id) {
		return hobbyService.findWithEntries(id);
	}

	@GetMapping("/api/tracking/reading")
	public List<Hobby> reading() {
		return hobbyService.findByCategory("reading");
	}

	@GetMapping("/api/tracking/watching")
	public List<Hobby> watching() {
		return hobbyService.findByCategory("watching");
	}

	@PostMapping("/api/admin/hobbies")
	public Hobby create(@Valid @RequestBody HobbyRequest req) {
		return hobbyService.create(req);
	}

	@PutMapping("/api/admin/hobbies/{id}")
	public Hobby update(@PathVariable Long id, @Valid @RequestBody HobbyRequest req) {
		return hobbyService.update(id, req);
	}

	@DeleteMapping("/api/admin/hobbies/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		hobbyService.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/api/admin/hobbies/{hobbyId}/entries")
	public HobbyProgressEntry addEntry(@PathVariable Long hobbyId, @Valid @RequestBody HobbyEntryRequest req) {
		return hobbyService.addEntry(hobbyId, req);
	}

	@DeleteMapping("/api/admin/hobbies/entries/{entryId}")
	public ResponseEntity<Void> deleteEntry(@PathVariable Long entryId) {
		hobbyService.deleteEntry(entryId);
		return ResponseEntity.noContent().build();
	}
}
