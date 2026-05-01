package com.evalieu.portfolio.services;

import com.evalieu.portfolio.models.Achievement;
import com.evalieu.portfolio.models.Project;
import com.evalieu.portfolio.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

	private final ProjectRepository projectRepository;

	private final AchievementService achievementService;

	public ProjectService(ProjectRepository projectRepository, AchievementService achievementService) {
		this.projectRepository = projectRepository;
		this.achievementService = achievementService;
	}

	@Transactional(readOnly = true)
	public List<Project> getAllProjects() {
		List<Project> all = projectRepository.findAll();
		for (Project p : all) {
			p.getAchievements().size();
		}
		return all;
	}

	@Transactional(readOnly = true)
	public Optional<Project> getProjectById(Long id) {
		return projectRepository.findById(id).map(project -> {
			project.getAchievements().size();
			return project;
		});
	}

	@Transactional
	public Project createProject(Project project) {
		project.setCreatedAt(LocalDateTime.now());
		project.setUpdatedAt(LocalDateTime.now());

		List<Achievement> incoming = project.getAchievements();
		project.setAchievements(new java.util.ArrayList<>());
		Project savedProject = projectRepository.save(project);

		if (incoming != null && !incoming.isEmpty()) {
			for (Achievement achievement : incoming) {
				achievement.setProject(savedProject);
				if (achievement.getDate() == null) {
					achievement.setDate(LocalDate.now());
				}
				achievementService.createAchievement(achievement);
			}
		}

		return projectRepository.findById(savedProject.getId()).orElse(savedProject);
	}

	@Transactional
	public Project updateProject(Long id, Project projectDetails) {
		return projectRepository.findById(id).map(project -> {
			project.setName(projectDetails.getName());
			project.setDescription(projectDetails.getDescription());
			project.setUpdatedAt(LocalDateTime.now());
			return projectRepository.save(project);
		}).orElseThrow(() -> new RuntimeException("Project not found with id " + id));
	}

	@Transactional
	public void deleteProject(Long id) {
		projectRepository.deleteById(id);
	}

}
