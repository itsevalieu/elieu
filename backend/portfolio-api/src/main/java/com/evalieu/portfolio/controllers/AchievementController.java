package com.evalieu.portfolio.controllers;

import com.evalieu.portfolio.models.Achievement;
import com.evalieu.portfolio.services.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

	private final AchievementService achievementService;

	public AchievementController(AchievementService achievementService) {
		this.achievementService = achievementService;
	}

	@GetMapping
	public ResponseEntity<List<Achievement>> getAllAchievements() {
		List<Achievement> achievements = achievementService.getAllAchievements();
		return ResponseEntity.ok(achievements);
	}

}
