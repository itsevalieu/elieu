import Link from "next/link";
import Image from "next/image";
import type { Post } from "@evalieu/common";
import { leadExcerpt, topReactions } from "@/lib/postDisplay";
import styles from "./ExcerptCard.module.scss";

type Props = { post: Post };

export function ExcerptCard({ post }: Props) {
  const excerpt = leadExcerpt(post, 200);
  const reactions = topReactions(post.reactionCounts, 2);

  return (
    <article className={styles.card}>
      <div
        className={`${styles.inner} ${post.coverImageUrl ? styles.innerWithImage : ""}`}
      >
        {post.coverImageUrl ? (
          <div className={styles.imageCol}>
            <Link href={`/posts/${post.slug}`} className={styles.figure}>
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </Link>
          </div>
        ) : null}
        <div className={styles.textCol}>
          <p className={styles.overline}>
            <Link href={`/categories/${post.categorySlug}`}>{post.categoryName}</Link>
          </p>
          <h3>
            <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
              {post.format === "embedded-game" ? (
                <span className={styles.gameBadge} title="Game">
                  🎮
                </span>
              ) : null}
              {post.title}
            </Link>
          </h3>
          {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
          <div className={styles.meta}>
            {reactions.length > 0 ? (
              <span className={styles.reactions}>
                {reactions.map(([emoji, count]) => (
                  <span key={emoji} className={styles.emojiCount}>
                    {emoji}{" "}
                    <span className={styles.countNum}>{count}</span>
                  </span>
                ))}
              </span>
            ) : null}
            <span className={styles.commentLine}>
              <svg className={styles.msgIcon} width={14} height={14} viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9h2.83L9 17.17V15h11V6H4Z"
                />
              </svg>
              <span>
                {post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
