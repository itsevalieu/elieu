package com.evalieu.newsletter.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final String CLAIM_TYP = "typ";
    private static final String TYP_ACCESS = "ACCESS";
    private static final String TYP_REFRESH = "REFRESH";
    private static final String ACCESS_COOKIE = "access_token";
    private static final String REFRESH_COOKIE = "refresh_token";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.secure-cookie:false}")
    private boolean secureCookie;

    private SecretKey signingKey;

    @PostConstruct
    void init() {
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(email)
            .claim(CLAIM_TYP, TYP_ACCESS)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(Duration.ofHours(1))))
            .signWith(signingKey)
            .compact();
    }

    public String generateRefreshToken(String email) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(email)
            .claim(CLAIM_TYP, TYP_REFRESH)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(Duration.ofDays(7))))
            .signWith(signingKey)
            .compact();
    }

    public boolean validateToken(String token) {
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

    public boolean validateRefreshToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            Claims claims = parseClaims(token);
            return TYP_REFRESH.equals(claims.get(CLAIM_TYP, String.class));
        } catch (JwtException | IllegalArgumentException ignored) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from(ACCESS_COOKIE, token)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofHours(1))
            .build();
    }

    public ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from(REFRESH_COOKIE, token)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofDays(7))
            .build();
    }

    public ResponseCookie[] createLogoutCookies() {
        ResponseCookie clearedAccess = ResponseCookie.from(ACCESS_COOKIE, "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofSeconds(0))
            .build();
        ResponseCookie clearedRefresh = ResponseCookie.from(REFRESH_COOKIE, "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofSeconds(0))
            .build();
        return new ResponseCookie[]{clearedAccess, clearedRefresh};
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
