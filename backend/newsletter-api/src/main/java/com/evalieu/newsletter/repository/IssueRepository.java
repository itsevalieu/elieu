package com.evalieu.newsletter.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.Issue;

public interface IssueRepository extends JpaRepository<Issue, Long> {

	Optional<Issue> findBySlug(String slug);

	Page<Issue> findByStatus(String status, Pageable pageable);
}
