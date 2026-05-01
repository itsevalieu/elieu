package com.evalieu.newsletter.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.evalieu.newsletter.dto.LoginResponse;
import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.AdminUser;
import com.evalieu.newsletter.repository.AdminUserRepository;
import com.evalieu.newsletter.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private AdminUserRepository adminUserRepository;
	@Mock
	private PasswordEncoder passwordEncoder;
	@Mock
	private JwtService jwtService;
	@Mock
	private AuditLogService auditLogService;

	@InjectMocks
	private AuthService authService;

	@Test
	void loginReturnsTokensWhenPasswordMatches() {
		AdminUser user = AdminUser.builder()
				.id(1L).email("e@test.com").passwordHash("encoded")
				.createdAt(java.time.Instant.now())
				.build();
		when(adminUserRepository.findByEmail("e@test.com")).thenReturn(
				Optional.of(user));
		when(passwordEncoder.matches("secret", user.getPasswordHash()))
				.thenReturn(true);
		when(jwtService.generateAccessToken("e@test.com")).thenReturn("access");
		when(jwtService.generateRefreshToken("e@test.com")).thenReturn("refresh");

		LoginResponse lr = authService.login("  E@test.com  ", "secret");

		assertThat(lr.getEmail()).isEqualTo("e@test.com");
		assertThat(lr.getAccessToken()).isEqualTo("access");
		assertThat(lr.getRefreshToken()).isEqualTo("refresh");
		verify(jwtService).generateAccessToken("e@test.com");
		verify(jwtService).generateRefreshToken("e@test.com");
		verify(auditLogService).record(eq("ADMIN_LOGIN"), eq("AdminUser"),
				eq(1L), any());
	}

	@Test
	void loginWithWrongPasswordThrows() {
		AdminUser user = AdminUser.builder()
				.id(1L).email("x@test.com").passwordHash("hash")
				.createdAt(java.time.Instant.now())
				.build();
		when(adminUserRepository.findByEmail("x@test.com")).thenReturn(
				Optional.of(user));
		when(passwordEncoder.matches(anyString(), eq("hash"))).thenReturn(false);

		assertThatThrownBy(() -> authService.login("x@test.com", "bad"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Invalid password");
	}

	@Test
	void loginWithUnknownEmailThrows() {
		when(adminUserRepository.findByEmail("gone@test.com"))
				.thenReturn(Optional.empty());

		assertThatThrownBy(() -> authService.login("gone@test.com", "x"))
				.isInstanceOf(ResourceNotFoundException.class)
				.hasMessageContaining("Admin user not found");
	}

	@Test
	void refreshIssuesNewAccessTokenWhenRefreshValid() {
		when(jwtService.validateRefreshToken("rt")).thenReturn(true);
		when(jwtService.extractEmail("rt")).thenReturn("e@test.com");
		when(jwtService.generateAccessToken("e@test.com")).thenReturn("new-access");

		String token = authService.refresh("rt");

		assertThat(token).isEqualTo("new-access");
		verify(jwtService).generateAccessToken("e@test.com");
	}

	@Test
	void refreshThrowsWhenRefreshInvalid() {
		when(jwtService.validateRefreshToken("bad")).thenReturn(false);

		assertThatThrownBy(() -> authService.refresh("bad"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Invalid refresh token");
	}

}
