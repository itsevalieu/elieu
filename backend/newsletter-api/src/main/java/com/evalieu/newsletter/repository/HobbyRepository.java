package com.evalieu.newsletter.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.evalieu.newsletter.model.Hobby;

public interface HobbyRepository extends JpaRepository<Hobby, Long> {

	List<Hobby> findByCategory(String category);

	@Query("SELECT DISTINCT h FROM Hobby h LEFT JOIN FETCH h.entries WHERE h.id = :id")
	Optional<Hobby> findWithEntriesById(@Param("id") Long id);
}
