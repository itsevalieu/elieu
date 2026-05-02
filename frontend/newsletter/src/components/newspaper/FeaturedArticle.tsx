import Link from "next/link";
import Image from "next/image";
import type { Post } from "@evalieu/common";
import { leadExcerpt } from "@/lib/postDisplay";
import styles from "./FeaturedArticle.module.scss";

type Props = { post: Post };

export function FeaturedArticle({ post }: Props) {
  const excerpt = leadExcerpt(post, 350);
  return (
    <article className={styles.article}>
      <p className={styles.overline}>
        <Link href={`/categories/${post.categorySlug}`}>
          {post.subcategoryName ?? post.categoryName}
        </Link>
      </p>
      <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
        <h2 className={styles.headline}>{post.title}</h2>
      </Link>
      <div className={styles.body}>
        <div className={styles.textCol}>
          {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
          <Link href={`/posts/${post.slug}`} className={styles.readMore}>
            Read more →
          </Link>
        </div>
        {post.coverImageUrl ? (
          <figure className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>
            <figcaption className={styles.caption}>
              {post.excerpt?.slice(0, 80) ?? post.title}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </article>
  );
}
