package com.evalieu_api.portfolio.repositories;

import com.evalieu_api.portfolio.models.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    // Custom query to find all achievements for a specific project
    List<Achievement> findByProjectId(Long projectId);
}
