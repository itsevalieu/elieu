package com.evalieu.portfolio.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtValidationFilter extends OncePerRequestFilter {

	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtTokenValidator jwtTokenValidator;

	public JwtValidationFilter(JwtTokenValidator jwtTokenValidator) {
		this.jwtTokenValidator = jwtTokenValidator;
	}

	@Override
	protected void doFilterInternal(
		@NonNull HttpServletRequest request,
		@NonNull HttpServletResponse response,
		@NonNull FilterChain filterChain
	) throws ServletException, IOException {

		resolveToken(request).ifPresent(token -> {
			if (jwtTokenValidator.validateAccessToken(token)) {
				try {
					String subject = jwtTokenValidator.extractSubject(token);
					if (StringUtils.hasText(subject)) {
						UsernamePasswordAuthenticationToken authentication =
							new UsernamePasswordAuthenticationToken(subject, null, Collections.emptyList());
						SecurityContextHolder.getContext().setAuthentication(authentication);
					}
				} catch (Exception ignored) {
					SecurityContextHolder.clearContext();
				}
			}
		});

		filterChain.doFilter(request, response);
	}

	private java.util.Optional<String> resolveToken(HttpServletRequest request) {
		String fromCookie = readAccessTokenCookie(request);
		if (StringUtils.hasText(fromCookie)) {
			return java.util.Optional.of(fromCookie);
		}

		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith(BEARER_PREFIX)) {
			String token = header.substring(BEARER_PREFIX.length()).trim();
			if (StringUtils.hasText(token)) {
				return java.util.Optional.of(token);
			}
		}

		return java.util.Optional.empty();
	}

	private static String readAccessTokenCookie(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		for (Cookie cookie : cookies) {
			if ("access_token".equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
				return cookie.getValue();
			}
		}
		return null;
	}

}
