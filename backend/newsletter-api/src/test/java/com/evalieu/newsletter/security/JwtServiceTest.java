package com.evalieu.newsletter.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.TestPropertySource;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = JwtService.class)
@TestPropertySource(properties = {
	"jwt.secret=test-jwt-secret-must-be-at-least-thirty-two-chars-long",
	"jwt.secure-cookie=false",
	"jwt.cookie-same-site=Lax",
})
class JwtServiceTest {

	private static final String TEST_SECRET =
			"test-jwt-secret-must-be-at-least-thirty-two-chars-long";

	@Autowired
	private JwtService jwtService;

	@Test
	void generatesAccessToken() {
		String token = jwtService.generateAccessToken("admin@test.com");

		assertThat(token).isNotBlank();
		assertThat(jwtService.validateToken(token)).isTrue();
	}

	@Test
	void generatesRefreshToken() {
		String token = jwtService.generateRefreshToken("admin@test.com");

		assertThat(token).isNotBlank();
		assertThat(jwtService.validateRefreshToken(token)).isTrue();
		assertThat(jwtService.validateToken(token)).isFalse();
	}

	@Test
	void validatesAccessToken() {
		String token = jwtService.generateAccessToken("reader@test.com");

		assertThat(jwtService.validateToken(token)).isTrue();
	}

	@Test
	void rejectsExpiredAccessToken() {
		var signingKey =
				Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));

		String expired =
				Jwts.builder().subject("x@test.com").claim("typ", "ACCESS").issuedAt(
						Date.from(Instant.now().minus(Duration.ofHours(2))))
					.expiration(Date.from(
						Instant.now().minus(Duration.ofHours(1))))
					.signWith(signingKey)
					.compact();

		assertThat(jwtService.validateToken(expired)).isFalse();
	}

	@Test
	void validatesRefreshToken() {
		String token = jwtService.generateRefreshToken("admin@test.com");

		assertThat(jwtService.validateRefreshToken(token)).isTrue();
	}

	@Test
	void extractEmailReturnsSubject() {
		String token = jwtService.generateAccessToken("scoped@test.com");

		assertThat(jwtService.extractEmail(token)).isEqualTo("scoped@test.com");
	}

	@Test
	void createAccessTokenCookieSetsHttpOnlyPathSameSite() {
		String token = jwtService.generateAccessToken("cookie@test.com");
		ResponseCookie cookie = jwtService.createAccessTokenCookie(token);

		assertThat(cookie.getName()).isEqualTo("access_token");
		assertThat(cookie.getValue()).isEqualTo(token);
		assertThat(cookie.isHttpOnly()).isTrue();
		assertThat(cookie.getPath()).isEqualTo("/");
		assertThat(cookie.getSameSite()).isEqualTo("Lax");
	}

	@Test
	void createRefreshTokenCookieMatchesRefreshExpectations() {
		String token = jwtService.generateRefreshToken("cookie@test.com");
		ResponseCookie cookie = jwtService.createRefreshTokenCookie(token);

		assertThat(cookie.getName()).isEqualTo("refresh_token");
		assertThat(cookie.getValue()).isEqualTo(token);
		assertThat(cookie.isHttpOnly()).isTrue();
		assertThat(cookie.getPath()).isEqualTo("/");
		assertThat(cookie.getSameSite()).isEqualTo("Lax");
		assertThat(cookie.getMaxAge().toSeconds()).isEqualTo(
				Duration.ofDays(7).getSeconds());
	}

	@Test
	void createLogoutCookiesClearWithMaxAgeZero() {
		ResponseCookie[] cookies = jwtService.createLogoutCookies();

		assertThat(cookies).hasSize(2);
		assertThat(cookies[0].getMaxAge().getSeconds()).isZero();
		assertThat(cookies[1].getMaxAge().getSeconds()).isZero();
		assertThat(cookies[0].getValue()).isEmpty();
		assertThat(cookies[1].getValue()).isEmpty();
		assertThat(cookies[0].isHttpOnly()).isTrue();
		assertThat(cookies[1].isHttpOnly()).isTrue();
	}

}
