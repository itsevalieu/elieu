package com.evalieu.portfolio.controllers;

import com.evalieu.portfolio.dto.AchievementRequest;
import com.evalieu.portfolio.models.Achievement;
import com.evalieu.portfolio.models.Project;
import com.evalieu.portfolio.services.AchievementService;
import com.evalieu.portfolio.services.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

	private final ProjectService projectService;
	private final AchievementService achievementService;

	public ProjectController(ProjectService projectService, AchievementService achievementService) {
		this.projectService = projectService;
		this.achievementService = achievementService;
	}

	@GetMapping
	public List<Project> getAllProjects() {
		return projectService.getAllProjects();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
		return projectService.getProjectById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public Project createProject(@RequestBody Project project) {
		return projectService.createProject(project);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
		try {
			Project updatedProject = projectService.updateProject(id, projectDetails);
			return ResponseEntity.ok(updatedProject);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
		try {
			projectService.deleteProject(id);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/{projectId}/achievements")
	public ResponseEntity<List<Achievement>> getAchievementsForProject(@PathVariable Long projectId) {
		try {
			List<Achievement> achievements = projectService.getProjectById(projectId)
				.map(Project::getAchievements)
				.orElseThrow(() -> new RuntimeException("Project not found"));
			return ResponseEntity.ok(achievements);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/{projectId}/achievements")
	public ResponseEntity<Achievement> addAchievement(
			@PathVariable Long projectId,
			@Valid @RequestBody AchievementRequest body) {
		try {
			return ResponseEntity.ok(achievementService.createForProject(projectId, body));
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

}
