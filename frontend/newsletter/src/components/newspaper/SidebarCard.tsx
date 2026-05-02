import Link from "next/link";
import Image from "next/image";
import type { Post } from "@evalieu/common";
import styles from "./SidebarCard.module.scss";

type Props = {
  post: Post;
  showImage?: boolean;
};

export function SidebarCard({ post, showImage = false }: Props) {
  const blurb =
    post.excerpt?.slice(0, 100).trimEnd() ??
    post.body?.slice(0, 100).trimEnd() ??
    "";
  const display = blurb.length >= 100 ? `${blurb}…` : blurb;

  if (showImage && post.coverImageUrl) {
    return (
      <article className={styles.imageCard}>
        <Link href={`/posts/${post.slug}`} className={styles.imageLink}>
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            className={styles.coverImage}
            sizes="260px"
          />
          <div className={styles.overlay}>
            <span className={styles.imageOverline}>
              {post.subcategoryName ?? post.categoryName}
            </span>
            <h4 className={styles.imageTitle}>{post.title}</h4>
            {display ? <p className={styles.imageBlurb}>{display}</p> : null}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <p className={styles.overline}>
        {post.subcategoryName ?? post.categoryName}
      </p>
      <h4 className={styles.title}>
        <Link href={`/posts/${post.slug}`} className={styles.link}>
          {post.title}
        </Link>
      </h4>
      {display ? <p className={styles.blurb}>{display}</p> : null}
    </article>
  );
}
