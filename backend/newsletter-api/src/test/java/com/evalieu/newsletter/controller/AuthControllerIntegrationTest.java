package com.evalieu.newsletter.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.TestcontainersConfiguration;
import com.evalieu.newsletter.dto.LoginRequest;
import com.evalieu.newsletter.model.AdminUser;
import com.evalieu.newsletter.repository.AdminUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestcontainersConfiguration.class)
class AuthControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private AdminUserRepository adminUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void seedAdmin() {
		adminUserRepository.deleteAll();
		adminUserRepository.save(AdminUser.builder()
				.email("admin-it@test.com")
				.passwordHash(passwordEncoder.encode("CorrectHorseBatteryStaple"))
				.createdAt(java.time.Instant.now())
				.build());
	}

	@Test
	void loginWithValidCredentialsReturns200AndCookies() throws Exception {
		LoginRequest req = new LoginRequest();
		req.setEmail("admin-it@test.com");
		req.setPassword("CorrectHorseBatteryStaple");

		var actions = mockMvc.perform(post("/api/auth/login").contentType(
				MediaType.APPLICATION_JSON).content(
					objectMapper.writeValueAsBytes(req)))
			.andExpect(status().isOk())
			.andExpect(header().exists(HttpHeaders.SET_COOKIE));

		byte[] raw = actions.andReturn().getResponse().getContentAsByteArray();
		assertThat(new String(raw, StandardCharsets.UTF_8)).contains(
				"admin-it@test.com");

		List<String> cookies =
				actions.andReturn().getResponse().getHeaders(HttpHeaders.SET_COOKIE);
		String joined = String.join("; ", cookies);
		assertThat(joined).contains("access_token=");
		assertThat(joined).contains("refresh_token=");
		assertThat(joined).containsIgnoringCase("HttpOnly");
	}

	@Test
	void loginWithBadPasswordReturnsBadRequest() throws Exception {
		LoginRequest req = new LoginRequest();
		req.setEmail("admin-it@test.com");
		req.setPassword("wrong-password");

		mockMvc.perform(post("/api/auth/login").contentType(
				MediaType.APPLICATION_JSON).content(
					objectMapper.writeValueAsBytes(req)))
			.andExpect(status().isBadRequest());
	}

	@Test
	void refreshWithValidRefreshCookieIssuesNewAccessCookie() throws Exception {
		String refresh = mintRefreshViaLogin();

		var result =
			mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie("refresh_token",
					refresh))).andExpect(status().isOk()).andExpect(
						header().exists(HttpHeaders.SET_COOKIE)).andReturn();

		List<String> headers =
				result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
		assertThat(headers).anyMatch(v -> v.startsWith("access_token="));
	}

	@Test
	void logoutClearsCookiesWithMaxAgeZero() throws Exception {
		var actions = mockMvc.perform(post("/api/auth/logout"))
			.andExpect(status().isOk())
			.andExpect(header().exists(HttpHeaders.SET_COOKIE));

		List<String> cookies =
				actions.andReturn().getResponse().getHeaders(HttpHeaders.SET_COOKIE);
		assertThat(cookies).hasSize(2);
		for (String raw : cookies) {
			assertThat(raw).containsIgnoringCase("Max-Age=0");
		}
	}

	private String mintRefreshViaLogin() throws Exception {
		LoginRequest req = new LoginRequest();
		req.setEmail("admin-it@test.com");
		req.setPassword("CorrectHorseBatteryStaple");
		List<String> setCookies =
				mockMvc.perform(post("/api/auth/login").contentType(
						MediaType.APPLICATION_JSON).content(
							objectMapper.writeValueAsBytes(req)))
					.andExpect(status().isOk())
					.andReturn().getResponse().getHeaders(HttpHeaders.SET_COOKIE);
		for (String line : setCookies) {
			if (line.startsWith("refresh_token=")) {
				return extractCookieValue(line);
			}
		}
		throw new IllegalStateException("refresh cookie missing");
	}

	private static String extractCookieValue(String setCookieDirective) {
		String afterName = setCookieDirective.split(";", 2)[0];
		int eq = afterName.indexOf('=');
		return afterName.substring(eq + 1);
	}

}
