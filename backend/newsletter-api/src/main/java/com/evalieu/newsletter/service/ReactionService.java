package com.evalieu.newsletter.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evalieu.newsletter.exception.ResourceNotFoundException;
import com.evalieu.newsletter.model.Post;
import com.evalieu.newsletter.model.Reaction;
import com.evalieu.newsletter.repository.PostRepository;
import com.evalieu.newsletter.repository.ReactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReactionService {

	private static final Set<String> ALLOWED_EMOJI = Set.of("❤️", "🔥", "😂", "👏", "😮", "😢");

	private final ReactionRepository reactionRepository;
	private final PostRepository postRepository;

	@Transactional
	public Post react(Long postId, String emoji, String sessionId) {
		if (!ALLOWED_EMOJI.contains(emoji)) {
			throw new IllegalArgumentException("Emoji not allowed");
		}
		String sid = sessionId == null ? "" : sessionId.trim();
		if (sid.isEmpty()) {
			throw new IllegalArgumentException("Session ID required");
		}
		postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

		reactionRepository.findByPostIdAndSessionId(postId, sid)
				.ifPresentOrElse(existing -> {
					existing.setEmoji(emoji);
					existing.setCreatedAt(Instant.now());
					reactionRepository.save(existing);
				}, () -> reactionRepository.save(Reaction.builder()
						.postId(postId)
						.emoji(emoji)
						.sessionId(sid)
						.createdAt(Instant.now())
						.build()));

		recalculateReactionCounts(postId);
		return postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
	}

	@Transactional
	public void unreact(Long postId, String sessionId) {
		String sid = sessionId == null ? "" : sessionId.trim();
		if (sid.isEmpty()) {
			return;
		}
		reactionRepository.deleteByPostIdAndSessionId(postId, sid);
		recalculateReactionCounts(postId);
	}

	private void recalculateReactionCounts(Long postId) {
		List<Object[]> grouped = reactionRepository.countByPostIdGroupByEmoji(postId);
		Map<String, Integer> counts = new HashMap<>();
		for (Object[] row : grouped) {
			if (row.length < 2 || row[0] == null || row[1] == null) {
				continue;
			}
			String emoji = String.valueOf(row[0]);
			long cntLong = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
			counts.put(emoji, (int) Math.min(cntLong, Integer.MAX_VALUE));
		}
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
		post.setReactionCounts(counts);
		postRepository.save(post);
	}
}
