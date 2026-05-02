package com.evalieu.newsletter.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostSchedulerService {

	private final PostService postService;

	@Scheduled(fixedRate = 60_000)
	public void publishDuePosts() {
		int count = postService.publishScheduledPosts();
		if (count > 0) {
			log.info("Scheduled publish: {} post(s) went live", count);
		}
	}
}
