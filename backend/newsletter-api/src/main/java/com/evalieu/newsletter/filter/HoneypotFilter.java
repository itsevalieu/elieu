package com.evalieu.newsletter.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(5)
@RequiredArgsConstructor
public class HoneypotFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String contentType = request.getContentType();
        if (contentType == null || !contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            filterChain.doFilter(request, response);
            return;
        }

        CachedBodyHttpServletRequest wrapped = new CachedBodyHttpServletRequest(request);

        JsonNode root;
        byte[] raw = wrapped.getCachedBody();
        try {
            if (raw.length == 0) {
                filterChain.doFilter(wrapped, response);
                return;
            }
            root = objectMapper.readTree(raw);
        } catch (IOException e) {
            filterChain.doFilter(wrapped, response);
            return;
        }

        if (honeypotFilled(root)) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        filterChain.doFilter(wrapped, response);
    }

    private boolean honeypotFilled(JsonNode root) {
        if (root == null || !root.has("honeypot")) {
            return false;
        }
        JsonNode honeypot = root.get("honeypot");
        if (honeypot == null || honeypot.isNull()) {
            return false;
        }
        if (honeypot.isTextual()) {
            return !honeypot.asText().isBlank();
        }
        return true;
    }
}
