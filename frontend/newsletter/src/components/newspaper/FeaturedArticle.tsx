import Link from "next/link";
import Image from "next/image";
import type { Post } from "@evalieu/common";
import { leadExcerpt } from "@/lib/postDisplay";
import styles from "./FeaturedArticle.module.scss";
import excerptStyles from "./ExcerptCard.module.scss";

type Props = { post: Post };

export function FeaturedArticle({ post }: Props) {
  const excerpt = leadExcerpt(post, 420);
  return (
    <article className={styles.newspaper}>
      <p className={excerptStyles.overline}>
        <Link href={`/categories/${post.categorySlug}`}>{post.categoryName}</Link>
      </p>
      <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
        <h2 className={styles.headline}>{post.title}</h2>
      </Link>

      {post.coverImageUrl ? (
        <div className={styles.cover}>
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            className={styles.coverImage}
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      ) : null}

      {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
      <Link href={`/posts/${post.slug}`} className={styles.readMore}>
        Read more →
      </Link>
    </article>
  );
}
