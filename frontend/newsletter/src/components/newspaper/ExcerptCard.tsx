import Link from "next/link";
import Image from "next/image";
import type { Post } from "@evalieu/common";
import { leadExcerpt, topReactions } from "@/lib/postDisplay";
import styles from "./ExcerptCard.module.scss";

type CardVariant = "wide" | "full" | "default" | "compact";

type Props = {
  post: Post;
  variant?: CardVariant;
};

const EXCERPT_LEN: Record<CardVariant, number> = {
  full: 500,
  wide: 400,
  default: 200,
  compact: 90,
};

const MIN_LEN_FOR_COLS: Record<number, number> = { 2: 180, 3: 300 };

export function ExcerptCard({ post, variant = "default" }: Props) {
  const excerpt = leadExcerpt(post, EXCERPT_LEN[variant]);
  const reactions = topReactions(post.reactionCounts, 2);
  const cls = styles[variant] ?? "";

  if (variant === "full") {
    return (
      <article className={`${styles.card} ${cls}`}>
        <div className={styles.fullLayout}>
          {post.coverImageUrl ? (
            <div className={styles.fullImageCol}>
              <div className={styles.figure}>
                <Image
                  src={post.coverImageUrl}
                  alt=""
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>
              <p className={styles.caption}>{post.subcategoryName ?? post.categoryName}</p>
            </div>
          ) : null}
          <div className={styles.fullTextCol}>
            <p className={styles.overline}>
              <Link href={`/categories/${post.categorySlug}`}>
                {post.subcategoryName ?? post.categoryName}
              </Link>
            </p>
            <h3>
              <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
                {post.title}
              </Link>
            </h3>
            {excerpt ? (
              <p className={excerpt.length >= MIN_LEN_FOR_COLS[3] ? styles.multiColExcerpt : styles.excerpt}>
                {excerpt}
              </p>
            ) : null}
            <MetaRow reactions={reactions} commentCount={post.commentCount} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "wide") {
    return (
      <article className={`${styles.card} ${cls}`}>
        <p className={styles.overline}>
          <Link href={`/categories/${post.categorySlug}`}>
            {post.subcategoryName ?? post.categoryName}
          </Link>
        </p>
        <h3>
          <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
            {post.title}
          </Link>
        </h3>
        <div className={styles.wideBody}>
          {post.coverImageUrl ? (
            <div className={styles.wideImageCol}>
              <div className={styles.figure}>
                <Image
                  src={post.coverImageUrl}
                  alt=""
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 240px"
                />
              </div>
            </div>
          ) : null}
          <div className={styles.wideTextCol}>
            {excerpt ? (
              <p className={excerpt.length >= MIN_LEN_FOR_COLS[2] ? styles.wideExcerpt : styles.excerpt}>
                {excerpt}
              </p>
            ) : null}
            <MetaRow reactions={reactions} commentCount={post.commentCount} />
          </div>
        </div>
      </article>
    );
  }

  // default + compact — image on top, text below
  return (
    <article className={`${styles.card} ${cls}`}>
      {post.coverImageUrl ? (
        <Link href={`/posts/${post.slug}`} className={styles.figure}>
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </Link>
      ) : null}
      <p className={styles.overline}>
        <Link href={`/categories/${post.categorySlug}`}>
          {post.subcategoryName ?? post.categoryName}
        </Link>
      </p>
      <h3>
        <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
          {post.format === "embedded-game" ? (
            <span className={styles.gameBadge} title="Game">🎮</span>
          ) : null}
          {post.title}
        </Link>
      </h3>
      {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
      {variant !== "compact" ? (
        <MetaRow reactions={reactions} commentCount={post.commentCount} />
      ) : null}
    </article>
  );
}

function MetaRow({
  reactions,
  commentCount,
}: {
  reactions: [string, number][];
  commentCount: number;
}) {
  return (
    <div className={styles.meta}>
      {reactions.length > 0 ? (
        <span className={styles.reactions}>
          {reactions.map(([emoji, count]) => (
            <span key={emoji} className={styles.emojiCount}>
              {emoji} <span className={styles.countNum}>{count}</span>
            </span>
          ))}
        </span>
      ) : null}
      <span className={styles.commentLine}>
        <svg className={styles.msgIcon} width={12} height={12} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9h2.83L9 17.17V15h11V6H4Z"
          />
        </svg>
        <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
      </span>
    </div>
  );
}
