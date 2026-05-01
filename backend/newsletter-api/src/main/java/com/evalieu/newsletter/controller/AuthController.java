package com.evalieu.newsletter.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.LoginRequest;
import com.evalieu.newsletter.dto.LoginResponse;
import com.evalieu.newsletter.security.JwtService;
import com.evalieu.newsletter.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController {

	private static final String REFRESH_COOKIE = "refresh_token";

	private final AuthService authService;
	private final JwtService jwtService;

	@PostMapping("/api/auth/login")
	public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest req,
			HttpServletResponse response) {
		LoginResponse lr = authService.login(req.getEmail(), req.getPassword());
		response.addHeader(HttpHeaders.SET_COOKIE, jwtService.createAccessTokenCookie(lr.getAccessToken()).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, jwtService.createRefreshTokenCookie(lr.getRefreshToken()).toString());
		return ResponseEntity.ok(Map.of("email", lr.getEmail()));
	}

	@PostMapping("/api/auth/refresh")
	public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request, HttpServletResponse response) {
		String rt = readRefreshToken(request);
		if (!StringUtils.hasText(rt)) {
			throw new IllegalArgumentException("Refresh token required");
		}
		String access = authService.refresh(rt);
		response.addHeader(HttpHeaders.SET_COOKIE, jwtService.createAccessTokenCookie(access).toString());
		return ResponseEntity.ok(Map.of("status", "ok"));
	}

	@PostMapping("/api/auth/logout")
	public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
		for (ResponseCookie c : jwtService.createLogoutCookies()) {
			response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
		}
		return ResponseEntity.ok(Map.of("status", "ok"));
	}

	private static String readRefreshToken(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		for (Cookie cookie : cookies) {
			if (REFRESH_COOKIE.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
				return cookie.getValue();
			}
		}
		return null;
	}
}
