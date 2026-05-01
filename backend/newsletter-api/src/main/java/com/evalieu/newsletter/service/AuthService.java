package com.evalieu.newsletter.service;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.dto.LoginResponse;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.AdminUser;
import com.evalieu.newsletter.repository.AdminUserRepository;
import com.evalieu.newsletter.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AdminUserRepository adminUserRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuditLogService auditLogService;

	@Transactional
	public LoginResponse login(String email, String password) {
		AdminUser user = adminUserRepository.findByEmail(email.trim().toLowerCase())
				.orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
		if (!passwordEncoder.matches(password, user.getPasswordHash())) {
			throw new IllegalArgumentException("Invalid password");
		}
		String access = jwtService.generateAccessToken(user.getEmail());
		String refresh = jwtService.generateRefreshToken(user.getEmail());
		auditLogService.record("ADMIN_LOGIN", "AdminUser", user.getId(),
				Map.of("email", user.getEmail()));
		return LoginResponse.builder()
				.email(user.getEmail())
				.accessToken(access)
				.refreshToken(refresh)
				.build();
	}

	@Transactional(readOnly = true)
	public String refresh(String refreshToken) {
		if (!jwtService.validateRefreshToken(refreshToken)) {
			throw new IllegalArgumentException("Invalid refresh token");
		}
		String email = jwtService.extractEmail(refreshToken);
		return jwtService.generateAccessToken(email);
	}
}
