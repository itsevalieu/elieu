package com.evalieu.portfolio.config;

import com.evalieu.portfolio.security.JwtTokenValidator;
import com.evalieu.portfolio.security.JwtValidationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
	public JwtValidationFilter jwtValidationFilter(JwtTokenValidator jwtTokenValidator) {
		return new JwtValidationFilter(jwtTokenValidator);
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, JwtValidationFilter jwtValidationFilter)
		throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.cors(cors -> cors.configurationSource(corsSource()))
			.addFilterBefore(jwtValidationFilter, UsernamePasswordAuthenticationFilter.class)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/admin/**").authenticated()
				.requestMatchers(HttpMethod.GET, "/api/projects/**", "/api/achievements/**").permitAll()
				.requestMatchers("/api/health").permitAll()
				.requestMatchers("/actuator/health").permitAll()
				.requestMatchers("/h2-console/**").permitAll()
				.requestMatchers("/error").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/projects", "/api/projects/**").authenticated()
				.requestMatchers(HttpMethod.PUT, "/api/projects", "/api/projects/**").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/projects", "/api/projects/**").authenticated()
				.anyRequest().denyAll()
			)
			.headers(headers -> headers.frameOptions(f -> f.sameOrigin()));
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"https://evalieu.com",
			"https://newsletter.evalieu.com",
			"https://admin.evalieu.com"
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
