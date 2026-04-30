package com.evalieu_api.portfolio.services;

import com.evalieu_api.portfolio.models.Achievement;
import com.evalieu_api.portfolio.models.Project;
import com.evalieu_api.portfolio.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private AchievementService achievementService;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        // Set timestamps
        project.setCreatedAt(java.time.LocalDateTime.now());
        project.setUpdatedAt(java.time.LocalDateTime.now());
        
        // Save the project first
        Project savedProject = projectRepository.save(project);
        
        // If there are achievements, save them with the project relationship
        if (project.getAchievements() != null && !project.getAchievements().isEmpty()) {
            for (Achievement achievement : project.getAchievements()) {
                achievement.setProject(savedProject);
                achievementService.createAchievement(achievement);
            }
        }
        
        return savedProject;
    }
    
    public Project updateProject(Long id, Project projectDetails) {
        return projectRepository.findById(id).map(project -> {
            project.setName(projectDetails.getName());
            project.setDescription(projectDetails.getDescription());
            project.setUpdatedAt(java.time.LocalDateTime.now());
            return projectRepository.save(project);
        }).orElseThrow(() -> new RuntimeException("Project not found with id " + id));
    }
    
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
    
    // Achievement related methods
    public Achievement addAchievementToProject(Long projectId, Achievement achievement) {
        return projectRepository.findById(projectId).map(project -> {
            achievement.setProject(project);
            return achievementService.createAchievement(achievement);
        }).orElseThrow(() -> new RuntimeException("Project not found with id " + projectId));
    }
}
