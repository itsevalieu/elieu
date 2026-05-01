"use client";

import { useCallback, useEffect, useState } from "react";
import type { Comment } from "@evalieu/common";
import { getComments, submitComment } from "@/lib/api";
import { formatRelativePast } from "@/lib/formatRelativePast";
import styles from "./CommentSection.module.scss";

const PAGE_SIZE = 50;

type Props = {
  postId: number;
  slug: string;
};

export function CommentSection({ postId, slug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending">("idle");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (nextPage === 0) setLoadingInitial(true);
      else setLoadingMore(true);

      try {
        const data = await getComments(postId, nextPage, PAGE_SIZE);
        setTotalPages(Math.max(data.totalPages, 0));
        setComments((prev) => {
          const chunk = append ? [...prev] : [];
          const seen = new Set(chunk.map((c) => c.id));
          for (const row of data.content) {
            if (!seen.has(row.id)) {
              seen.add(row.id);
              chunk.push(row);
            }
          }
          return chunk;
        });
        setPage(nextPage);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  const shouldShowLoadMore = totalPages > 0 && page + 1 < totalPages;

  const onLoadMore = () => void loadPage(page + 1, true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitSuccess(false);

    const payload: Record<string, unknown> = {
      displayName: displayName.trim(),
      body: commentBody.trim(),
      honeypot: honeypot.trim(),
    };
    const em = email.trim();
    if (em) payload.email = em;

    setSubmitStatus("sending");

    try {
      await submitComment(postId, payload);
      setSubmitSuccess(true);
      setDisplayName("");
      setEmail("");
      setCommentBody("");
      setHoneypot("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitStatus("idle");
    }
  };

  return (
    <section
      className={styles.section}
      aria-labelledby="comments-heading"
      data-post-slug={slug}
    >
      <h2 id="comments-heading" className={styles.heading}>
        Reader comments
      </h2>

      {loadingInitial ? (
        <p className={styles.empty}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>No comments published yet.</p>
      ) : (
        <ul className={styles.commentsList}>
          {comments.map((row) => (
            <li key={row.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.author}>{row.authorName}</span>
                <time dateTime={row.createdAt} className={styles.time}>
                  {formatRelativePast(row.createdAt)}
                </time>
              </div>
              <p className={styles.body}>{row.body}</p>
            </li>
          ))}
        </ul>
      )}

      {shouldShowLoadMore ? (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMore}
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      <h3 className={styles.subheading}>Leave a comment</h3>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={`${styles.fieldRow} ${styles.fieldRowSplit}`}>
          <div className={`${styles.fieldRow}`}>
            <label className={styles.label} htmlFor={`comment-name-${postId}`}>
              Name *
            </label>
            <input
              id={`comment-name-${postId}`}
              className={styles.input}
              name="displayName"
              required
              maxLength={100}
              value={displayName}
              autoComplete="name"
              onChange={(evt) => setDisplayName(evt.target.value)}
            />
          </div>
          <div className={`${styles.fieldRow}`}>
            <label className={styles.label} htmlFor={`comment-email-${postId}`}>
              Email *
            </label>
            <input
              id={`comment-email-${postId}`}
              className={styles.input}
              name="email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
            />
            <p className={styles.fieldNote}>Your email won&apos;t be published.</p>
          </div>
        </div>

        <div className={`${styles.fieldRow}`}>
          <label className={styles.label} htmlFor={`comment-body-${postId}`}>
            Comment *
          </label>
          <textarea
            id={`comment-body-${postId}`}
            name="body"
            className={styles.textarea}
            required
            maxLength={5000}
            rows={7}
            value={commentBody}
            onChange={(evt) => setCommentBody(evt.target.value)}
          />
        </div>

        <label className={`${styles.honeypot}`}>
          Leave this blank
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(evt) => setHoneypot(evt.target.value)}
          />
        </label>

        <button
          type="submit"
          className={styles.submit}
          disabled={submitStatus === "sending"}
        >
          {submitStatus === "sending" ? "Sending…" : "Submit"}
        </button>

        {submitSuccess ? (
          <p className={styles.success} role="status">
            Thanks! Your comment will appear after review.
          </p>
        ) : null}
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
