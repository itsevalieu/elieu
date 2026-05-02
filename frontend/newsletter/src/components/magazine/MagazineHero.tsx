import Image from "next/image";
import Link from "next/link";
import type { Post } from "@evalieu/common";
import { leadExcerpt } from "@/lib/postDisplay";
import { categoryColors } from "@/lib/categoryColors";
import styles from "./MagazineHero.module.scss";

type Props = { post: Post };

export function MagazineHero({ post }: Props) {
  const excerpt = leadExcerpt(post, 220);
  const accent = categoryColors[post.categorySlug] ?? "hsl(220, 40%, 45%)";

  return (
    <section className={styles.hero} aria-labelledby="magazine-hero-heading">
      <div className={styles.media}>
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            className={styles.image}
            sizes="100vw"
            priority
          />
        ) : null}
        <div className={styles.gradient} />
      </div>
      <div className={styles.content}>
        <Link
          href={`/categories/${post.categorySlug}`}
          className={styles.badge}
          style={{ borderColor: accent, color: accent }}
        >
          {post.subcategoryName ?? post.categoryName}
        </Link>
        <h2 id="magazine-hero-heading" className={styles.headline}>
          <Link href={`/posts/${post.slug}`} className={styles.headlineLink}>
            {post.title}
          </Link>
        </h2>
        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
      </div>
    </section>
  );
}
