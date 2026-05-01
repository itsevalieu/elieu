package com.evalieu.newsletter.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

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
import com.evalieu.newsletter.dto.PostRequest;
import com.evalieu.newsletter.model.AdminUser;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.repository.AdminUserRepository;
import com.evalieu.newsletter.repository.PostRepository;
import com.evalieu.newsletter.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import(TestcontainersConfiguration.class)
class PostControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private PostRepository postRepository;

	@Autowired
	private AdminUserRepository adminUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@BeforeEach
	void seedPosts() {
		postRepository.deleteAll();
		postRepository.save(Post.builder().title("Visible Post Title")
				.slug("visible-post-title").body("hello").status("published")
				.commentCount(0).viewCount(0).reactionCounts(Map.of()).build());
	}

	@Test
	void listPublishedReturnsPublishedPosts() throws Exception {
		mockMvc.perform(get("/api/posts")).andExpect(status().isOk()).andExpect(
				jsonPath("$.content").isArray()).andExpect(
						jsonPath("$.content[0].slug").value("visible-post-title"));
	}

	@Test
	void getPublishedBySlugReturnsPost() throws Exception {
		mockMvc.perform(get("/api/posts/visible-post-title")).andExpect(
				status().isOk()).andExpect(
						jsonPath("$.slug").value("visible-post-title")).andExpect(
								jsonPath("$.title").value("Visible Post Title"));
	}

	@Test
	void createAdminPostRequiresAuth() throws Exception {
		PostRequest req = new PostRequest();
		req.setTitle("Admin Only");
		req.setBody("secret");

		int sc = mockMvc.perform(post("/api/admin/posts").contentType(
				MediaType.APPLICATION_JSON).content(
					objectMapper.writeValueAsBytes(req))).andReturn().getResponse().getStatus();

		assertThat(sc).isIn(401, 403);
	}

	@Test
	void createAdminPostWithJwtCreatesPost() throws Exception {
		adminUserRepository.deleteAll();
		adminUserRepository.save(AdminUser.builder().email("writer@test.com")
				.passwordHash(passwordEncoder.encode("x"))
				.createdAt(java.time.Instant.now()).build());
		String token = jwtService.generateAccessToken("writer@test.com");

		PostRequest req = new PostRequest();
		req.setTitle("From Jwt");
		req.setBody("body text");

		String json = mockMvc.perform(post("/api/admin/posts").header(
				HttpHeaders.AUTHORIZATION, "Bearer " + token).contentType(
					MediaType.APPLICATION_JSON).content(
						objectMapper.writeValueAsBytes(req))).andExpect(
							status().isOk()).andExpect(
								jsonPath("$.slug").value("from-jwt")).andReturn().getResponse().getContentAsString();

		assertThat(json).contains("From Jwt");
	}

}
