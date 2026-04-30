package com.evalieu_api.portfolio.services;

import com.evalieu_api.portfolio.models.Achievement;
import com.evalieu_api.portfolio.repositories.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private ProjectService projectService;

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    public Optional<Achievement> getAchievementById(Long id) {
        return achievementRepository.findById(id);
    }

    public Achievement createAchievement(Achievement achievement) {
        // Set timestamps
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());

        // If project is not set, you might want to throw an exception or handle it
        if (achievement.getProject() == null) {
            throw new IllegalArgumentException("Achievement must be associated with a project");
        }

        return achievementRepository.save(achievement);
    }

    public Achievement updateAchievement(Long id, Achievement achievementDetails) {
        return achievementRepository.findById(id).map(achievement -> {
            achievement.setTitle(achievementDetails.getTitle());
            achievement.setDescription(achievementDetails.getDescription());
            achievement.setUpdatedAt(LocalDateTime.now());

            // Optionally allow changing the project
            if (achievementDetails.getProject() != null) {
                achievement.setProject(achievementDetails.getProject());
            }

            return achievementRepository.save(achievement);
        }).orElseThrow(() -> new RuntimeException("Achievement not found with id " + id));
    }

    public void deleteAchievement(Long id) {
        achievementRepository.deleteById(id);
    }

    public List<Achievement> getAchievementsByProjectId(Long projectId) {
        return achievementRepository.findByProjectId(projectId);
    }
}
