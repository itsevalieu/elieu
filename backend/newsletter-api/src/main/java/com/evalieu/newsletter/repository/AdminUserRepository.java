package com.evalieu.newsletter.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.evalieu.newsletter.model.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

	Optional<AdminUser> findByEmail(String email);
}
