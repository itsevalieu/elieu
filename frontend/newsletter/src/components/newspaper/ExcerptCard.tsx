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
              {post.title}
            </Link>
          </h3>
          {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
          <div className={styles.meta}>
            <span>{post.commentCount} comments</span>
            {reactions.length > 0 ? (
              <span className={styles.reactions}>
                {reactions.map(([emoji, count]) => (
                  <span key={emoji} className={styles.emojiCount}>
                    {emoji} {count}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
