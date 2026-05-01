package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.HobbyEntryRequest;
import com.evalieu.newsletter.dto.HobbyRequest;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Hobby;
import com.evalieu.newsletter.model.HobbyProgressEntry;
import com.evalieu.newsletter.repository.HobbyProgressEntryRepository;
import com.evalieu.newsletter.repository.HobbyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HobbyService {

	private final HobbyRepository hobbyRepository;
	private final HobbyProgressEntryRepository hobbyProgressEntryRepository;
	private final AuditLogService auditLogService;

	@Transactional(readOnly = true)
	public List<Hobby> findAll() {
		return hobbyRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<Hobby> findByCategory(String category) {
		return hobbyRepository.findByCategory(category);
	}

	@Transactional(readOnly = true)
	public Hobby findById(Long id) {
		return hobbyRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
	}

	@Transactional(readOnly = true)
	public Hobby findWithEntries(Long id) {
		return hobbyRepository.findWithEntriesById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
	}

	@Transactional
	public Hobby create(HobbyRequest req) {
		Hobby hobby = Hobby.builder()
				.name(req.getName())
				.category(req.getCategory())
				.startedAt(req.getStartedAt())
				.createdAt(Instant.now())
				.build();
		Hobby saved = hobbyRepository.save(hobby);
		auditLogService.record("HOBBY_CREATE", "Hobby", saved.getId(), Map.of("name", saved.getName()));
		return saved;
	}

	@Transactional
	public Hobby update(Long id, HobbyRequest req) {
		Hobby hobby = hobbyRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
		hobby.setName(req.getName());
		hobby.setCategory(req.getCategory());
		hobby.setStartedAt(req.getStartedAt());
		Hobby saved = hobbyRepository.save(hobby);
		auditLogService.record("HOBBY_UPDATE", "Hobby", saved.getId(), Map.of("name", saved.getName()));
		return saved;
	}

	@Transactional
	public void delete(Long id) {
		Hobby hobby = hobbyRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Hobby not found: " + id));
		hobbyRepository.delete(hobby);
		auditLogService.record("HOBBY_DELETE", "Hobby", id, Map.of("name", hobby.getName()));
	}

	@Transactional
	public HobbyProgressEntry addEntry(Long hobbyId, HobbyEntryRequest req) {
		findById(hobbyId);
		HobbyProgressEntry entry = HobbyProgressEntry.builder()
				.hobbyId(hobbyId)
				.entryDate(req.getEntryDate())
				.note(req.getNote())
				.milestone(req.isMilestone())
				.photoUrl(req.getPhotoUrl())
				.metadata(req.getMetadata())
				.createdAt(Instant.now())
				.build();
		HobbyProgressEntry saved = hobbyProgressEntryRepository.save(entry);
		auditLogService.record("HOBBY_ENTRY_CREATE", "HobbyProgressEntry", saved.getId(), Map.of("hobbyId", hobbyId));
		return saved;
	}

	@Transactional
	public void deleteEntry(Long entryId) {
		HobbyProgressEntry entry = hobbyProgressEntryRepository.findById(entryId)
				.orElseThrow(() -> new ResourceNotFoundException("Progress entry not found: " + entryId));
		hobbyProgressEntryRepository.delete(entry);
		auditLogService.record("HOBBY_ENTRY_DELETE", "HobbyProgressEntry", entryId,
				Map.of("hobbyId", entry.getHobbyId()));
	}
}
