import { Fragment, type ReactNode } from "react";
import type { Category, Post } from "@evalieu/common";
import { partitionMagazineFrontPage } from "@/lib/magazineFrontPage";
import { MagazineHero } from "./MagazineHero";
import { MagazineCategoryStrip } from "./MagazineCategoryStrip";
import { MagazineCard } from "./MagazineCard";
import styles from "./MagazineFrontPageGrid.module.scss";

type Props = {
  posts: Post[];
  categories: Category[];
  /** Insert between the first two category excerpt groups when there are ≥2 strips. */
  betweenStripSlot?: ReactNode;
};

export function MagazineFrontPageGrid({ posts, categories, betweenStripSlot }: Props) {
  const { featured, strips, remainder } = partitionMagazineFrontPage(
    posts,
    categories,
  );

  return (
    <div className={styles.grid}>
      {featured ? <MagazineHero post={featured} /> : null}

      {strips.map((s, i) => (
        <Fragment key={s.slug}>
          <MagazineCategoryStrip
            categorySlug={s.slug}
            categoryName={s.name}
            posts={s.posts}
          />
          {i === 0 && strips.length >= 2 && betweenStripSlot ? betweenStripSlot : null}
        </Fragment>
      ))}

      {remainder.length > 0 ? (
        <section className={styles.remainder} aria-label="More stories">
          <div className={styles.remainderGrid}>
            {remainder.map((p) => (
              <MagazineCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
