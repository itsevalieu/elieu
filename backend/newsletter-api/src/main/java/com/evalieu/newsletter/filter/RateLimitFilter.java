package com.evalieu.newsletter.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Order(1)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int DEFAULT_STATUS = 429;
    private static final String LOGIN_PATH = "/api/auth/login";

    private final ObjectMapper objectMapper;

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
        .maximumSize(200_000)
        .expireAfterAccess(Duration.ofHours(2))
        .build();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri == null || !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        RateRule rule = resolveRule(path, method);
        String clientIp = clientIp(request);

        Bucket bucket = buckets.get(clientIp + "|" + rule.name(), ignored -> bucketFor(rule));
        boolean allowed = bucket.tryConsume(1);
        if (!allowed) {
            writeRateLimited(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeRateLimited(HttpServletResponse response) throws IOException {
        response.setStatus(DEFAULT_STATUS);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Too many requests");
        body.put("status", DEFAULT_STATUS);
        body.put("timestamp", java.time.OffsetDateTime.now().toString());
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private RateRule resolveRule(String path, String method) {
        if (LOGIN_PATH.equals(path) && "POST".equalsIgnoreCase(method)) {
            return RateRule.LOGIN;
        }
        if ("POST".equalsIgnoreCase(method) && path.matches("/api/posts/.+/comments")) {
            return RateRule.COMMENTS;
        }
        if ("POST".equalsIgnoreCase(method) && "/api/subscribe".equals(path)) {
            return RateRule.SUBSCRIBE;
        }
        if ("POST".equalsIgnoreCase(method) && path.matches("/api/posts/.+/reactions")) {
            return RateRule.REACTIONS;
        }
        if ("POST".equalsIgnoreCase(method)
            && ("/api/recommendations".equals(path) || path.startsWith("/api/recommendations/"))) {
            return RateRule.RECOMMENDATIONS;
        }
        return RateRule.DEFAULT;
    }

    private Bucket bucketFor(RateRule rule) {
        return switch (rule) {
            case LOGIN ->
                Bucket.builder()
                    .addLimit(Bandwidth.classic(
                        5, Refill.intervally(5, Duration.ofMinutes(15))))
                    .build();
            case COMMENTS, SUBSCRIBE, RECOMMENDATIONS ->
                Bucket.builder()
                    .addLimit(Bandwidth.classic(
                        3, Refill.intervally(3, Duration.ofHours(1))))
                    .build();
            case REACTIONS ->
                Bucket.builder()
                    .addLimit(Bandwidth.classic(
                        20, Refill.intervally(20, Duration.ofHours(1))))
                    .build();
            default ->
                Bucket.builder()
                    .addLimit(Bandwidth.classic(
                        100, Refill.intervally(100, Duration.ofMinutes(1))))
                    .build();
        };
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String[] parts = forwarded.split(",");
            String first = parts[0].trim();
            if (StringUtils.hasText(first)) {
                return first;
            }
        }
        String addr = request.getRemoteAddr();
        return StringUtils.hasText(addr) ? addr : "unknown";
    }

    private enum RateRule {
        LOGIN,
        COMMENTS,
        SUBSCRIBE,
        REACTIONS,
        RECOMMENDATIONS,
        DEFAULT
    }
}
