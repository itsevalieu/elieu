package com.evalieu.newsletter.config;

import com.evalieu.newsletter.security.JwtAuthenticationFilter;
import com.evalieu.newsletter.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService) {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsSource()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**", "/api/issues/**",
                    "/api/categories/**", "/api/hobbies/**", "/api/recipes/**",
                    "/api/tracking/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/posts/*/comments",
                    "/api/posts/*/reactions", "/api/subscribe",
                    "/api/recommendations").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/posts/*/reactions").permitAll()
                .requestMatchers("/api/subscribe/**", "/api/unsubscribe").permitAll()
                .requestMatchers("/api/webhooks/**").permitAll()
                .requestMatchers("/api/track/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().denyAll()
            )
            .headers(headers -> headers.frameOptions(f -> f.sameOrigin()));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
            "https://evalieu.com", "https://newsletter.evalieu.com", "https://admin.evalieu.com"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
