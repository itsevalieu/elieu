package com.evalieu.portfolio.services;

import com.evalieu.portfolio.dto.AchievementRequest;
import com.evalieu.portfolio.models.Achievement;
import com.evalieu.portfolio.models.Project;
import com.evalieu.portfolio.repositories.AchievementRepository;
import com.evalieu.portfolio.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AchievementService {

	private final AchievementRepository achievementRepository;

	private final ProjectRepository projectRepository;

	public AchievementService(AchievementRepository achievementRepository, ProjectRepository projectRepository) {
		this.achievementRepository = achievementRepository;
		this.projectRepository = projectRepository;
	}

	@Transactional(readOnly = true)
	public List<Achievement> getAllAchievements() {
		return achievementRepository.findAll();
	}

	@Transactional
	public Achievement createAchievement(Achievement achievement) {
		if (achievement.getProject() == null) {
			throw new IllegalArgumentException("Achievement must be associated with a project");
		}
		if (achievement.getDate() == null) {
			throw new IllegalArgumentException("Achievement must have a date");
		}
		return achievementRepository.save(achievement);
	}

	@Transactional
	public Achievement createForProject(Long projectId, AchievementRequest request) {
		Project project = projectRepository.findById(projectId)
			.orElseThrow(() -> new RuntimeException("Project not found with id " + projectId));
		Achievement achievement = new Achievement();
		achievement.setTitle(request.title());
		achievement.setDate(request.date());
		achievement.setContext(request.context());
		achievement.setPhotoUrl(request.photoUrl());
		achievement.setProject(project);
		return achievementRepository.save(achievement);
	}

	@Transactional
	public Achievement updateAchievement(Long id, AchievementRequest request) {
		return achievementRepository.findById(id).map(achievement -> {
			achievement.setTitle(request.title());
			achievement.setDate(request.date());
			achievement.setContext(request.context());
			achievement.setPhotoUrl(request.photoUrl());
			return achievementRepository.save(achievement);
		}).orElseThrow(() -> new RuntimeException("Achievement not found with id " + id));
	}

	@Transactional
	public void deleteAchievement(Long id) {
		achievementRepository.deleteById(id);
	}

	public List<Achievement> getAchievementsByProjectId(Long projectId) {
		return achievementRepository.findByProjectId(projectId);
	}

}
