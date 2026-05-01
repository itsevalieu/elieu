import Image from "next/image";
import Link from "next/link";
import type { Post } from "@evalieu/common";
import { leadExcerpt, topReactions } from "@/lib/postDisplay";
import { categoryColors } from "@/lib/categoryColors";
import styles from "./MagazineCard.module.scss";

type Props = { post: Post };

export function MagazineCard({ post }: Props) {
  const excerpt = leadExcerpt(post, 140);
  const reactions = topReactions(post.reactionCounts, 4);
  const accent = categoryColors[post.categorySlug] ?? "hsl(220, 40%, 45%)";

  return (
    <article className={styles.card}>
      <Link href={`/posts/${post.slug}`} className={styles.thumbWrap}>
        <div className={styles.thumb}>
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 360px"
            />
          ) : (
            <div className={styles.thumbPlaceholder} style={{ background: accent }} />
          )}
        </div>
      </Link>
      <div className={styles.body}>
        <Link
          href={`/categories/${post.categorySlug}`}
          className={styles.badge}
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {post.categoryName}
        </Link>
        <h3 className={styles.headline}>
          <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
            {post.title}
          </Link>
        </h3>
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
        <div className={styles.meta}>
          {reactions.length > 0 ? (
            <span className={styles.reactions}>
              {reactions.map(([emoji, count]) => (
                <span key={emoji} className={styles.emojiCount}>
                  {emoji} {count}
                </span>
              ))}
            </span>
          ) : null}
          <span className={styles.comments}>{post.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
