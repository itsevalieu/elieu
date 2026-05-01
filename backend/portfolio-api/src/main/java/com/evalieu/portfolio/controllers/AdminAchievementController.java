package com.evalieu.portfolio.controllers;

import com.evalieu.portfolio.dto.AchievementRequest;
import com.evalieu.portfolio.models.Achievement;
import com.evalieu.portfolio.services.AchievementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAchievementController {

	private final AchievementService achievementService;

	public AdminAchievementController(AchievementService achievementService) {
		this.achievementService = achievementService;
	}

	@PostMapping("/projects/{id}/achievements")
	public ResponseEntity<Achievement> createAchievement(
		@PathVariable("id") Long projectId,
		@Valid @RequestBody AchievementRequest request
	) {
		try {
			Achievement created = achievementService.createForProject(projectId, request);
			return ResponseEntity.ok(created);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/achievements/{id}")
	public ResponseEntity<Achievement> updateAchievement(
		@PathVariable Long id,
		@Valid @RequestBody AchievementRequest request
	) {
		try {
			Achievement updated = achievementService.updateAchievement(id, request);
			return ResponseEntity.ok(updated);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@DeleteMapping("/achievements/{id}")
	public ResponseEntity<Void> deleteAchievement(@PathVariable Long id) {
		try {
			achievementService.deleteAchievement(id);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			return ResponseEntity.notFound().build();
		}
	}

}
