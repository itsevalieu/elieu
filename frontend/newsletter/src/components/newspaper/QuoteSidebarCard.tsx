import Link from "next/link";
import type { Post } from "@evalieu/common";
import styles from "./QuoteSidebarCard.module.scss";

type Props = { post: Post };

export function QuoteSidebarCard({ post }: Props) {
  const text = post.body?.slice(0, 120).trimEnd() ?? "";
  const display = text.length >= 120 ? `${text}…` : text;

  return (
    <article className={styles.card}>
      <Link href={`/posts/${post.slug}`} className={styles.link}>
        <blockquote className={styles.quote}>
          &ldquo;{display}&rdquo;
        </blockquote>
        {post.quoteAuthor ? (
          <cite className={styles.author}>— {post.quoteAuthor}</cite>
        ) : null}
      </Link>
    </article>
  );
}
