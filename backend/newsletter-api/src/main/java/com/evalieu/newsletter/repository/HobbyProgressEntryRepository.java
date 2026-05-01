package com.evalieu.newsletter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.HobbyProgressEntry;

public interface HobbyProgressEntryRepository extends JpaRepository<HobbyProgressEntry, Long> {

	List<HobbyProgressEntry> findByHobbyIdOrderByEntryDateDesc(Long hobbyId);
}
