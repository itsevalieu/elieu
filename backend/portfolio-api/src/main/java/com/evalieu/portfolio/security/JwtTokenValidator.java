package com.evalieu.portfolio.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtTokenValidator {

	private static final String CLAIM_TYP = "typ";

	private static final String TYP_ACCESS = "ACCESS";

	@Value("${jwt.secret}")
	private String secret;

	private SecretKey signingKey;

	@PostConstruct
	void init() {
		signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}

	public boolean validateAccessToken(String token) {
		if (!StringUtils.hasText(token)) {
			return false;
		}
		try {
			Claims claims = parseClaims(token);
			return TYP_ACCESS.equals(claims.get(CLAIM_TYP, String.class));
		} catch (JwtException | IllegalArgumentException ignored) {
			return false;
		}
	}

	public String extractSubject(String token) {
		return parseClaims(token).getSubject();
	}

	private Claims parseClaims(String token) {
		return Jwts.parser()
			.verifyWith(signingKey)
			.build()
			.parseSignedClaims(token)
			.getPayload();
	}

}
